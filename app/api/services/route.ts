import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import logger from '@/lib/logger';

export async function GET() {
  logger.debug('GET /api/services called');
  try {
    const { data: services, error } = await supabase.from('services').select('*');
    if (error) throw error;
    logger.debug(`Found ${services.length} services`);
    return NextResponse.json(services);
  } catch (error) {
    logger.debug(`Error fetching services: ${error.message}`);
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 