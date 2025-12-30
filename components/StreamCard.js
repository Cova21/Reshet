'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StreamCard({ stream }) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamData, setStreamData] = useState(stream);
  const router = useRouter();

  // Проверяем записан ли пользователь на этот стрим
  useEffect(() => {
    checkRegistrationStatus();
  }, []);

const checkRegistrationStatus = async () => {
  try {
    const response = await fetch(`/api/streams/${stream.id}/check`);
    if (!response.ok) {
      console.warn('Ошибка проверки записи:', response.status);
      return;
    }
    const data = await response.json();
    setIsRegistered(data.isRegistered);
  } catch (error) {
    console.error('Ошибка проверки записи:', error);
  }
};

  const handleRegister = async () => {
    if (loading) return;
    
    // Проверяем авторизацию
    const authCheck = await fetch('/api/auth/check');
    const authData = await authCheck.json();
    
    if (!authData.isLoggedIn) {
      router.push('/auth/login?redirect=' + encodeURIComponent(`/streams/${stream.id}`));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/streams/${stream.id}/register`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setIsRegistered(true);
        // Обновляем данные стрима
        setStreamData(prev => ({
          ...prev,
          current_participants: prev.current_participants + 1
        }));
        
        // Показываем уведомление
        alert('Вы успешно записались на стрим!');
      } else {
        alert(data.error || 'Ошибка записи на стрим');
      }
    } catch (error) {
      console.error('Ошибка записи:', error);
      alert('Ошибка сети. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'long'
    });
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const streamDate = new Date(stream.date + 'T' + stream.time);
    const diffMs = streamDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Прошедший';
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Завтра';
    return `Через ${diffDays} дней`;
  };

  const getProgressPercentage = () => {
    return Math.min((streamData.current_participants / streamData.max_participants) * 100, 100);
  };

  return (
    <div 
      className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] stream-card"
      data-game={stream.game}
      data-genre={stream.genre}
      data-date={stream.date}
    >
      {/* Заголовок и статус */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{streamData.title}</h3>
          <p className="text-gray-400 text-sm mb-3">от {stream.streamer_name || 'Администратор'}</p>
        </div>
        <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap ml-2">
          {streamData.genre}
        </span>
      </div>

      {/* Описание */}
      <p className="text-gray-300 mb-6 line-clamp-2">{streamData.description}</p>

      {/* Информация о стриме */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">🎮</span>
            <span className="text-white font-semibold">{streamData.game}</span>
          </div>
          <div className="text-right">
            <div className="text-white font-semibold">{formatDate(streamData.date)}</div>
            <div className="text-gray-400 text-sm">{getTimeRemaining()}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">🕐</span>
            <span className="text-white">{streamData.time}</span>
          </div>
          <div className="text-right">
            <div className="text-white">
              <span className="text-purple-400">{streamData.current_participants}</span>
              <span className="text-gray-400">/{streamData.max_participants}</span>
            </div>
            <div className="text-gray-400 text-sm">участников</div>
          </div>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Заполненность:</span>
          <span>{Math.round(getProgressPercentage())}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex space-x-3">
        <button
          onClick={handleRegister}
          disabled={isRegistered || streamData.current_participants >= streamData.max_participants || loading}
          className={`flex-1 py-3 rounded-lg font-semibold transition ${
            isRegistered
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : streamData.current_participants >= streamData.max_participants
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : loading
              ? 'bg-blue-700 text-white cursor-wait'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Запись...
            </div>
          ) : isRegistered ? (
            '✓ Вы записаны'
          ) : streamData.current_participants >= streamData.max_participants ? (
            'Мест нет'
          ) : (
            'Записаться на стрим'
          )}
        </button>
        
        <Link
          href={`/streams/${stream.id}`}
          className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white w-12 rounded-lg transition"
          title="Подробнее"
        >
          →
        </Link>
      </div>

      {/* Дополнительная информация */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-gray-400 text-sm">
          📍 ID стрима: #{stream.id} • ⏱️ Длительность: 2-3 часа
        </div>
      </div>
    </div>
  );
}