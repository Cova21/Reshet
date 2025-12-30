'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/Container';

export default function StreamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [stream, setStream] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [similarStreams, setSimilarStreams] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [user, setUser] = useState(null);
  const [streamId, setStreamId] = useState(null);

  useEffect(() => {
    // Получаем streamId из params
    if (params?.id) {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      setStreamId(parseInt(id));
    }
  }, [params]);

  useEffect(() => {
    if (streamId) {
      fetchStreamData();
      checkAuth();
    }
  }, [streamId]);

  const fetchStreamData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/streams/${streamId}`);
      const data = await response.json();

      if (response.ok) {
        setStream(data.stream);
        setRegisteredUsers(data.registeredUsers);
        setSimilarStreams(data.similarStreams);
        
        // Проверяем записан ли текущий пользователь
        const registrationCheck = await fetch(`/api/streams/${streamId}/check`);
        const registrationData = await registrationCheck.json();
        setIsRegistered(registrationData.isRegistered);
      } else {
        console.error('Ошибка загрузки стрима:', data.error);
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/streams/${streamId}`);
      return;
    }

    if (isRegistered) {
      alert('Вы уже записаны на этот стрим!');
      return;
    }

    if (stream.current_participants >= stream.max_participants) {
      alert('На стриме нет свободных мест!');
      return;
    }

    setRegistering(true);
    try {
      const response = await fetch(`/api/streams/${streamId}/register`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setIsRegistered(true);
        // Обновляем данные стрима
        setStream(prev => ({
          ...prev,
          current_participants: prev.current_participants + 1
        }));
        // Обновляем список пользователей
        fetchStreamData();
        alert('Вы успешно записались на стрим!');
      } else {
        alert(data.error || 'Ошибка записи на стрим');
      }
    } catch (error) {
      console.error('Ошибка записи:', error);
      alert('Ошибка сети. Попробуйте позже.');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading || !streamId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Container>
          <div className="text-white text-xl">Загрузка стрима...</div>
        </Container>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Container>
          <div className="text-center">
            <div className="text-5xl mb-4">😕</div>
            <h1 className="text-3xl font-bold text-white mb-4">Стрим не найден</h1>
            <p className="text-gray-400 mb-6">Запрошенный стрим не существует или был удален</p>
            <Link 
              href="/streams"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Вернуться к списку стримов
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const progressPercentage = Math.min((stream.current_participants / stream.max_participants) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <Container>
        {/* Хлебные крошки */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-gray-400">
            <li>
              <Link href="/" className="hover:text-purple-300 transition">Главная</Link>
            </li>
            <li>→</li>
            <li>
              <Link href="/streams" className="hover:text-purple-300 transition">Стримы</Link>
            </li>
            <li>→</li>
            <li className="text-white font-semibold">{stream.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
              {/* Заголовок и метаданные */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{stream.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-400">
                    <span className="flex items-center">
                      🎮 {stream.game}
                    </span>
                    <span className="flex items-center">
                      🏷️ {stream.genre}
                    </span>
                    <span className="flex items-center">
                      👤 {stream.streamer_name}
                    </span>
                  </div>
                </div>
                <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm">
                  #{stream.id}
                </span>
              </div>

              {/* Описание */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Описание стрима</h2>
                <p className="text-gray-300 leading-relaxed">{stream.description}</p>
              </div>

              {/* Детали стрима */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">📅 Дата и время</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Дата:</span>
                      <span className="text-white font-semibold">{formatDate(stream.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Время:</span>
                      <span className="text-white font-semibold">{stream.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Статус:</span>
                      <span className="text-green-400 font-semibold">Предстоящий</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">👥 Участники</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Зарегистрировано:</span>
                      <span className="text-white font-semibold">
                        {stream.current_participants}/{stream.max_participants}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Свободно мест:</span>
                      <span className="text-white font-semibold">
                        {stream.max_participants - stream.current_participants}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Прогресс:</span>
                      <span className="text-white font-semibold">{Math.round(progressPercentage)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Прогресс-бар */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Заполненность стрима:</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Кнопка записи */}
              <button
                onClick={handleRegister}
                disabled={isRegistered || stream.current_participants >= stream.max_participants || registering}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
                  isRegistered
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : stream.current_participants >= stream.max_participants
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : registering
                    ? 'bg-blue-700 text-white cursor-wait'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {registering ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Идет запись...
                  </div>
                ) : isRegistered ? (
                  '✓ Вы уже записаны на этот стрим'
                ) : stream.current_participants >= stream.max_participants ? (
                  '❌ Стрим полностью заполнен'
                ) : user ? (
                  'Записаться на стрим'
                ) : (
                  'Войдите, чтобы записаться на стрим'
                )}
              </button>
            </div>

            {/* Зарегистрированные пользователи */}
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-6">Участники ({registeredUsers.length})</h2>
              
              {registeredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">👥</div>
                  <p className="text-gray-400">Пока никого нет. Будьте первым!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {registeredUsers.map((user) => (
                    <div key={user.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {user.first_name[0]}{user.last_name[0]}
                        </div>
                        <div>
                          <div className="text-white font-semibold">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-gray-400 text-sm">{user.city}</div>
                        </div>
                      </div>
                      <div className="mt-3 text-gray-400 text-sm">
                        Записался: {new Date(user.registered_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Боковая панель */}
          <div className="lg:col-span-1">
            {/* Информация о стримере */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
              <h2 className="text-xl font-bold text-white mb-4">О стримере</h2>
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                  {stream.streamer_name?.split(' ').map(n => n[0]).join('') || 'A'}
                </div>
                <div>
                  <div className="text-white font-bold text-lg">{stream.streamer_name || 'Администратор'}</div>
                  <div className="text-gray-400">{stream.streamer_city || 'Москва'}</div>
                </div>
              </div>
              <div className="text-gray-300">
                Опытный стример с большим опытом проведения игровых стримов
              </div>
            </div>

            {/* Похожие стримы */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Похожие стримы</h2>
              <div className="space-y-4">
                {similarStreams.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Нет похожих стримов</p>
                ) : (
                  similarStreams.map((similarStream) => (
                    <Link 
                      key={similarStream.id}
                      href={`/streams/${similarStream.id}`}
                      className="block bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-white font-semibold line-clamp-1">{similarStream.title}</div>
                        <span className="text-purple-400 text-sm">{similarStream.genre}</span>
                      </div>
                      <div className="text-gray-400 text-sm">
                        {formatDate(similarStream.date)} • {similarStream.time}
                      </div>
                      <div className="mt-2 text-gray-300 text-sm">
                        {similarStream.current_participants}/{similarStream.max_participants} участников
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Быстрые действия */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4">Быстрые действия</h2>
              <div className="space-y-3">
                <Link
                  href="/streams"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Все стримы
                </Link>
                <button
                  onClick={() => window.print()}
                  className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  Распечатать информацию
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  Поделиться ссылкой
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}