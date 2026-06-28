import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const OFFER_FILE = path.join(process.cwd(), 'src', 'data', 'active_offer.json');

const getActiveOffer = () => {
  try {
    if (fs.existsSync(OFFER_FILE)) {
      const data = fs.readFileSync(OFFER_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading offer file:", e);
  }
  return { title: '', discountPercentage: 0, active: false, expiryDate: '' };
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

export async function GET() {
  const offer = getActiveOffer();
  
  // Auto-deactivate if expired
  if (offer.active && offer.expiryDate) {
    const expiry = new Date(offer.expiryDate);
    // Expire at the end of the selected day (23:59:59)
    expiry.setHours(23, 59, 59, 999);
    
    if (new Date() > expiry) {
      offer.active = false;
      
      const dir = path.dirname(OFFER_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(OFFER_FILE, JSON.stringify(offer, null, 2), 'utf8');
      
      // We purposefully don't await emitSocketEvent here to avoid blocking the GET request unnecessarily, 
      // but we do emit it so active clients hide the banner.
      emitSocketEvent('offer-updated', offer);
    }
  }

  return NextResponse.json(offer);
}

export async function POST(request: Request) {
  try {
    const updates = await request.json();
    
    // Merge with existing or default
    const currentOffer = getActiveOffer();
    const newOffer = { ...currentOffer, ...updates };

    // Save to file
    const dir = path.dirname(OFFER_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(OFFER_FILE, JSON.stringify(newOffer, null, 2), 'utf8');

    // Emit socket event to notify clients immediately
    await emitSocketEvent('offer-updated', newOffer);

    return NextResponse.json({ success: true, offer: newOffer });
  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}
