# 🚀 Deployment Guide

This guide will help you deploy the Plush Gifts Telegram Mini App to production.

## Prerequisites

- MongoDB Atlas account
- Telegram Bot Token (from @BotFather)
- Veo 3.1 API key
- NanaBanana API key (optional)
- Vercel account
- Render/Railway account (for bot)

## Step 1: Set Up MongoDB Atlas

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is fine)
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`

## Step 2: Create Telegram Bot

1. Open Telegram and search for @BotFather
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Save the bot token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Set up Web App:
   - Send `/newapp` to @BotFather
   - Select your bot
   - Provide app name and description
   - Set Web App URL to your Vercel deployment URL (e.g., `https://your-app.vercel.app/webapp/home`)

## Step 3: Deploy Next.js App to Vercel

### Option A: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and add environment variables when asked

### Option B: Vercel Dashboard

1. Go to https://vercel.com
2. Click "New Project"
3. Import your Git repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. Add Environment Variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   BOT_TOKEN=your_telegram_bot_token
   WEBAPP_URL=https://your-app.vercel.app
   VEO_API_KEY=your_veo_api_key
   NANA_KEY=your_nanabanana_key (optional)
   BLOB_WRITE_TOKEN=your_vercel_blob_write_token
   BLOB_READ_TOKEN=your_vercel_blob_read_token
   TELEGRAM_BOT_SECRET=your_telegram_bot_secret
   ```

6. Deploy!

## Step 4: Set Up Vercel Blob Storage

1. Go to Vercel Dashboard → Your Project → Storage
2. Create a new Blob Store
3. Get your write and read tokens
4. Add them to environment variables

## Step 5: Set Up Telegram Bot Webhook

The bot is now integrated into your Next.js API and uses webhooks instead of polling. No separate deployment needed!

1. **After deploying to Vercel**, set up the webhook by calling:
   ```bash
   curl -X POST https://your-app.vercel.app/api/telegram/setup
   ```
   
   Or visit `https://your-app.vercel.app/api/telegram/setup` in your browser.

2. **Verify webhook is set**:
   ```bash
   curl https://your-app.vercel.app/api/telegram/setup
   ```
   
   You should see the webhook URL and status.

3. **Test the bot**:
   - Send `/start` to your bot in Telegram
   - The bot should respond immediately

The webhook endpoint is: `https://your-app.vercel.app/api/telegram/webhook`

## Step 6: Update Web App URL

1. After Vercel deployment, update `WEBAPP_URL` in:
   - Vercel environment variables
   - Bot deployment environment variables
   - Telegram Bot Web App settings (@BotFather)

## Step 7: Test Deployment

1. **Test Bot Webhook:**
   - Send `/start` to your bot
   - Verify bot responds (confirms webhook is working)
   - Verify Web App button appears
   - Click to open Mini App

2. **Test Mini App:**
   - Open daily box
   - View collection
   - Test fusion
   - Change style

3. **Test API Routes:**
   - Check Vercel function logs
   - Verify MongoDB connections
   - Test Veo generation

## Troubleshooting

### Bot Not Responding

- Verify webhook is set correctly: `curl https://your-app.vercel.app/api/telegram/setup`
- Check BOT_TOKEN is correct
- Verify webhook URL is accessible (HTTPS required)
- Check Vercel function logs for errors
- Ensure `/api/telegram/webhook` route is deployed

### API Errors

- Check Vercel function logs
- Verify MongoDB connection string
- Check all environment variables are set
- Verify Veo API key is valid

### Web App Not Loading

- Check WEBAPP_URL is correct
- Verify Telegram Web App settings in @BotFather
- Check browser console for errors
- Verify initData validation is working

### Database Connection Issues

- Verify MongoDB Atlas IP whitelist includes Vercel IPs
- Check connection string format
- Verify database user permissions

## Monitoring

### Vercel
- Function logs: Dashboard → Your Project → Functions
- Analytics: Dashboard → Analytics
- Webhook endpoint: `/api/telegram/webhook`

### MongoDB Atlas
- Database metrics: Atlas Dashboard
- Connection monitoring: Atlas → Monitoring

## Scaling Considerations

1. **Database:**
   - Upgrade MongoDB Atlas tier if needed
   - Add indexes for frequently queried fields
   - Monitor connection pool usage

2. **API:**
   - Vercel automatically scales functions
   - Monitor function execution time
   - Consider caching for frequently accessed data

3. **Bot:**
   - Bot is now part of Next.js API (no separate service needed)
   - Vercel automatically scales webhook endpoint
   - Monitor webhook delivery in Telegram Bot API

4. **Storage:**
   - Monitor Vercel Blob usage
   - Consider CDN for video delivery
   - Implement cleanup for old/unused files

## Security Checklist

- [ ] All environment variables are set
- [ ] MongoDB user has minimal required permissions
- [ ] Bot token is kept secret
- [ ] API keys are not exposed in client code
- [ ] initData validation is working
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented (if needed)

## Next Steps

- Set up error tracking (Sentry, etc.)
- Implement analytics
- Add monitoring alerts
- Set up CI/CD pipeline
- Configure custom domain (optional)

