/**
 * Helper utilities for mocking Telegram users in local development
 * 
 * Usage:
 * 1. Set MOCK_TELEGRAM_USER=true in your .env file (or it will auto-enable in development mode)
 * 2. Use one of the mock initData formats when calling API endpoints
 */

import { createMockTelegramUser, TelegramUser } from './telegram';

/**
 * Generate mock initData for testing
 * 
 * @param telegramId - The Telegram user ID to mock
 * @param username - Optional username
 * @returns A mock initData string that can be used in API calls
 */
export function generateMockInitData(telegramId: number, username?: string): string {
  return `mock:${telegramId}`;
}

/**
 * Generate mock initData as JSON (more flexible)
 * 
 * @param user - Partial TelegramUser object
 * @returns A JSON string that can be used as initData in mock mode
 */
export function generateMockInitDataJSON(user: Partial<TelegramUser>): string {
  return JSON.stringify({
    id: user.id || 123456789,
    first_name: user.first_name || `Test User ${user.id || 123456789}`,
    username: user.username || `testuser${user.id || 123456789}`,
    ...user,
  });
}

/**
 * Example mock users for testing
 */
export const MOCK_USERS = {
  user1: createMockTelegramUser(123456789, 'testuser1'),
  user2: createMockTelegramUser(987654321, 'testuser2'),
  premium: {
    id: 111222333,
    first_name: 'Premium User',
    username: 'premiumuser',
    is_premium: true,
  } as TelegramUser,
};

/**
 * Example usage in API calls:
 * 
 * // Simple format
 * const initData = generateMockInitData(123456789);
 * fetch('/api/user/style?initData=' + encodeURIComponent(initData))
 * 
 * // JSON format (more control)
 * const initData = generateMockInitDataJSON({ id: 123456789, username: 'myuser' });
 * fetch('/api/user/style', {
 *   method: 'POST',
 *   body: JSON.stringify({ initData, style: 'anime' })
 * })
 */

