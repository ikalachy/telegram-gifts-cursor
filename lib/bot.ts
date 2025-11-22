import { Telegraf, Context } from 'telegraf';
import connectDB from './db';
import { User } from '@/models/User';
import { Gift } from '@/models/Gift';

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-app.vercel.app';

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not set');
}

export const bot = new Telegraf(BOT_TOKEN);

// Helper function to get or create user
async function getOrCreateUser(telegramId: number, username?: string) {
  await connectDB();
  let user = await User.findOne({ telegram_id: telegramId });
  
  if (!user) {
    user = await User.create({
      telegram_id: telegramId,
      username: username,
      style: 'kawaii',
    });
  } else if (username && user.username !== username) {
    user.username = username;
    await user.save();
  }
  
  return user;
}

// Start command
bot.command('start', async (ctx: Context) => {
  const user = ctx.from;
  if (!user) return;

  await getOrCreateUser(user.id, user.username);

  await ctx.reply(
    '🎁 Welcome to Plush Gifts!\n\n' +
    'Generate and collect AI-powered animated plush gifts.\n\n' +
    'Use /daily to open your daily box\n' +
    'Use /mygifts to view your collection\n' +
    'Use /fusion to combine gifts\n' +
    'Use /setstyle to change your style',
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🎮 Open Mini App',
            web_app: { url: `${WEBAPP_URL}/webapp/home` }
          }
        ]]
      }
    }
  );
});

// Daily command
bot.command('daily', async (ctx: Context) => {
  const user = ctx.from;
  if (!user) return;

  await getOrCreateUser(user.id, user.username);

  await ctx.reply(
    '📦 Open your daily box to get 2 random plush gifts!',
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '📦 Open Daily Box',
            web_app: { url: `${WEBAPP_URL}/webapp/daily` }
          }
        ]]
      }
    }
  );
});

// My gifts command
bot.command('mygifts', async (ctx: Context) => {
  const user = ctx.from;
  if (!user) return;

  await connectDB();
  const dbUser = await getOrCreateUser(user.id, user.username);
  const gifts = await Gift.find({ owner_id: dbUser._id });

  if (gifts.length === 0) {
    await ctx.reply(
      'You don\'t have any gifts yet! Open your daily box to get started.',
      {
        reply_markup: {
          inline_keyboard: [[
            {
              text: '📦 Open Daily Box',
              web_app: { url: `${WEBAPP_URL}/webapp/daily` }
            }
          ]]
        }
      }
    );
    return;
  }

  const giftCount = gifts.length;
  const rareCount = gifts.filter(g => g.rarity === 'rare').length;
  const legendaryCount = gifts.filter(g => g.rarity === 'legendary').length;

  await ctx.reply(
    `🎁 Your Collection:\n\n` +
    `Total: ${giftCount} gifts\n` +
    `Rare: ${rareCount}\n` +
    `Legendary: ${legendaryCount}\n\n` +
    `View your full collection in the Mini App!`,
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🎮 View Collection',
            web_app: { url: `${WEBAPP_URL}/webapp/home` }
          }
        ]]
      }
    }
  );
});

// Fusion command
bot.command('fusion', async (ctx: Context) => {
  const user = ctx.from;
  if (!user) return;

  await getOrCreateUser(user.id, user.username);

  await ctx.reply(
    '🔥 Fuse 2-3 gifts to create a rare or legendary plush!\n\n' +
    'The original gifts will be consumed in the process.',
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🔥 Start Fusion',
            web_app: { url: `${WEBAPP_URL}/webapp/fusion` }
          }
        ]]
      }
    }
  );
});

// Set style command
bot.command('setstyle', async (ctx: Context) => {
  const user = ctx.from;
  if (!user) return;

  await getOrCreateUser(user.id, user.username);

  await ctx.reply(
    '🎨 Change your plush style preference',
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🎨 Style Settings',
            web_app: { url: `${WEBAPP_URL}/webapp/style` }
          }
        ]]
      }
    }
  );
});

// Show gift command
bot.command('show', async (ctx: Context) => {
  const args = ctx.message && 'text' in ctx.message 
    ? ctx.message.text.split(' ').slice(1) 
    : [];

  if (args.length === 0) {
    await ctx.reply('Usage: /show <gift_id>');
    return;
  }

  const giftId = args[0];
  const user = ctx.from;
  if (!user) return;

  try {
    await connectDB();
    const dbUser = await getOrCreateUser(user.id, user.username);
    const gift = await Gift.findOne({ 
      _id: giftId, 
      owner_id: dbUser._id 
    });

    if (!gift) {
      await ctx.reply('Gift not found or you don\'t own it.');
      return;
    }

    await ctx.replyWithPhoto(
      gift.thumbnail_url,
      {
        caption: `🎁 ${gift.animals.join(' + ')}\n` +
                 `Rarity: ${gift.rarity.toUpperCase()}\n` +
                 `Accessories: ${gift.accessories.join(', ')}\n` +
                 `Source: ${gift.source_type}`,
        reply_markup: {
          inline_keyboard: [[
            {
              text: '👀 View Animation',
              web_app: { url: `${WEBAPP_URL}/webapp/gift/${gift._id}` }
            }
          ]]
        }
      }
    );
  } catch (error) {
    await ctx.reply('Error: Invalid gift ID or gift not found.');
  }
});

// Send gift command (placeholder - would need to implement gifting logic)
bot.command('send', async (ctx: Context) => {
  await ctx.reply(
    'Gift sharing feature coming soon! For now, you can view your gifts in the Mini App.',
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🎮 Open Mini App',
            web_app: { url: `${WEBAPP_URL}/webapp/home` }
          }
        ]]
      }
    }
  );
});

// Handle web app data
bot.on('web_app_data', async (ctx: Context) => {
  // Handle data from web app if needed
  console.log('Web app data received:', ctx.webAppData);
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Error in bot:', err);
  if (ctx) {
    ctx.reply('An error occurred. Please try again later.').catch(() => {
      // Ignore errors when replying
    });
  }
});

