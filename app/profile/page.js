'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/Container';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userStreams, setUserStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
    fetchUserStreams();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      
      if (data.isLoggedIn) {
        setUser(data.user);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStreams = async () => {
    try {
      const response = await fetch('/api/streams/my');
      const data = await response.json();
      
      if (response.ok) {
        setUserStreams(data.streams || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки стримов:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Container>
          <div className="text-white text-xl">Загрузка профиля...</div>
        </Container>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Мой профиль</h1>
            <p className="text-gray-400">Управляйте вашими данными и записанными стримами</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Левая колонка - информация о пользователе */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
                <h2 className="text-2xl font-bold text-white mb-6">Личная информация</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Имя</label>
                    <div className="text-white text-lg font-semibold">{user.first_name}</div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Фамилия</label>
                    <div className="text-white text-lg font-semibold">{user.last_name}</div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Email</label>
                    <div className="text-white text-lg">{user.email}</div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Город</label>
                    <div className="text-white text-lg">{user.city}</div>
                  </div>
                  
                  {user.birth_date && (
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Дата рождения</label>
                      <div className="text-white text-lg">
                        {new Date(user.birth_date).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  )}
                  
                  {user.favorite_games && (
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Любимые игры</label>
                      <div className="text-white text-lg">{user.favorite_games}</div>
                    </div>
                  )}
                  
                  {user.favorite_genres && (
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Любимые жанры</label>
                      <div className="text-white text-lg">{user.favorite_genres}</div>
                    </div>
                  )}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <Link
                    href="/auth/register"
                    className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Редактировать профиль
                  </Link>
                </div>
              </div>

              {/* Мои стримы */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6">Мои записи на стримы</h2>
                
                {userStreams.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">Вы еще не записались ни на один стрим</div>
                    <Link
                      href="/streams"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Посмотреть стримы
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userStreams.map((stream) => (
                      <div key={stream.id} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{stream.title}</h3>
                            <p className="text-gray-300 text-sm mt-1">{stream.game} • {stream.genre}</p>
                            <p className="text-gray-400 text-sm mt-1">
                              {stream.date} в {stream.time}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                              Записан
                            </span>
                            <Link
                              href={`/streams/${stream.id}`}
                              className="block mt-2 text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Подробнее →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Правая колонка - статистика */}
            <div>
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg sticky top-6">
                <h2 className="text-2xl font-bold text-white mb-6">Статистика</h2>
                
                <div className="space-y-6">
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {userStreams.length}
                    </div>
                    <div className="text-gray-300">Записей на стримы</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {new Date().getFullYear() - new Date(user.birth_date).getFullYear()}
                    </div>
                    <div className="text-gray-300">Лет</div>
                  </div>
                  
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="font-semibold text-white mb-3">Быстрые действия</h3>
                    <div className="space-y-3">
                      <Link
                        href="/streams"
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                      >
                        Найти стримы
                      </Link>
                      <Link
                        href="/"
                        className="block w-full text-center bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition"
                      >
                        На главную
                      </Link>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">Аккаунт создан</h3>
                    <div className="text-gray-300">
                      {new Date(user.created_at).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}