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
INSERT INTO public.roles (name, slug, description, is_system)
VALUES
  ('Super Admin', 'super-admin', 'Akses penuh ke seluruh sistem tanpa batas', TRUE),
  ('Administrator', 'admin', 'Mengelola seluruh konten, pengguna, dan pengaturan situs', TRUE),
  ('Editor', 'editor', 'Dapat membuat, mengedit, dan mempublikasikan artikel maupun halaman', TRUE),
  ('Author', 'author', 'Hanya dapat membuat dan mengedit artikel miliknya sendiri', TRUE),
  ('Viewer', 'viewer', 'Hanya dapat melihat konten dashboard tanpa izin modifikasi', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- 3. Default Permission Groups
INSERT INTO public.permission_groups (name, slug, description)
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
  SELECT id, slug FROM public.permission_groups
)
INSERT INTO public.permissions (group_id, name, slug, description)
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
INSERT INTO public.role_has_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'editor'
  AND p.slug IN (
    'posts.read', 'posts.create', 'posts.update', 'posts.delete', 'posts.publish',
    'pages.read', 'pages.manage',
    'taxonomies.manage',
    'media.upload', 'media.delete'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 6. Hubungkan Default Permissions ke Role 'Author'
INSERT INTO public.role_has_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'author'
  AND p.slug IN (
    'posts.read', 'posts.create', 'posts.update',
    'media.upload'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;
