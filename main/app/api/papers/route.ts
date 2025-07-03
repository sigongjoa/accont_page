import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paperId = searchParams.get('id');

  if (paperId) {
    const { data, error } = await supabase
      .from('papers')
      .select('*')
      .eq('paper_id', paperId)
      .single();

    if (error) {
      console.error('Error fetching paper:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ message: 'Paper not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from('papers')
    .select('*')
    .order('published_date', { ascending: false });

  if (error) {
    console.error('Error fetching papers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const papers = await request.json();

  if (!Array.isArray(papers)) {
    return NextResponse.json({ error: 'Request body must be an array of papers' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('papers')
    .upsert(papers, { onConflict: 'paper_id' }); // paper_id가 중복되면 업데이트

  if (error) {
    console.error('Error upserting papers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Papers upserted successfully', data }, { status: 200 });
}
