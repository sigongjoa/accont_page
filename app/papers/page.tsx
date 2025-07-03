import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';
import PageTitle from "@/components/PageTitle";
import { Toaster } from "@/components/ui/toaster";
import { PaperTable } from "@/components/paper-table";

interface Paper {
  id: string;
  paper_id: string;
  external_id: string | null;
  platform: string;
  title: string;
  abstract: string;
  authors: any[]; // jsonb type
  categories: any[]; // jsonb type
  pdf_url: string | null;
  published_date: string;
  updated_date: string;
  year: number | null;
  references_ids: any[]; // jsonb type
  cited_by_ids: any[]; // jsonb type
  animation_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

async function getPapers(): Promise<Paper[]> {
  logger.debug('Fetching papers from API');
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/papers`, { cache: 'no-store' });
    if (!res.ok) {
      logger.debug(`Failed to fetch papers: ${res.statusText}`);
      throw new Error(`Failed to fetch papers: ${res.statusText}`);
    }
    const papers = await res.json();
    logger.debug(`Successfully fetched ${papers.length} papers`);
    return papers;
  } catch (error) {
    logger.debug(`Error in getPapers: ${error.message}`);
    console.error('Error fetching papers:', error);
    return [];
  }
}

export default async function PapersPage() {
  logger.debug('Rendering PapersPage function entry');
  const papers = await getPapers();
  logger.debug(`Papers data received: ${papers.length}`);

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col p-6">
        <PageTitle title="논문" icon="article" />
        <PaperTable papers={papers} />
      </main>
      <Toaster />
    </div>
  );
} 