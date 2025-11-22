import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { PendingCreation } from '@/models/PendingCreation';
import { getUserFromInitData } from '@/lib/telegram';
import { generateAnimation } from '@/lib/veo';
import { generateDailyPrompt, getRandomAnimal, getRandomAccessory } from '@/lib/nana';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { initData, pending_id } = await request.json();

    if (!initData || !pending_id) {
      return NextResponse.json({ error: 'Missing initData or pending_id' }, { status: 400 });
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

    // Generate 2 options
    const options = [];

    for (let i = 0; i < 2; i++) {
      const animal = getRandomAnimal();
      const accessory = getRandomAccessory();
      
      const promptResult = await generateDailyPrompt(animal, accessory, user.style);
      const { videoUrl, thumbnailUrl } = await generateAnimation(promptResult.prompt);

      options.push({
        animals: promptResult.animals,
        accessories: promptResult.accessories,
        animation_url: videoUrl,
        thumbnail_url: thumbnailUrl,
      });
    }

    // Update pending creation
    pendingCreation.options = options;
    await pendingCreation.save();

    return NextResponse.json({
      success: true,
      options: options.map((opt, idx) => ({
        id: idx,
        animals: opt.animals,
        accessories: opt.accessories,
        animation_url: opt.animation_url,
        thumbnail_url: opt.thumbnail_url,
      })),
    });
  } catch (error: any) {
    console.error('Error generating daily gifts:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

