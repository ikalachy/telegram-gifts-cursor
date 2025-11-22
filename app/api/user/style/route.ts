import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { getUserFromInitData } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const initData = searchParams.get('initData');

    if (!initData) {
      return NextResponse.json({ error: 'Missing initData' }, { status: 400 });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    const telegramUser = getUserFromInitData(initData, botToken);
    if (!telegramUser) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    const user = await User.findOne({ telegram_id: telegramUser.id });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      style: user.style,
    });
  } catch (error: any) {
    console.error('Error fetching user style:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { initData, style } = await request.json();

    if (!initData || !style) {
      return NextResponse.json({ error: 'Missing initData or style' }, { status: 400 });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    const telegramUser = getUserFromInitData(initData, botToken);
    if (!telegramUser) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    const user = await User.findOne({ telegram_id: telegramUser.id });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate style
    const validStyles = ['kawaii', 'realistic', 'anime', 'chibi', 'vintage'];
    if (!validStyles.includes(style)) {
      return NextResponse.json({ error: 'Invalid style' }, { status: 400 });
    }

    user.style = style;
    await user.save();

    return NextResponse.json({
      success: true,
      style: user.style,
    });
  } catch (error: any) {
    console.error('Error updating user style:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

