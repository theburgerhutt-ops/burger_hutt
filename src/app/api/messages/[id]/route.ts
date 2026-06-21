import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

const deleteLocalMessage = (id: string) => {
  try {
    const messages = getLocalMessages();
    const filtered = messages.filter(m => m.id !== id);
    fs.writeFileSync(LOCAL_MESSAGES_FILE, JSON.stringify(filtered, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error("Error deleting local message from file:", e);
    return false;
  }
};

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: 'Missing message ID' }, { status: 400 });
    }

    // Try deleting from Supabase
    let deletedFromDb = false;
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (!error) {
        deletedFromDb = true;
      }
    } catch (dbError) {
      console.warn("Supabase delete failed, checking local store:", dbError);
    }

    // Delete from local JSON file
    const deletedFromLocal = deleteLocalMessage(id);

    if (deletedFromDb || deletedFromLocal) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
