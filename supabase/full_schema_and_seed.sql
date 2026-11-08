-- ==============================================================================
-- FULL SETUP: MIGRATE FRESH + SEED (ALL-IN-ONE)
-- Jalankan file ini untuk reset total & build ulang database Supabase (Fresh & Seed)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. CLEANUP (MIGRATE FRESH: Drop tabel lama jika ada di public & private)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.post_tags CASCADE;
DROP TABLE IF EXISTS public.post_categories CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.media CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.role_has_permissions CASCADE;
DROP TABLE IF EXISTS public.user_has_roles CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.permission_groups CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

DROP TABLE IF EXISTS private.role_has_permissions CASCADE;
DROP TABLE IF EXISTS private.user_has_roles CASCADE;
DROP TABLE IF EXISTS private.permissions CASCADE;
DROP TABLE IF EXISTS private.permission_groups CASCADE;
DROP TABLE IF EXISTS private.roles CASCADE;
DROP TABLE IF EXISTS private.settings CASCADE;
DROP TABLE IF EXISTS private.audit_logs CASCADE;

-- Hapus SEMUA data user dari auth.users (otomatis cascade ke auth.identities, sessions, tokens)
-- sehingga database benar-benar bersih dan hanya data seed yang akan dibuat kembali
DELETE FROM auth.users;

-- ------------------------------------------------------------------------------
-- 1. SETUP SCHEMA PRIVATE & SECURITY
-- ------------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS private;
REVOKE USAGE ON SCHEMA private FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA private FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA private FROM anon, authenticated;

GRANT USAGE ON SCHEMA private TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA private TO postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA private TO postgres, service_role;

-- ------------------------------------------------------------------------------
-- 2. PROFILES & RBAC
-- ------------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  banned_at TIMESTAMPTZ,
  banned_until TIMESTAMPTZ,
  banned_reason TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_profiles_not_deleted ON public.profiles (id) WHERE deleted_at IS NULL;

-- Re-sync all existing auth users into public.profiles
INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', email),
  raw_user_meta_data->>'avatar_url',
  created_at,
  updated_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

