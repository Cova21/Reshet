'use client';

import { useState, useEffect } from 'react';
import StreamCard from '@/components/StreamCard';
import Container from '@/components/Container';

export default function StreamsPage() {
  const [streams, setStreams] = useState([]);
  const [filteredStreams, setFilteredStreams] = useState([]);
  const [popularGames, setPopularGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    game: 'all',
    genre: 'all',
    date: 'all'
  });

  useEffect(() => {
    fetchStreamsData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, streams]);

  const fetchStreamsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/streams');
      const data = await response.json();
      
      if (response.ok) {
        setStreams(data.streams || []);
        setFilteredStreams(data.streams || []);
        setPopularGames(data.popularGames || []);
        setGenres(data.genres || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки стримов:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!streams.length) return;

    let result = [...streams];

    // Фильтр по игре
    if (filters.game !== 'all') {
      result = result.filter(stream => stream.game === filters.game);
    }

    // Фильтр по жанру
    if (filters.genre !== 'all') {
      result = result.filter(stream => stream.genre === filters.genre);
    }

    // Фильтр по дате
    if (filters.date !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      if (filters.date === 'today') {
        result = result.filter(stream => stream.date === today);
      } else if (filters.date === 'tomorrow') {
        result = result.filter(stream => stream.date === tomorrow);
      } else if (filters.date === 'week') {
        const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
        result = result.filter(stream => stream.date >= today && stream.date <= weekFromNow);
      }
    }

    setFilteredStreams(result);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      game: 'all',
      genre: 'all',
      date: 'all'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <Container>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Загрузка стримов...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <Container>
        {/* Заголовок и описание */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Все стримы</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Выбирайте стримы по интересам, записывайтесь и присоединяйтесь к игровому сообществу!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Боковая панель с фильтрами */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg sticky top-6">
              <h2 className="text-xl font-bold text-white mb-6">Фильтры</h2>

              {/* Фильтр по играм */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Игры</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="game"
                      value="all"
                      checked={filters.game === 'all'}
                      onChange={(e) => handleFilterChange('game', e.target.value)}
                      className="mr-2 h-4 w-4 text-purple-600"
                    />
                    <span className="text-gray-300">Все игры</span>
                  </label>
                  {popularGames.map((game) => (
                    <label key={game.game} className="flex items-center">
                      <input
                        type="radio"
                        name="game"
                        value={game.game}
                        checked={filters.game === game.game}
                        onChange={(e) => handleFilterChange('game', e.target.value)}
                        className="mr-2 h-4 w-4 text-purple-600"
                      />
                      <span className="text-gray-300">
                        {game.game} <span className="text-gray-500 text-sm">({game.count})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Фильтр по жанрам */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Жанры</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="genre"
                      value="all"
                      checked={filters.genre === 'all'}
                      onChange={(e) => handleFilterChange('genre', e.target.value)}
                      className="mr-2 h-4 w-4 text-blue-600"
                    />
                    <span className="text-gray-300">Все жанры</span>
                  </label>
                  {genres.map((genre) => (
                    <label key={genre.genre} className="flex items-center">
                      <input
                        type="radio"
                        name="genre"
                        value={genre.genre}
                        checked={filters.genre === genre.genre}
                        onChange={(e) => handleFilterChange('genre', e.target.value)}
                        className="mr-2 h-4 w-4 text-blue-600"
                      />
                      <span className="text-gray-300">{genre.genre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Фильтр по дате */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Дата</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="date"
                      value="all"
                      checked={filters.date === 'all'}
                      onChange={(e) => handleFilterChange('date', e.target.value)}
                      className="mr-2 h-4 w-4 text-green-600"
                    />
                    <span className="text-gray-300">Все даты</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="date"
                      value="today"
                      checked={filters.date === 'today'}
                      onChange={(e) => handleFilterChange('date', e.target.value)}
                      className="mr-2 h-4 w-4 text-green-600"
                    />
                    <span className="text-gray-300">Сегодня</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="date"
                      value="tomorrow"
                      checked={filters.date === 'tomorrow'}
                      onChange={(e) => handleFilterChange('date', e.target.value)}
                      className="mr-2 h-4 w-4 text-green-600"
                    />
                    <span className="text-gray-300">Завтра</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="date"
                      value="week"
                      checked={filters.date === 'week'}
                      onChange={(e) => handleFilterChange('date', e.target.value)}
                      className="mr-2 h-4 w-4 text-green-600"
                    />
                    <span className="text-gray-300">Эта неделя</span>
                  </label>
                </div>
              </div>

              {/* Сброс фильтров */}
              <button
                onClick={resetFilters}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
              >
                Сбросить фильтры
              </button>
            </div>
          </div>

          {/* Основной контент - сетка стримов */}
          <div className="lg:col-span-3">
            {/* Статистика и сортировка */}
            <div className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Доступные стримы <span className="text-purple-400">({filteredStreams.length})</span>
                  </h2>
                  <p className="text-gray-400 mt-1">
                    {filters.game !== 'all' && `Игра: ${filters.game} • `}
                    {filters.genre !== 'all' && `Жанр: ${filters.genre} • `}
                    {filters.date !== 'all' && `Дата: ${filters.date}`}
                    {filters.game === 'all' && filters.genre === 'all' && filters.date === 'all' && 
                      'Все стримы, записывайтесь на понравившиеся!'}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <select 
                    className="bg-gray-700 text-white p-3 rounded-lg"
                    onChange={(e) => {
                      // Здесь можно добавить логику сортировки
                      console.log('Сортировка:', e.target.value);
                    }}
                  >
                    <option value="date_asc">Дата (сначала ближайшие)</option>
                    <option value="date_desc">Дата (сначала дальние)</option>
                    <option value="participants_desc">По количеству участников</option>
                    <option value="game_asc">По названию игры (А-Я)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Сетка стримов */}
            {filteredStreams.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-12 text-center shadow-lg">
                <div className="text-gray-400 text-5xl mb-4">🎮</div>
                <h3 className="text-2xl font-bold text-white mb-4">Стримы не найдены</h3>
                <p className="text-gray-400 mb-6">
                  {streams.length === 0 
                    ? 'Стримов пока нет. Зайдите позже!' 
                    : 'Попробуйте изменить фильтры для поиска стримов.'}
                </p>
                <button 
                  onClick={resetFilters}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredStreams.map((stream) => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            )}

            {/* Пагинация (пока заглушка) */}
            {filteredStreams.length > 0 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button className="bg-gray-800 hover:bg-gray-700 text-white w-10 h-10 rounded-lg flex items-center justify-center transition">
                    ←
                  </button>
                  <button className="bg-purple-600 text-white w-10 h-10 rounded-lg flex items-center justify-center">
                    1
                  </button>
                  <button className="bg-gray-800 hover:bg-gray-700 text-white w-10 h-10 rounded-lg flex items-center justify-center transition">
                    2
                  </button>
                  <button className="bg-gray-800 hover:bg-gray-700 text-white w-10 h-10 rounded-lg flex items-center justify-center transition">
                    3
                  </button>
                  <button className="bg-gray-800 hover:bg-gray-700 text-white w-10 h-10 rounded-lg flex items-center justify-center transition">
                    →
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}