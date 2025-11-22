import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

export async function POST(request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json(
        { error: 'BOT_TOKEN is not set' },
        { status: 500 }
      );
    }

    if (!WEBAPP_URL) {
      return NextResponse.json(
        { error: 'WEBAPP_URL is not set' },
        { status: 500 }
      );
    }

    const webhookUrl = `${WEBAPP_URL}/api/telegram/webhook`;
    
    // Set webhook URL
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query', 'inline_query', 'web_app_data'],
      }
    );

    if (response.data.ok) {
      return NextResponse.json({
        success: true,
        message: 'Webhook set successfully',
        webhook_url: webhookUrl,
        telegram_response: response.data,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to set webhook', details: response.data },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error setting webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json(
        { error: 'BOT_TOKEN is not set' },
        { status: 500 }
      );
    }

    // Get webhook info
    const response = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );

    return NextResponse.json({
      success: true,
      webhook_info: response.data,
    });
  } catch (error: any) {
    console.error('Error getting webhook info:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

