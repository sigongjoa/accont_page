import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  logger.debug('GET /api/repositories called');
  try {
    const { data: repos, error } = await supabase.from('repo').select('*');
    if (error) {
      logger.debug(`Error fetching repositories: ${error.message}`);
      throw error;
    }
    logger.debug(`Found ${repos.length} repositories`);
    return NextResponse.json(repos);
  } catch (error: any) {
    logger.debug(`Error fetching repositories: ${error.message}`);
    console.error('Error fetching repositories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  logger.debug('POST /api/repositories called');
  try {
    const { reop_id, when_use, env, link } = await request.json();
    const { data: newRepo, error } = await supabase.from('repo').insert([{ reop_id, when_use, env, link }]).select().single();
    if (error) throw error;
    logger.debug('Repository created successfully', { newRepo });
    return NextResponse.json(newRepo, { status: 201 });
  } catch (error: any) {
    logger.debug(`Error creating repository: ${error.message}`);
    console.error('Error creating repository:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  logger.debug('PUT /api/repositories called');
  const url = new URL(request.url);
  const reop_id = url.pathname.split('/').pop();

  if (!reop_id) {
    logger.debug('Repository ID not provided for PUT request');
    return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 });
  }

  try {
    const { when_use, env, link } = await request.json();
    const { data: updatedRepo, error } = await supabase.from('repo').update({ when_use, env, link }).eq('reop_id', reop_id).select().single();
    if (error) throw error;
    logger.debug('Repository updated successfully', { updatedRepo });
    return NextResponse.json(updatedRepo);
  } catch (error: any) {
    logger.debug(`Error updating repository: ${error.message}`);
    console.error('Error updating repository:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  logger.debug('DELETE /api/repositories called');
  const url = new URL(request.url);
  const reop_id = url.pathname.split('/').pop();

  if (!reop_id) {
    logger.debug('Repository ID not provided for DELETE request');
    return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 });
  }

  try {
    const { error } = await supabase.from('repo').delete().eq('reop_id', reop_id);
    if (error) throw error;
    logger.debug('Repository deleted successfully', { reop_id });
    return NextResponse.json({ message: 'Repository deleted successfully' });
  } catch (error: any) {
    logger.debug(`Error deleting repository: ${error.message}`);
    console.error('Error deleting repository:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
 