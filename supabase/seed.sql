-- ==============================================================================
-- seed.sql: Initial Data Seeding for Supabase CMS
-- ==============================================================================

-- 1. Default Categories
INSERT INTO public.categories (name, slug, description)
VALUES 
  ('Teknologi', 'teknologi', 'Artikel seputar teknologi dan coding'),
  ('Tutorial', 'tutorial', 'Panduan langkah demi langkah')
ON CONFLICT (slug) DO NOTHING;

-- 2. Default Roles
INSERT INTO private.roles (name, slug, description, is_system)
VALUES
  ('Super Admin', 'super-admin', 'Akses penuh ke seluruh sistem tanpa batas', TRUE),
  ('Administrator', 'admin', 'Mengelola seluruh konten, pengguna, dan pengaturan situs', TRUE),
  ('Editor', 'editor', 'Dapat membuat, mengedit, dan mempublikasikan artikel maupun halaman', TRUE),
  ('Author', 'author', 'Hanya dapat membuat dan mengedit artikel miliknya sendiri', TRUE),
  ('Viewer', 'viewer', 'Hanya dapat melihat konten dashboard tanpa izin modifikasi', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- 3. Default Permission Groups
INSERT INTO private.permission_groups (name, slug, description)
VALUES
  ('Posts Management', 'posts', 'Izin pengelolaan artikel dan postingan blog'),
  ('Pages Management', 'pages', 'Izin pengelolaan halaman statis'),
  ('Categories & Tags', 'taxonomies', 'Izin pengelolaan kategori dan tag'),
  ('Media Library', 'media', 'Izin pengelolaan berkas dan gambar'),
  ('Users & Roles', 'users', 'Izin manajemen profil pengguna, peran, dan hak akses'),
  ('Settings & SEO', 'settings', 'Izin konfigurasi umum situs dan SEO')
ON CONFLICT (slug) DO NOTHING;

-- 4. Default Permissions
WITH group_ids AS (
  SELECT id, slug FROM private.permission_groups
)
INSERT INTO private.permissions (group_id, name, slug, description)
VALUES
  -- Posts
  ((SELECT id FROM group_ids WHERE slug = 'posts'), 'Lihat Posts', 'posts.read', 'Melihat daftar dan detail posts'),
  ((SELECT id FROM group_ids WHERE slug = 'posts'), 'Buat Post', 'posts.create', 'Membuat draft artikel baru'),
  ((SELECT id FROM group_ids WHERE slug = 'posts'), 'Edit Post', 'posts.update', 'Mengedit konten artikel'),
  ((SELECT id FROM group_ids WHERE slug = 'posts'), 'Hapus Post', 'posts.delete', 'Menghapus artikel'),
  ((SELECT id FROM group_ids WHERE slug = 'posts'), 'Publikasikan Post', 'posts.publish', 'Mempublikasikan atau mengarsipkan artikel'),

  -- Pages
  ((SELECT id FROM group_ids WHERE slug = 'pages'), 'Lihat Pages', 'pages.read', 'Melihat daftar halaman'),
  ((SELECT id FROM group_ids WHERE slug = 'pages'), 'Kelola Pages', 'pages.manage', 'Membuat, mengedit, dan menghapus halaman statis'),

  -- Taxonomies
  ((SELECT id FROM group_ids WHERE slug = 'taxonomies'), 'Kelola Kategori & Tag', 'taxonomies.manage', 'Menambah dan mengubah kategori serta tag'),

  -- Media
  ((SELECT id FROM group_ids WHERE slug = 'media'), 'Upload Media', 'media.upload', 'Mengunggah file ke media library'),
  ((SELECT id FROM group_ids WHERE slug = 'media'), 'Hapus Media', 'media.delete', 'Menghapus file dari media library'),

  -- Users & Roles
  ((SELECT id FROM group_ids WHERE slug = 'users'), 'Lihat Pengguna', 'users.read', 'Melihat daftar akun pengguna'),
  ((SELECT id FROM group_ids WHERE slug = 'users'), 'Kelola Pengguna', 'users.manage', 'Mengedit peran dan status akun pengguna'),
  ((SELECT id FROM group_ids WHERE slug = 'users'), 'Kelola Roles & Hak Akses', 'roles.manage', 'Mengonfigurasi peran dan matriks permission'),

  -- Settings
  ((SELECT id FROM group_ids WHERE slug = 'settings'), 'Kelola Pengaturan', 'settings.manage', 'Mengubah konfigurasi situs, branding, dan SEO')
ON CONFLICT (slug) DO NOTHING;

-- 5. Hubungkan Default Permissions ke Role 'Editor'
INSERT INTO private.role_has_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM private.roles r
CROSS JOIN private.permissions p
WHERE r.slug = 'editor'
  AND p.slug IN (
    'posts.read', 'posts.create', 'posts.update', 'posts.delete', 'posts.publish',
    'pages.read', 'pages.manage',
    'taxonomies.manage',
    'media.upload', 'media.delete'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 6. Hubungkan Default Permissions ke Role 'Author'
INSERT INTO private.role_has_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM private.roles r
CROSS JOIN private.permissions p
WHERE r.slug = 'author'
  AND p.slug IN (
    'posts.read', 'posts.create', 'posts.update',
    'media.upload'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 7. Hubungkan Default Permissions ke Role 'Viewer'
INSERT INTO private.role_has_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM private.roles r
CROSS JOIN private.permissions p
WHERE r.slug = 'viewer'
  AND p.slug IN (
    'posts.read',
    'pages.read'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 8. Seed Akun Default (Super Admin, Editor, Author)
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
