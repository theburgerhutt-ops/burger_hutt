import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

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

const saveLocalOrder = (order: any) => {
  try {
    const orders = getLocalOrders();
    orders.unshift(order);
    const dir = path.dirname(LOCAL_ORDERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch (e) {
    console.error("Error saving local order to file:", e);
  }
};

export async function POST(request: Request) {
  try {
    const { paymentId, orderId, signature, customer, items, total, userId, paymentMethod, screenshot } = await request.json();

    // 1. Verify Payment Signature (only if not Pay at Counter or Online UPI)
    if (paymentMethod !== 'Pay at Counter' && paymentMethod !== 'Online UPI') {
      const text = orderId + "|" + paymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(text)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
      }
    }

    // 2. Determine initial order status
    const initialStatus = paymentMethod === 'Online UPI' ? 'pending_verification' : 'pending';

    // 3. Save to Supabase
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            payment_id: paymentId || 'COUNTER',
            order_id: orderId,
            customer_name: customer.name,
            customer_phone: customer.phone,
            customer_address: customer.address || 'Dine-In', // Fallback if address empty
            items: items,
            total_amount: total,
            status: initialStatus,
            created_at: new Date().toISOString(),
            user_id: userId || null,
            payment_method: paymentMethod || 'Online',
            screenshot_url: screenshot || null, // Store base64 screenshot payload
            payment_status: paymentMethod === 'Online UPI' ? 'pending' : 'paid',
          }
        ])
        .select();

      if (error) throw error;

      await emitSocketEvent('new-order', data[0]);

      return NextResponse.json({ success: true, order: data[0] });
    } catch (dbError) {
      console.warn("Supabase database save failed, falling back to local file storage:", dbError);
      
      const localOrderObj = {
        id: 'local-' + orderId,
        payment_id: paymentId || 'COUNTER',
        order_id: orderId,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address || 'Dine-In',
        items: items,
        total_amount: total,
        status: initialStatus,
        created_at: new Date().toISOString(),
        user_id: userId || null,
        payment_method: paymentMethod || 'Online',
        screenshot_url: screenshot || null,
        payment_status: paymentMethod === 'Online UPI' ? 'pending' : 'paid',
      };
      
      saveLocalOrder(localOrderObj);
      await emitSocketEvent('new-order', localOrderObj);
      return NextResponse.json({ success: true, order: localOrderObj });
    }
  } catch (error) {
    console.error('Order save error:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}

export async function GET() {
  let dbOrders: any[] = [];
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      dbOrders = data;
    }
  } catch (error) {
    console.warn("Supabase fetch orders failed, combining with local file storage.");
  }

  const localOrders = getLocalOrders();
  const allOrders = [...localOrders, ...dbOrders];
  
  // Sort combined list by created_at descending
  allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(allOrders);
}
