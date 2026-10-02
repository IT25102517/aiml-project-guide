import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json([], { status: 200 });
    }

    const { searchParams } = new URL(req.url);
    const member_id = searchParams.get('member_id');

    let query = supabase.from('screenshots').select('*');
    
    if (member_id) {
      query = query.eq('member_id', member_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Screenshots GET error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
