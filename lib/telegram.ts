import crypto from 'crypto';

export interface TelegramUser {
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
 * Creates a mock Telegram user for local testing
 */
export function createMockTelegramUser(telegramId: number, username?: string): TelegramUser {
  return {
    id: telegramId,
    first_name: `Test User ${telegramId}`,
    username: username || `testuser${telegramId}`,
    language_code: 'en',
  };
}

/**
 * Validates and extracts user from initData
 * Supports mock mode for local development when MOCK_TELEGRAM_USER is enabled
 */
export function getUserFromInitData(initData: string, botToken: string): TelegramUser | null {
  const mockModeEnabled = process.env.MOCK_TELEGRAM_USER === 'true';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Support mock format: "mock:123456" where number is telegram_id
  // This works in both mock mode and development mode
  if (initData.startsWith('mock:')) {
    const telegramId = parseInt(initData.split(':')[1], 10);
    if (!isNaN(telegramId)) {
      if (mockModeEnabled || isDevelopment) {
        return createMockTelegramUser(telegramId);
      }
    }
  }
  
  // Support JSON format in mock/development mode: {"id": 123456, "username": "test"}
  if ((mockModeEnabled || isDevelopment) && initData.startsWith('{')) {
    try {
      const mockUser = JSON.parse(initData);
      if (mockUser.id) {
        return {
          id: mockUser.id,
          first_name: mockUser.first_name || `Test User ${mockUser.id}`,
          last_name: mockUser.last_name,
          username: mockUser.username || `testuser${mockUser.id}`,
          language_code: mockUser.language_code || 'en',
          is_premium: mockUser.is_premium,
          photo_url: mockUser.photo_url,
        };
      }
    } catch (e) {
      // Not valid JSON, continue with normal validation
    }
  }
  
  // Normal validation
  if (!validateInitData(initData, botToken)) {
    // In mock mode, if validation fails, return a default test user
    if (mockModeEnabled) {
      console.warn('[MOCK MODE] Telegram validation failed, using default test user');
      return createMockTelegramUser(123456789, 'testuser');
    }
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

