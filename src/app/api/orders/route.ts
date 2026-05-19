import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

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

    return NextResponse.json({ success: true, order: data[0] });
  } catch (error) {
    console.error('Order save error:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
