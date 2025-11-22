import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { Gift } from '@/models/Gift';
import { FusionJob } from '@/models/FusionJob';
import { getUserFromInitData } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { initData, gift_ids } = await request.json();

    if (!initData || !gift_ids || !Array.isArray(gift_ids)) {
      return NextResponse.json(
        { error: 'Missing initData or gift_ids array' },
        { status: 400 }
      );
    }

    if (gift_ids.length < 2 || gift_ids.length > 3) {
      return NextResponse.json(
        { error: 'Must select 2-3 gifts for fusion' },
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

    // Verify ownership of all gifts
    const gifts = await Gift.find({
      _id: { $in: gift_ids },
      owner_id: user._id,
    });

    if (gifts.length !== gift_ids.length) {
      return NextResponse.json(
        { error: 'Some gifts not found or not owned by user' },
        { status: 403 }
      );
    }

    // Create fusion job
    const fusionJob = await FusionJob.create({
      user_id: user._id,
      parent_ids: gift_ids,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      fusion_job_id: fusionJob._id.toString(),
    });
  } catch (error: any) {
    console.error('Error starting fusion:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

