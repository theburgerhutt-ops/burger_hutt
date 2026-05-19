import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
