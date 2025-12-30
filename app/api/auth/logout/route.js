import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export async function POST() {
  try {
    await destroySession();
    
    return NextResponse.json({
      message: 'Выход выполнен успешно',
    }, { status: 200 });

  } catch (error) {
    console.error('Ошибка выхода:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}