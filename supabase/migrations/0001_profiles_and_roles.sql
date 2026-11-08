-- ==============================================================================
-- 0001_profiles_and_roles.sql
-- RBAC (Role-Based Access Control) Schema for Supabase CMS
-- Tables: profiles, roles, permission_groups, permissions, user_has_roles, role_has_permissions
-- ==============================================================================

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. ROLES
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. PERMISSION GROUPS
CREATE TABLE IF NOT EXISTS public.permission_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. PERMISSIONS
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.permission_groups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. USER_HAS_ROLES (Pivot: User <-> Role)
CREATE TABLE IF NOT EXISTS public.user_has_roles (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, role_id)
);

-- 6. ROLE_HAS_PERMISSIONS (Pivot: Role <-> Permission)
CREATE TABLE IF NOT EXISTS public.role_has_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (role_id, permission_id)
);

-- ==============================================================================
-- INDEXES FOR FOREIGN KEYS & PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_permissions_group_id ON public.permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_user_has_roles_role_id ON public.user_has_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_has_roles_user_id ON public.user_has_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_role_has_permissions_permission_id ON public.role_has_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_role_has_permissions_role_id ON public.role_has_permissions(role_id);

-- ==============================================================================
-- HELPER FUNCTIONS FOR RBAC CHECKS (SECURITY DEFINER)
-- ==============================================================================

-- Check if a specific user has a given role slug (e.g. 'super-admin')
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

-- Check if a specific user has a given permission slug (e.g. 'posts.create')
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Direct check via user roles -> role permissions
    SELECT 1
    FROM public.user_has_roles uhr
    JOIN public.role_has_permissions rhp ON rhp.role_id = uhr.role_id
    JOIN public.permissions p ON p.id = rhp.permission_id
    JOIN public.roles r ON r.id = uhr.role_id
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
SET search_path = public
AS $$
  SELECT public.has_permission((SELECT auth.uid()), _permission_slug);
$$;

-- ==============================================================================
-- AUTH TRIGGER: Automatically create profile on new user sign up
-- ==============================================================================
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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_has_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_has_permissions ENABLE ROW LEVEL SECURITY;

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

-- 2. Roles & Permissions: Authenticated users can read
CREATE POLICY "Allow authenticated read roles"
  ON public.roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read permission groups"
  ON public.permission_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read permissions"
  ON public.permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read user roles"
  ON public.user_has_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read role permissions"
  ON public.role_has_permissions FOR SELECT
  TO authenticated
  USING (true);

-- 3. Roles & Permissions Management: Only users with 'roles.manage' or super-admin
CREATE POLICY "Admins manage roles"
  ON public.roles FOR ALL
  TO authenticated
  USING (public.authorize('roles.manage'))
  WITH CHECK (public.authorize('roles.manage'));

CREATE POLICY "Admins manage user roles"
  ON public.user_has_roles FOR ALL
  TO authenticated
  USING (public.authorize('roles.manage'))
  WITH CHECK (public.authorize('roles.manage'));

CREATE POLICY "Admins manage role permissions"
  ON public.role_has_permissions FOR ALL
  TO authenticated
  USING (public.authorize('roles.manage'))
  WITH CHECK (public.authorize('roles.manage'));
