import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const LOCAL_MESSAGES_FILE = path.join(process.cwd(), 'src/data/local_messages.json');

const getLocalMessages = (): any[] => {
  try {
    if (fs.existsSync(LOCAL_MESSAGES_FILE)) {
      const data = fs.readFileSync(LOCAL_MESSAGES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading local messages file:", e);
  }
  return [];
};

const saveLocalMessage = (message: any) => {
  try {
    const messages = getLocalMessages();
    messages.unshift(message);
    const dir = path.dirname(LOCAL_MESSAGES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
  } catch (e) {
    console.error("Error saving local message to file:", e);
  }
};

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const messageObj = {
      id: 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      name,
      email,
      subject: subject || 'No Subject',
      message,
      created_at: new Date().toISOString()
    };

    // Try saving to Supabase messages table if it exists
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([messageObj])
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, message: data[0] });
    } catch (dbError) {
      console.warn("Supabase save message failed, falling back to local file storage:", dbError);
      saveLocalMessage(messageObj);
      return NextResponse.json({ success: true, message: messageObj });
    }
  } catch (error) {
    console.error('Message save error:', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}

export async function GET() {
  let dbMessages: any[] = [];
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      dbMessages = data;
    }
  } catch (error) {
    console.warn("Supabase fetch messages failed, combining with local file storage.");
  }

  const localMessages = getLocalMessages();
  const allMessages = [...localMessages, ...dbMessages];
  
  // Sort combined list by created_at descending
  allMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(allMessages);
}
