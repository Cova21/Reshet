import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    // Получаем все стримы без фильтрации по дате
    const streams = db.prepare(`
      SELECT s.*, 
             u.first_name || ' ' || u.last_name as streamer_name,
             COUNT(sr.id) as registered_count
      FROM streams s
      LEFT JOIN users u ON s.streamer_id = u.id
      LEFT JOIN stream_registrations sr ON s.id = sr.stream_id
      GROUP BY s.id
      ORDER BY s.date ASC, s.time ASC
    `).all();

    // Получаем популярные игры для фильтрации
    const popularGames = db.prepare(`
      SELECT game, COUNT(*) as count 
      FROM streams 
      GROUP BY game 
      ORDER BY count DESC 
      LIMIT 10
    `).all();

    // Получаем жанры для фильтрации
    const genres = db.prepare(`
      SELECT DISTINCT genre 
      FROM streams 
      ORDER BY genre
    `).all();

    console.log(`✅ Получено ${streams.length} стримов из базы данных`);

    return NextResponse.json({
      streams: streams,
      popularGames: popularGames,
      genres: genres,
      total: streams.length,
    }, { status: 200 });

  } catch (error) {
    console.error('Ошибка получения стримов:', error);
    return NextResponse.json(
      { 
        streams: [],
        popularGames: [],
        genres: [],
        error: 'Внутренняя ошибка сервера',
        message: error.message 
      },
      { status: 500 }
    );
  }
}