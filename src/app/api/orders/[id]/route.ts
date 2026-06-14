import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOCAL_ORDERS_FILE = path.join(process.cwd(), 'src/data/local_orders.json');

const getLocalOrders = (): any[] => {
  try {
    if (fs.existsSync(LOCAL_ORDERS_FILE)) {
      const data = fs.readFileSync(LOCAL_ORDERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading local orders file:", e);
  }
  return [];
};

const saveLocalOrders = (orders: any[]) => {
  try {
    const dir = path.dirname(LOCAL_ORDERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch (e) {
    console.error("Error saving local orders file:", e);
  }
};

const emitSocketEvent = async (event: string, data: any) => {
  try {
    await fetch('http://127.0.0.1:3000/_internal/socket-emit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data })
    });
  } catch (e) {
    console.error('Socket emit error:', e);
  }
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  // 1. Check if it's a local order
  if (id.startsWith('local-')) {
    const localOrders = getLocalOrders();
    const order = localOrders.find((o) => o.id === id);
    if (order) {
      return NextResponse.json(order);
    }
  } else {
    // 2. Fetch from Supabase
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return NextResponse.json(data);
      }
    } catch (dbError) {
      console.warn("Supabase fetch order failed, checking local storage as fallback:", dbError);
    }
    
    // 3. Fallback: Check local storage
    const localOrders = getLocalOrders();
    const order = localOrders.find((o) => o.id === id || o.order_id === id);
    if (order) {
      return NextResponse.json(order);
    }
  }

  return NextResponse.json({ error: 'Order not found' }, { status: 404 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    const updates = await request.json();

    if (id.startsWith('local-')) {
      const localOrders = getLocalOrders();
      const index = localOrders.findIndex((o) => o.id === id);
      if (index !== -1) {
        localOrders[index] = { ...localOrders[index], ...updates };
        saveLocalOrders(localOrders);
        await emitSocketEvent('order-updated', localOrders[index]);
        return NextResponse.json({ success: true, order: localOrders[index] });
      }
      return NextResponse.json({ error: 'Local order not found' }, { status: 404 });
    } else {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        await emitSocketEvent('order-updated', data[0]);
      }
      return NextResponse.json({ success: true, order: data ? data[0] : null });
    }
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