-- RBAC Tables in private schema
CREATE TABLE private.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE private.permission_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE private.permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES private.permission_groups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE private.user_has_roles (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES private.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE private.role_has_permissions (
  role_id UUID REFERENCES private.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES private.permissions(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_permissions_group_id ON private.permissions(group_id);
CREATE INDEX idx_user_has_roles_role_id ON private.user_has_roles(role_id);
CREATE INDEX idx_user_has_roles_user_id ON private.user_has_roles(user_id);
CREATE INDEX idx_role_has_permissions_permission_id ON private.role_has_permissions(permission_id);
CREATE INDEX idx_role_has_permissions_role_id ON private.role_has_permissions(role_id);

-- RBAC Functions (Security Definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = private, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM private.user_has_roles uhr
    JOIN private.roles r ON r.id = uhr.role_id
    WHERE uhr.user_id = _user_id AND r.slug = _role_slug
  );
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = private, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM private.user_has_roles uhr
    JOIN private.role_has_permissions rhp ON rhp.role_id = uhr.role_id
    JOIN private.permissions p ON p.id = rhp.permission_id
    JOIN private.roles r ON r.id = uhr.role_id
    WHERE uhr.user_id = _user_id
      AND (p.slug = _permission_slug OR r.slug = 'super-admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.authorize(_permission_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = private, public
AS $$
  SELECT public.has_permission((SELECT auth.uid()), _permission_slug);
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = private, public
AS $$
  SELECT jsonb_build_object('name', r.name, 'slug', r.slug)
  FROM private.user_has_roles uhr
  JOIN private.roles r ON r.id = uhr.role_id
  WHERE uhr.user_id = (SELECT auth.uid())
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_permission(UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.authorize(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated, service_role;

-- Auth Trigger Sync User Baru ke Profile & Default Role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
DECLARE
  default_role_id UUID;
  requested_role_slug TEXT;
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();

  requested_role_slug := COALESCE(NEW.raw_user_meta_data->>'role', 'viewer');

  IF NEW.email = 'admin@ailabs.com' THEN
    requested_role_slug := 'super-admin';
  ELSIF NEW.email = 'editor@ailabs.com' THEN
    requested_role_slug := 'editor';
  END IF;

  SELECT id INTO default_role_id
  FROM private.roles
  WHERE slug = requested_role_slug;

  IF default_role_id IS NULL THEN
    SELECT id INTO default_role_id FROM private.roles WHERE slug = 'viewer';
  END IF;

  IF default_role_id IS NOT NULL THEN
    INSERT INTO private.user_has_roles (user_id, role_id)
    VALUES (NEW.id, default_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. POSTS (0002)
-- ------------------------------------------------------------------------------
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content JSONB,
  excerpt TEXT,
  featured_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_not_deleted ON public.posts (created_at DESC) WHERE deleted_at IS NULL;

-- ------------------------------------------------------------------------------
-- 4. PAGES (0003)
-- ------------------------------------------------------------------------------
CREATE TABLE public.pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_pages_not_deleted ON public.pages (created_at DESC) WHERE deleted_at IS NULL;

-- ------------------------------------------------------------------------------
-- 5. CATEGORIES & TAGS (0004)
-- ------------------------------------------------------------------------------
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.post_categories (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

CREATE TABLE public.post_tags (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ------------------------------------------------------------------------------
-- 6. MEDIA (0005)
-- ------------------------------------------------------------------------------
CREATE TABLE public.media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  alt_text TEXT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. SETTINGS & AUDIT LOGS (private schema)
-- ------------------------------------------------------------------------------
CREATE TABLE private.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE private.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.permission_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.user_has_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.role_has_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated read, owner update
CREATE POLICY "Profiles read" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id);

-- Public read for published posts & pages (excluding soft-deleted)
CREATE POLICY "Public read published posts" ON public.posts FOR SELECT USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY "Public read published pages" ON public.pages FOR SELECT USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read tags" ON public.tags FOR SELECT USING (deleted_at IS NULL);

-- RBAC managed actions
CREATE POLICY "Posts manage" ON public.posts FOR ALL TO authenticated USING (public.authorize('posts.create') OR (SELECT auth.uid()) = author_id);
CREATE POLICY "Pages manage" ON public.pages FOR ALL TO authenticated USING (public.authorize('pages.manage'));

-- Private tables admin management
CREATE POLICY "Admins manage roles" ON private.roles FOR ALL TO authenticated USING (public.authorize('roles.manage')) WITH CHECK (public.authorize('roles.manage'));
CREATE POLICY "Admins manage permission groups" ON private.permission_groups FOR ALL TO authenticated USING (public.authorize('roles.manage')) WITH CHECK (public.authorize('roles.manage'));
CREATE POLICY "Admins manage permissions" ON private.permissions FOR ALL TO authenticated USING (public.authorize('roles.manage')) WITH CHECK (public.authorize('roles.manage'));
CREATE POLICY "Admins manage user roles" ON private.user_has_roles FOR ALL TO authenticated USING (public.authorize('roles.manage')) WITH CHECK (public.authorize('roles.manage'));
CREATE POLICY "Admins manage role permissions" ON private.role_has_permissions FOR ALL TO authenticated USING (public.authorize('roles.manage')) WITH CHECK (public.authorize('roles.manage'));
CREATE POLICY "Settings manage" ON private.settings FOR ALL TO authenticated USING (public.authorize('settings.manage'));

-- ------------------------------------------------------------------------------
-- 9. SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO public.categories (name, slug, description)
VALUES 
  ('Teknologi', 'teknologi', 'Artikel seputar teknologi dan coding'),
  ('Tutorial', 'tutorial', 'Panduan langkah demi langkah')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO private.roles (name, slug, description, is_system)
VALUES
  ('Super Admin', 'super-admin', 'Akses penuh ke seluruh sistem tanpa batas', TRUE),
  ('Administrator', 'admin', 'Mengelola seluruh konten, pengguna, dan pengaturan situs', TRUE),
  ('Editor', 'editor', 'Dapat membuat, mengedit, dan mempublikasikan artikel maupun halaman', TRUE),
  ('Author', 'author', 'Hanya dapat membuat dan mengedit artikel miliknya sendiri', TRUE),
  ('Viewer', 'viewer', 'Hanya dapat melihat konten dashboard tanpa izin modifikasi', TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO private.permission_groups (name, slug, description)
VALUES
  ('Posts Management', 'posts', 'Izin pengelolaan artikel dan postingan blog'),
  ('Pages Management', 'pages', 'Izin pengelolaan halaman statis'),
  ('Categories & Tags', 'taxonomies', 'Izin pengelolaan kategori dan tag'),
  ('Media Library', 'media', 'Izin pengelolaan berkas dan gambar'),
  ('Users & Roles', 'users', 'Izin manajemen profil pengguna, peran, dan hak akses'),
  ('Settings & SEO', 'settings', 'Izin konfigurasi umum situs dan SEO')
ON CONFLICT (slug) DO NOTHING;

WITH group_ids AS (
  SELECT id, slug FROM private.permission_groups
)
INSERT INTO private.permissions (group_id, name, slug, description)
VALUES
  ((SELECT id FROM group_ids WHERE slug = 'posts'), 'Lihat Posts', 'posts.read', 'Melihat daftar dan detail posts'),
  ((SELECT id FROM group_ids WHERE slug = 'posts'), 'Buat Post', 'posts.create', 'Membuat draft artikel baru'),
  ((SELECT id FROM group_ids WHERE slug = 'posts'), 'Edit Post', 'posts.update', 'Mengedit konten artikel'),
  ((SELECT id FROM group_ids WHERE slug = 'posts'), 'Hapus Post', 'posts.delete', 'Menghapus artikel'),
  ((SELECT id FROM group_ids WHERE slug = 'posts'), 'Publikasikan Post', 'posts.publish', 'Mempublikasikan artikel'),
  ((SELECT id FROM group_ids WHERE slug = 'pages'), 'Lihat Pages', 'pages.read', 'Melihat daftar halaman'),
  ((SELECT id FROM group_ids WHERE slug = 'pages'), 'Kelola Pages', 'pages.manage', 'Membuat dan mengedit halaman'),
  ((SELECT id FROM group_ids WHERE slug = 'taxonomies'), 'Kelola Kategori & Tag', 'taxonomies.manage', 'Menambah dan mengubah kategori serta tag'),
  ((SELECT id FROM group_ids WHERE slug = 'media'), 'Upload Media', 'media.upload', 'Mengunggah file ke media library'),
  ((SELECT id FROM group_ids WHERE slug = 'media'), 'Hapus Media', 'media.delete', 'Menghapus file dari media library'),
  ((SELECT id FROM group_ids WHERE slug = 'users'), 'Lihat Pengguna', 'users.read', 'Melihat daftar akun pengguna'),
  ((SELECT id FROM group_ids WHERE slug = 'users'), 'Kelola Pengguna', 'users.manage', 'Mengedit peran dan status akun pengguna'),
  ((SELECT id FROM group_ids WHERE slug = 'users'), 'Kelola Roles', 'roles.manage', 'Mengonfigurasi peran dan hak akses'),
  ((SELECT id FROM group_ids WHERE slug = 'settings'), 'Kelola Pengaturan', 'settings.manage', 'Mengubah konfigurasi situs dan SEO')
ON CONFLICT (slug) DO NOTHING;

-- Map permissions to Editor
INSERT INTO private.role_has_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM private.roles r
CROSS JOIN private.permissions p
WHERE r.slug = 'editor'
  AND p.slug IN (
    'posts.read', 'posts.create', 'posts.update', 'posts.delete', 'posts.publish',
    'pages.read', 'pages.manage', 'taxonomies.manage', 'media.upload', 'media.delete'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Map permissions to Author
INSERT INTO private.role_has_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM private.roles r
CROSS JOIN private.permissions p
WHERE r.slug = 'author'
  AND p.slug IN ('posts.read', 'posts.create', 'posts.update', 'media.upload')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Map permissions to Viewer
INSERT INTO private.role_has_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM private.roles r
CROSS JOIN private.permissions p
WHERE r.slug = 'viewer'
  AND p.slug IN ('posts.read', 'pages.read')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 10. SEED DEFAULT USERS (Super Admin, Editor, Author)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  super_admin_id UUID := '1df5e990-d808-412b-8382-0e09e4d01487';
  editor_id UUID      := 'aa10b42c-18b3-42e0-82e9-708681180672';
  author_id UUID      := '9788acc5-2c56-4e71-a0d3-41b65f2d6560';
  r_super_admin UUID;
  r_editor UUID;
  r_author UUID;
BEGIN
  SELECT id INTO r_super_admin FROM private.roles WHERE slug = 'super-admin';
  SELECT id INTO r_editor FROM private.roles WHERE slug = 'editor';
  SELECT id INTO r_author FROM private.roles WHERE slug = 'author';

  -- 1. admin@ailabs.com
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', super_admin_id, 'authenticated', 'authenticated',
    'admin@ailabs.com', crypt('password123', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}', '{"full_name":"Super Admin"}', NOW(), NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('password123', gen_salt('bf')),
    raw_user_meta_data = '{"full_name":"Super Admin"}',
    updated_at = NOW();

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    super_admin_id, super_admin_id,
    format('{"sub":"%s","email":"%s"}', super_admin_id::text, 'admin@ailabs.com')::jsonb,
    'email', super_admin_id::text, NOW(), NOW(), NOW()
  ) ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (super_admin_id, 'Super Admin', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET full_name = 'Super Admin';

  IF r_super_admin IS NOT NULL THEN
    INSERT INTO private.user_has_roles (user_id, role_id) VALUES (super_admin_id, r_super_admin) ON CONFLICT DO NOTHING;
  END IF;

  -- 2. editor@ailabs.com
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', editor_id, 'authenticated', 'authenticated',
    'editor@ailabs.com', crypt('password123', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}', '{"full_name":"Content Editor"}', NOW(), NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('password123', gen_salt('bf')),
    raw_user_meta_data = '{"full_name":"Content Editor"}',
    updated_at = NOW();

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    editor_id, editor_id,
    format('{"sub":"%s","email":"%s"}', editor_id::text, 'editor@ailabs.com')::jsonb,
    'email', editor_id::text, NOW(), NOW(), NOW()
  ) ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (editor_id, 'Content Editor', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET full_name = 'Content Editor';

  IF r_editor IS NOT NULL THEN
    INSERT INTO private.user_has_roles (user_id, role_id) VALUES (editor_id, r_editor) ON CONFLICT DO NOTHING;
  END IF;

  -- 3. author@ailabs.com
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', author_id, 'authenticated', 'authenticated',
    'author@ailabs.com', crypt('password123', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}', '{"full_name":"Staff Author"}', NOW(), NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('password123', gen_salt('bf')),
    raw_user_meta_data = '{"full_name":"Staff Author"}',
    updated_at = NOW();

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    author_id, author_id,
    format('{"sub":"%s","email":"%s"}', author_id::text, 'author@ailabs.com')::jsonb,
    'email', author_id::text, NOW(), NOW(), NOW()
  ) ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (author_id, 'Staff Author', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET full_name = 'Staff Author';

  IF r_author IS NOT NULL THEN
    INSERT INTO private.user_has_roles (user_id, role_id) VALUES (author_id, r_author) ON CONFLICT DO NOTHING;
  END IF;
END $$;
