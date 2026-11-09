-- ==============================================================================
-- 0001_profiles_and_roles.sql
-- RBAC (Role-Based Access Control) Schema for Supabase CMS
-- Tables: public.profiles, private.roles, private.permission_groups, 
--         private.permissions, private.user_has_roles, private.role_has_permissions
-- Schemas: public (exposed API), private (internal/server-only)
-- ==============================================================================

-- 0. PRIVATE SCHEMA SETUP (Internal server-only schema)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE USAGE ON SCHEMA private FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA private FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA private FROM anon, authenticated;

GRANT USAGE ON SCHEMA private TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA private TO postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA private TO postgres, service_role;

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT DEFAULT '/images/avatars/1.png',
  bio TEXT,
  banned_at TIMESTAMPTZ,
  banned_until TIMESTAMPTZ,
  banned_reason TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_not_deleted ON public.profiles (id) WHERE deleted_at IS NULL;

-- 2. ROLES (Internal: private schema)
CREATE TABLE IF NOT EXISTS private.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. PERMISSION GROUPS (Internal: private schema)
CREATE TABLE IF NOT EXISTS private.permission_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. PERMISSIONS (Internal: private schema)
CREATE TABLE IF NOT EXISTS private.permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES private.permission_groups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. USER_HAS_ROLES (Pivot: User <-> Role, Internal: private schema)
CREATE TABLE IF NOT EXISTS private.user_has_roles (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES private.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, role_id)
);

-- 6. ROLE_HAS_PERMISSIONS (Pivot: Role <-> Permission, Internal: private schema)
CREATE TABLE IF NOT EXISTS private.role_has_permissions (
  role_id UUID REFERENCES private.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES private.permissions(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (role_id, permission_id)
);

-- ==============================================================================
-- INDEXES FOR FOREIGN KEYS & PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_permissions_group_id ON private.permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_user_has_roles_role_id ON private.user_has_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_has_roles_user_id ON private.user_has_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_role_has_permissions_permission_id ON private.role_has_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_role_has_permissions_role_id ON private.role_has_permissions(role_id);

-- ==============================================================================
-- HELPER FUNCTIONS FOR RBAC CHECKS (SECURITY DEFINER)
-- ==============================================================================

-- Check if a specific user has a given role slug (e.g. 'super-admin')
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

-- Check if a specific user has a given permission slug (e.g. 'posts.create')
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

-- Convenient shorthand for RLS policies to check the currently logged-in user
CREATE OR REPLACE FUNCTION public.authorize(_permission_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = private, public
AS $$
  SELECT public.has_permission((SELECT auth.uid()), _permission_slug);
$$;

-- Function for authenticated users to safely get their current role
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

-- ==============================================================================
-- AUTH TRIGGER: Automatically create profile and assign default role on new user sign up
-- ==============================================================================
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
  -- Insert or update profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '/images/avatars/1.png')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url, '/images/avatars/1.png'),
    updated_at = NOW();

  -- Tentukan role default (prioritas: meta_data > email check > default 'viewer')
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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.permission_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.user_has_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.role_has_permissions ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- 2. Roles & Permissions Management in private schema (Only users with 'roles.manage' or super-admin)
CREATE POLICY "Admins manage roles"
  ON private.roles FOR ALL
  TO authenticated
  USING (public.authorize('roles.manage'))
  WITH CHECK (public.authorize('roles.manage'));

CREATE POLICY "Admins manage permission groups"
  ON private.permission_groups FOR ALL
  TO authenticated
  USING (public.authorize('roles.manage'))
  WITH CHECK (public.authorize('roles.manage'));

CREATE POLICY "Admins manage permissions"
  ON private.permissions FOR ALL
  TO authenticated
  USING (public.authorize('roles.manage'))
  WITH CHECK (public.authorize('roles.manage'));

CREATE POLICY "Admins manage user roles"
  ON private.user_has_roles FOR ALL
  TO authenticated
  USING (public.authorize('roles.manage'))
  WITH CHECK (public.authorize('roles.manage'));

CREATE POLICY "Admins manage role permissions"
  ON private.role_has_permissions FOR ALL
  TO authenticated
  USING (public.authorize('roles.manage'))
  WITH CHECK (public.authorize('roles.manage'));
