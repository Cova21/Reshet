import Link from 'next/link';
import Container from '@/components/Container';
import { db } from '@/lib/database';

export default function HomePage() {
  const featuredStreams = db.prepare(`
    SELECT * FROM streams 
    WHERE date >= '2024-12-01'
    ORDER BY date, time 
    LIMIT 3
  `).all();

  const stats = {
    totalStreams: db.prepare('SELECT COUNT(*) as count FROM streams').get().count,
    totalUsers: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
    upcomingStreams: db.prepare("SELECT COUNT(*) as count FROM streams WHERE date >= '2024-12-01'").get().count,
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-900 to-blue-900 text-white py-20">
        <Container>
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Присоединяйся к миру игровых стримов
            </h1>
            <p className="text-xl mb-10 text-gray-300 max-w-2xl mx-auto">
              Записывайся на стримы, находи единомышленников и наслаждайся играми вместе с нами!
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/auth/register"
                className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg text-lg font-semibold transition"
              >
                Начать бесплатно
              </Link>
              <Link
                href="/streams"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold transition"
              >
                Смотреть стримы
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-800">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-900 rounded-xl">
              <div className="text-4xl font-bold text-purple-400 mb-2">{stats.totalStreams}</div>
              <div className="text-gray-300">Всего стримов</div>
            </div>
            <div className="text-center p-6 bg-gray-900 rounded-xl">
              <div className="text-4xl font-bold text-blue-400 mb-2">{stats.totalUsers}</div>
              <div className="text-gray-300">Активных игроков</div>
            </div>
            <div className="text-center p-6 bg-gray-900 rounded-xl">
              <div className="text-4xl font-bold text-green-400 mb-2">{stats.upcomingStreams}</div>
              <div className="text-gray-300">Ближайших ивентов</div>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Streams */}
      <section className="py-16">
        <Container>
          <h2 className="text-3xl font-bold text-white mb-10 text-center">
            Ближайшие стримы
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredStreams.map((stream) => (
              <div key={stream.id} className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-3">{stream.title}</h3>
                <p className="text-gray-300 mb-4">{stream.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-purple-400 font-semibold">{stream.game}</span>
                  <span className="text-gray-400">{stream.date} в {stream.time}</span>
                </div>
                <Link
                  href={`/streams/${stream.id}`}
                  className="mt-4 inline-block w-full text-center bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition"
                >
                  Подробнее
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/streams"
              className="inline-block border-2 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Все стримы
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}