import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import logger from '@/lib/logger';

logger.debug('Loading /api/mcp/route.ts');

export async function GET(request: NextRequest) {
  logger.debug('GET /api/mcp called');
  logger.debug(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  logger.debug(`Supabase Anon Key (first 5 chars): ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 5)}`);
  try {
    const { data: mcpData, error } = await supabase.from('mcp').select('*');
    if (error) {
      logger.debug(`Supabase query error: ${error.message}`);
      throw error;
    }
    logger.debug(`Found ${mcpData.length} MCP entries`);
    logger.debug(`MCP data: ${JSON.stringify(mcpData)}`);
    return NextResponse.json(mcpData);
  } catch (error: any) {
    logger.debug(`Error fetching MCP data: ${error.message}`);
    console.error('Error fetching MCP data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}