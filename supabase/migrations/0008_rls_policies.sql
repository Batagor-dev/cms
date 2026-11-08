-- 0008: Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can read published posts that are not soft-deleted
CREATE POLICY "Public read published posts" ON public.posts
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

-- Public can read published pages that are not soft-deleted
CREATE POLICY "Public read published pages" ON public.pages
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);
