CREATE TABLE public.repositories (
  id uuid primary key default uuid_generate_v4(),
  repo_id text unique not null,
  created_at timestamp with time zone default now(),
  when_use text,
  env text,
  link text
); 