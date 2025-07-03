-- create_papers_table.sql

CREATE TABLE public.papers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id TEXT UNIQUE NOT NULL,
    external_id TEXT,
    platform TEXT NOT NULL,
    title TEXT NOT NULL,
    abstract TEXT NOT NULL,
    authors JSONB NOT NULL DEFAULT '[]'::jsonb,
    categories JSONB NOT NULL DEFAULT '[]'::jsonb,
    pdf_url TEXT,
    embedding VECTOR(1536), -- Adjust dimension based on your embedding model (e.g., OpenAI's text-embedding-ada-002 is 1536)
    published_date TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_date TIMESTAMP WITH TIME ZONE NOT NULL,
    year INTEGER,
    references_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    cited_by_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    animation_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.papers
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.papers
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.papers
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.papers
FOR DELETE USING (auth.role() = 'authenticated');

-- Optional: Add an index for faster lookups on paper_id
CREATE INDEX idx_papers_paper_id ON public.papers (paper_id);

-- Optional: Add an index for published_date if you frequently sort by it
CREATE INDEX idx_papers_published_date ON public.papers (published_date DESC);

-- Optional: Add an index for platform if you frequently filter by it
CREATE INDEX idx_papers_platform ON public.papers (platform);

-- Optional: Add a GIN index for JSONB columns if you plan to query within them
-- CREATE INDEX idx_papers_authors ON public.papers USING GIN (authors);
-- CREATE INDEX idx_papers_categories ON public.papers USING GIN (categories);
-- CREATE INDEX idx_papers_references_ids ON public.papers USING GIN (references_ids);
-- CREATE INDEX idx_papers_cited_by_ids ON public.papers USING GIN (cited_by_ids);