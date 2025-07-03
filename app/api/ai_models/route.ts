import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import logger from '@/lib/logger';

export async function GET() {
  logger.debug('GET /api/ai_models called');
  try {
    const { data: aiModels, error } = await supabase.from('ai_models').select('*');
    if (error) throw error;
    logger.debug(`Found ${aiModels.length} AI models`);
    return NextResponse.json(aiModels);
  } catch (error: any) {
    logger.debug(`Error fetching AI models: ${error.message}`);
    console.error('Error fetching AI models:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  logger.debug('POST /api/ai_models called');
  try {
    const { desc, link, use } = await request.json();
    const { data: newAiModel, error } = await supabase.from('ai_models').insert([{ desc, link, use }]).select().single();
    if (error) throw error;
    logger.debug('AI Model created successfully', { newAiModel });
    return NextResponse.json(newAiModel, { status: 201 });
  } catch (error) {
    logger.debug(`Error creating AI model: ${error.message}`);
    console.error('Error creating AI model:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  logger.debug('PUT /api/ai_models called');
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop(); // Assuming ID is the last segment

  if (!id) {
    logger.debug('AI Model ID not provided for PUT request');
    return NextResponse.json({ error: 'AI Model ID is required' }, { status: 400 });
  }

  try {
    const { desc, link, use } = await request.json();
    const { data: updatedAiModel, error } = await supabase.from('ai_models').update({ desc, link, use }).eq('id', id).select().single();
    if (error) throw error;
    logger.debug('AI Model updated successfully', { updatedAiModel });
    return NextResponse.json(updatedAiModel);
  } catch (error) {
    logger.debug(`Error updating AI model: ${error.message}`);
    console.error('Error updating AI model:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  logger.debug('DELETE /api/ai_models called');
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop(); // Assuming ID is the last segment

  if (!id) {
    logger.debug('AI Model ID not provided for DELETE request');
    return NextResponse.json({ error: 'AI Model ID is required' }, { status: 400 });
  }

  try {
    const { error } = await supabase.from('ai_models').delete().eq('id', id);
    if (error) throw error;
    if (error) throw error;
    if (error) throw error;
    logger.debug('AI Model deleted successfully', { id });
    return NextResponse.json({ message: 'AI Model deleted successfully' });
  } catch (error: any) {
    logger.debug(`Error deleting AI model: ${error.message}`);
    console.error('Error deleting AI model:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 