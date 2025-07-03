import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import logger from '@/lib/logger';

logger.debug('Loading /api/industry_codes/route.ts');

export async function GET(request: NextRequest) {
  logger.debug('GET /api/industry_codes called');
  try {
    const { data: industryCodes, error } = await supabase.from('industry_codes').select('*');
    if (error) {
      logger.debug(`Error fetching industry codes from Supabase: ${error.message}`);
      throw error;
    }
    logger.debug(`Successfully fetched industry codes: ${JSON.stringify(industryCodes)}`);
    logger.debug(`Found ${industryCodes.length} industry codes`);
    return NextResponse.json(industryCodes);
  } catch (error: any) {
    logger.debug(`Error in GET /api/industry_codes: ${error.message}`);
    console.error('Error fetching industry codes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
