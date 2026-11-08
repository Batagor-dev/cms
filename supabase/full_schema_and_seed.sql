-- ==============================================================================
-- FULL SETUP: MIGRATE FRESH + SEED (ALL-IN-ONE)
-- Jalankan file ini di Supabase Dashboard -> SQL Editor untuk reset & build database
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. CLEANUP (MIGRATE FRESH: Drop tabel lama jika ada)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.post_tags CASCADE;
DROP TABLE IF EXISTS public.post_categories CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.media CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.role_has_permissions CASCADE;
DROP TABLE IF EXISTS public.user_has_roles CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.permission_groups CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ------------------------------------------------------------------------------
-- 1. PROFILES & RBAC (0001)
-- ------------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.permission_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.permission_groups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.user_has_roles (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE public.role_has_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_permissions_group_id ON public.permissions(group_id);
CREATE INDEX idx_user_has_roles_role_id ON public.user_has_roles(role_id);
CREATE INDEX idx_user_has_roles_user_id ON public.user_has_roles(user_id);
CREATE INDEX idx_role_has_permissions_permission_id ON public.role_has_permissions(permission_id);
CREATE INDEX idx_role_has_permissions_role_id ON public.role_has_permissions(role_id);

-- RBAC Functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_has_roles uhr
    JOIN public.roles r ON r.id = uhr.role_id
    WHERE uhr.user_id = _user_id AND r.slug = _role_slug
  );
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_has_roles uhr
    JOIN public.role_has_permissions rhp ON rhp.role_id = uhr.role_id
    JOIN public.permissions p ON p.id = rhp.permission_id
    JOIN public.roles r ON r.id = uhr.role_id
    WHERE uhr.user_id = _user_id
      AND (p.slug = _permission_slug OR r.slug = 'super-admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.authorize(_permission_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_permission((SELECT auth.uid()), _permission_slug);
$$;

-- Trigger Sync User Baru ke Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. POSTS (0002)
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
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_status ON public.posts(status);

-- ------------------------------------------------------------------------------
-- 3. PAGES (0003)
-- ------------------------------------------------------------------------------
CREATE TABLE public.pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. CATEGORIES & TAGS (0004)
-- ------------------------------------------------------------------------------
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL
);

CREATE TABLE public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
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
-- 5. MEDIA (0005)
-- ------------------------------------------------------------------------------
CREATE TABLE public.media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  alt_text TEXT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. SETTINGS (0006)
-- ------------------------------------------------------------------------------
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. AUDIT LOGS (0007)
-- ------------------------------------------------------------------------------
CREATE TABLE public.audit_logs (
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
-- 8. ROW LEVEL SECURITY (RLS) (0008)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_has_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_has_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated read, owner update
CREATE POLICY "Profiles read" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id);

-- Public read for published posts & pages
CREATE POLICY "Public read published posts" ON public.posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published pages" ON public.pages FOR SELECT USING (status = 'published');
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read tags" ON public.tags FOR SELECT USING (true);

-- Authenticated read for dashboard
CREATE POLICY "Auth read roles" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read permissions" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read permission groups" ON public.permission_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read user roles" ON public.user_has_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read role permissions" ON public.role_has_permissions FOR SELECT TO authenticated USING (true);

-- RBAC managed actions
CREATE POLICY "Posts manage" ON public.posts FOR ALL TO authenticated USING (public.authorize('posts.create') OR (SELECT auth.uid()) = author_id);
CREATE POLICY "Pages manage" ON public.pages FOR ALL TO authenticated USING (public.authorize('pages.manage'));
CREATE POLICY "Settings manage" ON public.settings FOR ALL TO authenticated USING (public.authorize('settings.manage'));

-- ------------------------------------------------------------------------------
-- 9. SEED DATA (seed.sql)
-- ------------------------------------------------------------------------------
INSERT INTO public.categories (name, slug, description)
VALUES 
  ('Teknologi', 'teknologi', 'Artikel seputar teknologi dan coding'),
  ('Tutorial', 'tutorial', 'Panduan langkah demi langkah')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.roles (name, slug, description, is_system)
VALUES
  ('Super Admin', 'super-admin', 'Akses penuh ke seluruh sistem tanpa batas', TRUE),
  ('Administrator', 'admin', 'Mengelola seluruh konten, pengguna, dan pengaturan situs', TRUE),
  ('Editor', 'editor', 'Dapat membuat, mengedit, dan mempublikasikan artikel maupun halaman', TRUE),
  ('Author', 'author', 'Hanya dapat membuat dan mengedit artikel miliknya sendiri', TRUE),
  ('Viewer', 'viewer', 'Hanya dapat melihat konten dashboard tanpa izin modifikasi', TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.permission_groups (name, slug, description)
VALUES
  ('Posts Management', 'posts', 'Izin pengelolaan artikel dan postingan blog'),
  ('Pages Management', 'pages', 'Izin pengelolaan halaman statis'),
  ('Categories & Tags', 'taxonomies', 'Izin pengelolaan kategori dan tag'),
  ('Media Library', 'media', 'Izin pengelolaan berkas dan gambar'),
  ('Users & Roles', 'users', 'Izin manajemen profil pengguna, peran, dan hak akses'),
  ('Settings & SEO', 'settings', 'Izin konfigurasi umum situs dan SEO')
ON CONFLICT (slug) DO NOTHING;

WITH group_ids AS (
  SELECT id, slug FROM public.permission_groups
)
INSERT INTO public.permissions (group_id, name, slug, description)
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
INSERT INTO public.role_has_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'editor'
  AND p.slug IN (
    'posts.read', 'posts.create', 'posts.update', 'posts.delete', 'posts.publish',
    'pages.read', 'pages.manage', 'taxonomies.manage', 'media.upload', 'media.delete'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Map permissions to Author
INSERT INTO public.role_has_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'author'
  AND p.slug IN ('posts.read', 'posts.create', 'posts.update', 'media.upload')
ON CONFLICT (role_id, permission_id) DO NOTHING;
