# ⚡ Quick Start Guide

Get your Plush Gifts Telegram Mini App running in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
WEBAPP_URL=http://localhost:3000
GOOGLE_API_KEY=your_google_api_key
BLOB_WRITE_TOKEN=vercel_blob_write_token
BLOB_READ_TOKEN=vercel_blob_read_token
TELEGRAM_BOT_SECRET=your_bot_secret
```

## 3. Run Development Server

```bash
npm run dev
```

The Next.js app will run on http://localhost:3000

## 4. Set Up Webhook (For Local Development)

For local development, you'll need to expose your local server to Telegram:

### Option A: Use ngrok (Recommended)

1. Install ngrok: https://ngrok.com/download
2. Expose your local server:
   ```bash
   ngrok http 3000
   ```
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Set webhook:
   ```bash
   curl -X POST https://abc123.ngrok.io/api/telegram/setup
   ```

### Option B: Use Vercel Dev (For Testing)

1. Deploy to Vercel first
2. Set webhook to production URL:
   ```bash
   curl -X POST https://your-app.vercel.app/api/telegram/setup
   ```

## 5. Test Locally

1. Open your bot in Telegram
2. Send `/start` command
3. Verify bot responds (webhook is working)
4. Click the "Open Mini App" button
5. Test the daily box flow

## 🎯 Next Steps

- Set up MongoDB Atlas (see README.md)
- Configure Gemini API (get key from https://aistudio.google.com/app/apikey)
- Deploy to Vercel (see DEPLOYMENT.md)
- Set up webhook after deployment

## 🐛 Common Issues

### "Cannot find module" errors
Run `npm install` again

### Bot not responding
- Check BOT_TOKEN is correct
- Verify webhook is set: `curl https://your-url/api/telegram/setup`
- For local dev: Ensure ngrok is running and webhook URL is correct
- Check Next.js server logs for errors
- Verify `/api/telegram/webhook` route is accessible

### MongoDB connection errors
- Verify MONGODB_URI is correct
- Check MongoDB Atlas IP whitelist
- Ensure database user has proper permissions

### API errors
- Check all environment variables are set
- Verify GOOGLE_API_KEY is valid
- Review console logs

## 📚 Full Documentation

- [README.md](./README.md) - Complete documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide

