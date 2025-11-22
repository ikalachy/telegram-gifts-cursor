# 🎁 Plush Gifts Telegram Mini App

An AI-powered Telegram Mini App for generating and collecting animated plush gifts using Veo 3.1 and NanaBanana.

## 🚀 Features

- **Daily Box**: Open a daily box to generate 2 animated plush gifts and choose one to keep
- **Fusion System**: Combine 2-3 gifts to create rare or legendary plush items
- **Collection Management**: View and manage your plush gift collection
- **Style Customization**: Choose from multiple plush styles (Kawaii, Realistic, Anime, Chibi, Vintage)
- **Telegram Bot**: Full bot integration with commands and WebApp buttons

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas with Mongoose
- **Bot Framework**: Telegraf
- **AI Generation**: Veo 3.1 (animated plush generator)
- **Prompt Generation**: NanaBanana
- **Storage**: Vercel Blob (for animation files)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd telegram-gifts-cursor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   BOT_TOKEN=your_telegram_bot_token
   WEBAPP_URL=https://your-app.vercel.app
   VEO_API_KEY=your_veo_api_key
   NANA_KEY=your_nanabanana_api_key
   BLOB_WRITE_TOKEN=your_vercel_blob_write_token
   BLOB_READ_TOKEN=your_vercel_blob_read_token
   TELEGRAM_BOT_SECRET=your_telegram_bot_secret
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Run Telegram bot** (in a separate terminal)
   ```bash
   npm run bot
   ```

## 🗄 Database Models

### User
- `telegram_id`: Unique Telegram user ID
- `username`: Telegram username
- `style`: Preferred plush style
- `last_daily_at`: Last daily box opening timestamp

### Gift
- `owner_id`: Reference to User
- `animals`: Array of animal types
- `accessories`: Array of accessories
- `rarity`: 'common', 'rare', or 'legendary'
- `animation_url`: URL to animation video
- `thumbnail_url`: URL to thumbnail image
- `source_type`: 'daily' or 'fusion'
- `fusion_parents`: References to parent gifts (if fusion)

### PendingCreation
- `user_id`: Reference to User
- `options`: Array of generated gift options
- `expires_at`: Expiration timestamp

### FusionJob
- `user_id`: Reference to User
- `parent_ids`: References to parent gifts
- `status`: 'pending', 'processing', 'completed', or 'failed'
- `result_gift_id`: Reference to resulting gift

## 📡 API Routes

### Daily Box
- `POST /api/daily/start` - Start daily box (check limit, create pending)
- `POST /api/daily/generate` - Generate 2 gift options
- `POST /api/daily/choose` - Choose and save a gift

### Fusion
- `POST /api/fusion/start` - Start fusion process
- `POST /api/fusion/complete` - Complete fusion and create new gift

### Gifts
- `GET /api/gifts` - Get user's gift collection

### User
- `GET /api/user/style` - Get user's style preference
- `POST /api/user/style` - Update user's style preference

### Telegram Bot (Webhook)
- `POST /api/telegram/webhook` - Receives updates from Telegram
- `POST /api/telegram/setup` - Set webhook URL
- `GET /api/telegram/setup` - Get webhook info

## 🤖 Bot Commands

- `/start` - Welcome message and Mini App button
- `/daily` - Open daily box
- `/mygifts` - View gift collection summary
- `/fusion` - Start fusion process
- `/setstyle` - Change plush style
- `/show <id>` - View specific gift
- `/send <user>` - Send gift (coming soon)

## 📱 Mini App Pages

- `/webapp/home` - Main collection view
- `/webapp/daily` - Daily box opening flow
- `/webapp/fusion` - Gift fusion interface
- `/webapp/gift/[id]` - Individual gift viewer
- `/webapp/style` - Style settings

## 🚀 Deployment

### Vercel Deployment

1. **Deploy Next.js app to Vercel**
   ```bash
   vercel
   ```

2. **Add environment variables** in Vercel dashboard

3. **Update WEBAPP_URL** in `.env` with your Vercel URL

### Bot Webhook Setup

The bot is now integrated into the Next.js API and uses webhooks instead of polling.

1. **Deploy your Next.js app to Vercel** (or your hosting platform)

2. **Set up the webhook** by calling the setup endpoint:
   ```bash
   curl -X POST https://your-app.vercel.app/api/telegram/setup
   ```
   
   Or visit the endpoint in your browser after deployment.

3. **Verify webhook is set**:
   ```bash
   curl https://your-app.vercel.app/api/telegram/setup
   ```

The bot will now receive updates via webhook at `/api/telegram/webhook`.

## 🔧 Configuration

### Veo 3.1 API
Update the Veo API URL in `/lib/veo.ts` if needed:
```typescript
const VEO_API_URL = 'https://api.veo.ai/v1';
```

### NanaBanana API
Update the NanaBanana API URL in `/lib/nana.ts` if needed:
```typescript
const NANA_API_URL = 'https://api.nanabanana.ai/v1';
```

## 🧪 Testing

1. **Test Telegram authentication**: Verify initData validation
2. **Test daily limit**: Ensure 24-hour cooldown works
3. **Test Veo generation**: Verify animation generation
4. **Test fusion logic**: Ensure parent gifts are consumed
5. **Test WebApp UI**: Verify all flows work in Telegram

## 📝 Notes

- Daily box has a 24-hour cooldown per user
- Fusion consumes the original gifts
- Animations are stored in Vercel Blob
- All API routes require valid Telegram initData
- The bot requires a valid BOT_TOKEN from @BotFather

## 🐛 Troubleshooting

### Bot not responding
- Check BOT_TOKEN is set correctly
- Verify bot is running (`npm run bot`)
- Check bot logs for errors

### API errors
- Verify MongoDB connection string
- Check all environment variables are set
- Review API route logs

### Veo generation fails
- Verify VEO_API_KEY is correct
- Check Veo API status
- Review error logs in `/api/daily/generate`

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

