import type { D1Database } from '@cloudflare/workers-types';

export interface UserRow {
  telegram_id: number;
  display_name: string;
  created_at: number;
}

/**
 * Insert or update a user record. Updates display_name on conflict.
 */
export async function upsertUser(
  db: D1Database,
  telegramId: number,
  displayName: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO users (telegram_id, display_name, created_at)
       VALUES (?, ?, ?)
       ON CONFLICT(telegram_id) DO UPDATE SET display_name = excluded.display_name`,
    )
    .bind(telegramId, displayName, Math.floor(Date.now() / 1000))
    .run();
}

/**
 * Fetch a user by Telegram ID. Returns null if not found.
 */
export async function getUser(db: D1Database, telegramId: number): Promise<UserRow | null> {
  const row = await db
    .prepare('SELECT telegram_id, display_name, created_at FROM users WHERE telegram_id = ?')
    .bind(telegramId)
    .first<UserRow>();
  return row ?? null;
}

/**
 * Update the display name for an existing user.
 */
export async function updateDisplayName(
  db: D1Database,
  telegramId: number,
  displayName: string,
): Promise<void> {
  await db
    .prepare('UPDATE users SET display_name = ? WHERE telegram_id = ?')
    .bind(displayName, telegramId)
    .run();
}
