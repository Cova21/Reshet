import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const data = await request.json();

    // Ищем пользователя по email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(data.email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь с таким email не найден' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    const isValidPassword = await verifyPassword(data.password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      );
    }

    // Создаем сессию
    await createSession(user.id);

    // Возвращаем данные пользователя (без пароля)
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      message: 'Вход успешен',
      user: userWithoutPassword,
    }, { status: 200 });

  } catch (error) {
    console.error('Ошибка входа:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}