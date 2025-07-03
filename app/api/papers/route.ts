import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import logger from '@/lib/logger';

logger.debug('Loading /api/papers/route.ts');

export async function GET(request: NextRequest) {
  logger.debug('GET /api/papers called');
  try {
    const { data: papers, error } = await supabase.from('papers').select('*');
    if (error) throw error;
    logger.debug(`Found ${papers.length} papers`);
    return NextResponse.json(papers);
  } catch (error) {
    logger.debug(`Error fetching papers: ${error.message}`);
    console.error('Error fetching papers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 