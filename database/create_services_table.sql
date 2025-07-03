CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    pricing TEXT NOT NULL,
    url TEXT NOT NULL,
    connections TEXT[],
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- If you don't have uuid_generate_v4() enabled, you might need to run this first:
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
