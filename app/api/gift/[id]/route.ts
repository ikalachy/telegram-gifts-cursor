import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { Gift } from '@/models/Gift';
import { getUserFromInitData } from '@/lib/telegram';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const initData = searchParams.get('initData');
    const giftId = params.id;

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

    // Get gift
    const gift = await Gift.findOne({ 
      _id: giftId,
      owner_id: user._id 
    });

    if (!gift) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      gift: {
        id: gift._id.toString(),
        animals: gift.animals,
        accessories: gift.accessories,
        rarity: gift.rarity,
        animation_url: gift.animation_url,
        thumbnail_url: gift.thumbnail_url,
        source_type: gift.source_type,
        fusion_parents: gift.fusion_parents,
        created_at: gift.created_at,
      },
    });
  } catch (error: any) {
    console.error('Error fetching gift:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

