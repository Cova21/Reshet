import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    // await для params
    const { id } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        isRegistered: false,
        message: 'Пользователь не авторизован'
      }, { status: 200 });
    }

    const streamId = parseInt(id);

    // Проверяем записан ли пользователь на стрим
    const registration = db.prepare(`
      SELECT * FROM stream_registrations 
      WHERE user_id = ? AND stream_id = ?
    `).get(user.id, streamId);

    return NextResponse.json({
      isRegistered: !!registration,
      registration: registration || null,
    }, { status: 200 });

  } catch (error) {
    console.error('Ошибка проверки записи:', error);
    return NextResponse.json({
      isRegistered: false,
      error: 'Ошибка сервера'
    }, { status: 500 });
  }
}