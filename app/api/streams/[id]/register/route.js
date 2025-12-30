import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    // await для params
    const { id } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Для записи на стрим необходимо войти в систему' },
        { status: 401 }
      );
    }

    const streamId = parseInt(id);

    // Проверяем существование стрима
    const stream = db.prepare('SELECT * FROM streams WHERE id = ?').get(streamId);
    
    if (!stream) {
      return NextResponse.json(
        { error: 'Стрим не найден' },
        { status: 404 }
      );
    }

    // Проверяем не записан ли уже пользователь
    const existingRegistration = db.prepare(`
      SELECT * FROM stream_registrations 
      WHERE user_id = ? AND stream_id = ?
    `).get(user.id, streamId);

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Вы уже записаны на этот стрим' },
        { status: 400 }
      );
    }

    // Проверяем есть ли свободные места
    const currentParticipants = db.prepare(`
      SELECT COUNT(*) as count FROM stream_registrations 
      WHERE stream_id = ?
    `).get(streamId).count;

    if (currentParticipants >= stream.max_participants) {
      return NextResponse.json(
        { error: 'На стриме нет свободных мест' },
        { status: 400 }
      );
    }

    // Начинаем транзакцию
    const transaction = db.transaction(() => {
      // Записываем пользователя на стрим
      db.prepare(`
        INSERT INTO stream_registrations (user_id, stream_id)
        VALUES (?, ?)
      `).run(user.id, streamId);

      // Обновляем счетчик участников
      db.prepare(`
        UPDATE streams 
        SET current_participants = current_participants + 1 
        WHERE id = ?
      `).run(streamId);
    });

    transaction();

    return NextResponse.json({
      message: 'Вы успешно записались на стрим',
      streamId: streamId,
      userId: user.id,
    }, { status: 200 });

  } catch (error) {
    console.error('Ошибка записи на стрим:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}