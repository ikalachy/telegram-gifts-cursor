import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { PendingCreation } from '@/models/PendingCreation';
import { Gift } from '@/models/Gift';
import { getUserFromInitData } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { initData, pending_id, option_index } = await request.json();

    if (!initData || pending_id === undefined || option_index === undefined) {
      return NextResponse.json(
        { error: 'Missing initData, pending_id, or option_index' },
        { status: 400 }
      );
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

    // Find pending creation
    const pendingCreation = await PendingCreation.findOne({
      _id: pending_id,
      user_id: user._id,
    });

    if (!pendingCreation) {
      return NextResponse.json({ error: 'Pending creation not found' }, { status: 404 });
    }

    if (pendingCreation.expires_at < new Date()) {
      return NextResponse.json({ error: 'Pending creation expired' }, { status: 410 });
    }

    if (option_index < 0 || option_index >= pendingCreation.options.length) {
      return NextResponse.json({ error: 'Invalid option index' }, { status: 400 });
    }

    const chosenOption = pendingCreation.options[option_index];

    // Create gift
    const gift = await Gift.create({
      owner_id: user._id,
      animals: chosenOption.animals,
      accessories: chosenOption.accessories,
      rarity: 'common',
      animation_url: chosenOption.animation_url,
      thumbnail_url: chosenOption.thumbnail_url,
      source_type: 'daily',
      fusion_parents: [],
    });

    // Update user's last_daily_at
    user.last_daily_at = new Date();
    await user.save();

    // Delete pending creation
    await PendingCreation.deleteOne({ _id: pendingCreation._id });

    return NextResponse.json({
      success: true,
      gift: {
        id: gift._id.toString(),
        animals: gift.animals,
        accessories: gift.accessories,
        rarity: gift.rarity,
        animation_url: gift.animation_url,
        thumbnail_url: gift.thumbnail_url,
      },
    });
  } catch (error: any) {
    console.error('Error choosing daily gift:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

