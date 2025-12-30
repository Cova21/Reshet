import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const data = await request.json();

    // Проверяем существование пользователя
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await hashPassword(data.password);

    // Сохраняем пользователя
    const result = db.prepare(`
      INSERT INTO users (email, password, first_name, last_name, birth_date, city, favorite_games, favorite_genres)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.email,
      hashedPassword,
      data.first_name,
      data.last_name,
      data.birth_date,
      data.city,
      data.favorite_games || '',
      data.favorite_genres || ''
    );

    // Создаем сессию
    await createSession(result.lastInsertRowid);

    return NextResponse.json(
      { message: 'Регистрация успешна', userId: result.lastInsertRowid },
      { status: 201 }
    );
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}