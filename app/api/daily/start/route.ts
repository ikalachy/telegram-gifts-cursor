import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { PendingCreation } from '@/models/PendingCreation';
import { getUserFromInitData } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { initData } = await request.json();

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

    // Find or create user
    let user = await User.findOne({ telegram_id: telegramUser.id });
    if (!user) {
      user = await User.create({
        telegram_id: telegramUser.id,
        username: telegramUser.username,
        style: 'kawaii',
      });
    }

    // Check daily limit (once per 24 hours)
    const now = new Date();
    const lastDaily = user.last_daily_at;
    
    if (lastDaily) {
      const hoursSinceLastDaily = (now.getTime() - lastDaily.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastDaily < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastDaily);
        return NextResponse.json(
          { error: `Daily box available in ${hoursRemaining} hours` },
          { status: 429 }
        );
      }
    }

    // Delete any existing pending creations
    await PendingCreation.deleteMany({ user_id: user._id });

    // Create new pending creation (expires in 1 hour)
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
    const pendingCreation = await PendingCreation.create({
      user_id: user._id,
      options: [],
      expires_at: expiresAt,
    });

    return NextResponse.json({
      success: true,
      pending_id: pendingCreation._id.toString(),
    });
  } catch (error: any) {
    console.error('Error starting daily box:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

