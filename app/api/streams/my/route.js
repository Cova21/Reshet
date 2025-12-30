import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const streams = db.prepare(`
      SELECT s.* FROM streams s
      INNER JOIN stream_registrations sr ON s.id = sr.stream_id
      WHERE sr.user_id = ?
      ORDER BY s.date DESC, s.time DESC
    `).all(user.id);

    return NextResponse.json({
      streams: streams,
    }, { status: 200 });

  } catch (error) {
    console.error('Ошибка загрузки стримов:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}