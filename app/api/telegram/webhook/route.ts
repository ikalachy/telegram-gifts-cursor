import { NextRequest, NextResponse } from 'next/server';
import { bot } from '@/lib/bot';

// Disable body parsing, we need the raw body for webhook verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle the update using Telegraf
    await bot.handleUpdate(body);
    
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error handling webhook update:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Telegram webhook verification (GET request)
export async function GET() {
  return NextResponse.json({ 
    message: 'Telegram webhook endpoint',
    status: 'ready'
  });
}

