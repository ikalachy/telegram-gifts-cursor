import crypto from 'crypto';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface ParsedInitData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  query_id?: string;
  start_param?: string;
}

/**
 * Validates Telegram WebApp initData signature
 */
export function validateInitData(initData: string, botToken: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return false;
    }

    urlParams.delete('hash');
    
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (error) {
    console.error('Error validating initData:', error);
    return false;
  }
}

/**
 * Parses Telegram WebApp initData and extracts user information
 */
export function parseInitData(initData: string): ParsedInitData | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    
    const parsed: ParsedInitData = {
      auth_date: parseInt(urlParams.get('auth_date') || '0', 10),
      hash: urlParams.get('hash') || '',
    };

    if (userParam) {
      parsed.user = JSON.parse(userParam);
    }

    if (urlParams.get('query_id')) {
      parsed.query_id = urlParams.get('query_id') || undefined;
    }

    if (urlParams.get('start_param')) {
      parsed.start_param = urlParams.get('start_param') || undefined;
    }

    return parsed;
  } catch (error) {
    console.error('Error parsing initData:', error);
    return null;
  }
}

/**
 * Validates and extracts user from initData
 */
export function getUserFromInitData(initData: string, botToken: string): TelegramUser | null {
  if (!validateInitData(initData, botToken)) {
    return null;
  }

  const parsed = parseInitData(initData);
  return parsed?.user || null;
}

/**
 * Checks if initData is not expired (24 hours)
 */
export function isInitDataValid(initData: string): boolean {
  const parsed = parseInitData(initData);
  if (!parsed) {
    return false;
  }

  const authDate = parsed.auth_date * 1000; // Convert to milliseconds
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  return (now - authDate) < maxAge;
}

