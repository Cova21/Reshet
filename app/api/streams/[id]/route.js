import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request, { params }) {
  try {
    // await для params
    const { id } = await params;
    const streamId = parseInt(id);

    // Получаем информацию о стриме
    const stream = db.prepare(`
      SELECT s.*, 
             u.first_name || ' ' || u.last_name as streamer_name,
             u.city as streamer_city,
             COUNT(sr.id) as registered_count
      FROM streams s
      LEFT JOIN users u ON s.streamer_id = u.id
      LEFT JOIN stream_registrations sr ON s.id = sr.stream_id
      WHERE s.id = ?
      GROUP BY s.id
    `).get(streamId);

    if (!stream) {
      return NextResponse.json(
        { error: 'Стрим не найден' },
        { status: 404 }
      );
    }

    // Получаем список зарегистрированных пользователей
    const registeredUsers = db.prepare(`
      SELECT u.id, u.first_name, u.last_name, u.city, sr.registered_at
      FROM stream_registrations sr
      JOIN users u ON sr.user_id = u.id
      WHERE sr.stream_id = ?
      ORDER BY sr.registered_at ASC
    `).all(streamId);

    // Получаем похожие стримы
    const similarStreams = db.prepare(`
      SELECT * FROM streams 
      WHERE game = ? AND id != ? 
      ORDER BY date ASC
      LIMIT 3
    `).all(stream.game, streamId);

    return NextResponse.json({
      stream: stream,
      registeredUsers: registeredUsers,
      similarStreams: similarStreams,
      availableSpots: stream.max_participants - stream.registered_count,
    }, { status: 200 });

  } catch (error) {
    console.error('Ошибка получения стрима:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}