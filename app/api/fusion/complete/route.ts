import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { Gift } from '@/models/Gift';
import { FusionJob } from '@/models/FusionJob';
import { getUserFromInitData } from '@/lib/telegram';
import { generateAnimation } from '@/lib/veo';
import {
  generateFusionPrompt,
  generateLegendaryPrompt,
  getRandomLegendaryTrait,
} from '@/lib/nana';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { initData, fusion_job_id } = await request.json();

    if (!initData || !fusion_job_id) {
      return NextResponse.json(
        { error: 'Missing initData or fusion_job_id' },
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

    // Find fusion job
    const fusionJob = await FusionJob.findOne({
      _id: fusion_job_id,
      user_id: user._id,
    }).populate('parent_ids');

    if (!fusionJob) {
      return NextResponse.json({ error: 'Fusion job not found' }, { status: 404 });
    }

    if (fusionJob.status !== 'pending') {
      return NextResponse.json(
        { error: `Fusion job already ${fusionJob.status}` },
        { status: 400 }
      );
    }

    // Update status to processing
    fusionJob.status = 'processing';
    await fusionJob.save();

    // Get parent gifts
    const parentGifts = await Gift.find({
      _id: { $in: fusionJob.parent_ids },
    });

    if (parentGifts.length !== fusionJob.parent_ids.length) {
      fusionJob.status = 'failed';
      await fusionJob.save();
      return NextResponse.json({ error: 'Parent gifts not found' }, { status: 404 });
    }

    // Generate fusion prompt
    let promptResult;
    let rarity = 'rare';

    if (parentGifts.length === 2) {
      const allAccessories = [
        ...parentGifts[0].accessories,
        ...parentGifts[1].accessories,
      ];
      const legendaryTrait = getRandomLegendaryTrait();
      
      promptResult = await generateFusionPrompt(
        parentGifts[0].animals[0] || 'creature',
        parentGifts[1].animals[0] || 'creature',
        parentGifts[0].accessories,
        parentGifts[1].accessories,
        legendaryTrait
      );
    } else if (parentGifts.length === 3) {
      const allAccessories = [
        ...parentGifts[0].accessories,
        ...parentGifts[1].accessories,
        ...parentGifts[2].accessories,
      ];
      
      promptResult = await generateLegendaryPrompt(
        parentGifts[0].animals[0] || 'creature',
        parentGifts[1].animals[0] || 'creature',
        parentGifts[2].animals[0] || 'creature',
        allAccessories
      );
      rarity = 'legendary';
    } else {
      fusionJob.status = 'failed';
      await fusionJob.save();
      return NextResponse.json({ error: 'Invalid number of parent gifts' }, { status: 400 });
    }

    // Generate animation
    const { videoUrl, thumbnailUrl } = await generateAnimation(promptResult.prompt);

    // Create new gift
    const newGift = await Gift.create({
      owner_id: user._id,
      animals: promptResult.animals,
      accessories: promptResult.accessories,
      rarity: rarity,
      animation_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      source_type: 'fusion',
      fusion_parents: fusionJob.parent_ids,
    });

    // Delete parent gifts (burn them)
    await Gift.deleteMany({
      _id: { $in: fusionJob.parent_ids },
    });

    // Update fusion job
    fusionJob.status = 'completed';
    fusionJob.result_gift_id = newGift._id;
    await fusionJob.save();

    return NextResponse.json({
      success: true,
      gift: {
        id: newGift._id.toString(),
        animals: newGift.animals,
        accessories: newGift.accessories,
        rarity: newGift.rarity,
        animation_url: newGift.animation_url,
        thumbnail_url: newGift.thumbnail_url,
      },
    });
  } catch (error: any) {
    console.error('Error completing fusion:', error);
    
    // Update fusion job status to failed
    try {
      await connectDB();
      const fusionJob = await FusionJob.findById(
        (await request.json()).fusion_job_id
      );
      if (fusionJob) {
        fusionJob.status = 'failed';
        await fusionJob.save();
      }
    } catch (updateError) {
      console.error('Error updating fusion job status:', updateError);
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

