CREATE TABLE public.industry_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_category TEXT NOT NULL,
  category_name TEXT NOT NULL,
  code_range TEXT NOT NULL,
  kpi TEXT,
  progress TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);