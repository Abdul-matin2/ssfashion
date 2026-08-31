-- ============================================================
-- S&S FASHION — content_pages table
-- Stores all admin-editable content pages in Supabase so that
-- changes persist on serverless (Vercel) — the filesystem there
-- is read-only, so the previous JSON-file storage could not be
-- written to in production.
-- Run in Supabase SQL Editor.
-- ============================================================

-- Each row stores the full JSON document for one content page.
-- page_key matches the admin route name, e.g. 'contact', 'faqs', 'about'.
create table if not exists public.content_pages (
  page_key text primary key,
  content jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

drop trigger if exists touch_content_pages_updated_at on public.content_pages;
create trigger touch_content_pages_updated_at
  before update on public.content_pages
  for each row execute function public.touch_updated_at();

alter table public.content_pages enable row level security;
create policy "Public read content_pages" on public.content_pages for select using (true);
create policy "Admin write content_pages" on public.content_pages for all
  using (public.is_admin()) with check (public.is_admin());
