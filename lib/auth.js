import { cookies } from 'next/headers';
import { db } from './database.js';
import bcrypt from 'bcryptjs';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function createSession(userId) {
  const sessionId = Math.random().toString(36).substring(2);
  const cookieStore = await cookies();
  
  // Простая реализация сессии
  // В реальном проекте нужно сохранять сессию в БД
  cookieStore.set('user_id', userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 неделя
    path: '/',
  });

  return sessionId;
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    
    if (!userId) return null;

    const user = db.prepare(`
      SELECT id, email, first_name, last_name, birth_date, city, 
             favorite_games, favorite_genres, created_at 
      FROM users 
      WHERE id = ?
    `).get(parseInt(userId));

    return user || null;
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete('user_id');
}