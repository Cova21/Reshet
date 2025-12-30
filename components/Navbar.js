'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Container from './Container';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, [pathname]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      setIsLoggedIn(data.isLoggedIn);
      setUser(data.user);
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  if (loading) {
    return (
      <nav className="bg-gray-900 text-white shadow-lg">
        <Container>
          <div className="flex justify-between items-center py-3">
            <div className="text-2xl font-bold text-purple-400">GameStream</div>
            <div className="animate-pulse text-gray-400">Загрузка...</div>
          </div>
        </Container>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <Container>
        <div className="flex justify-between items-center py-3">
          <Link href="/" className="text-2xl font-bold text-purple-400 hover:text-purple-300 transition">
            GameStream
          </Link>

          <div className="flex items-center space-x-6">
            <Link 
              href="/" 
              className={`hover:text-purple-300 transition ${pathname === '/' ? 'text-purple-400 font-semibold' : ''}`}
            >
              Главная
            </Link>
            <Link 
              href="/streams" 
              className={`hover:text-purple-300 transition ${pathname === '/streams' ? 'text-purple-400 font-semibold' : ''}`}
            >
              Стримы
            </Link>

            {isLoggedIn ? (
              <>
                <Link 
                  href="/profile" 
                  className={`hover:text-purple-300 transition ${pathname === '/profile' ? 'text-purple-400 font-semibold' : ''}`}
                >
                  Профиль
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-300 hidden md:inline">
                    Привет, {user?.first_name}!
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition text-sm"
                  >
                    Выйти
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/auth/login" 
                  className={`hover:text-purple-300 transition ${pathname === '/auth/login' ? 'text-purple-400 font-semibold' : ''}`}
                >
                  Вход
                </Link>
                <Link 
                  href="/auth/register"
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition text-sm"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </Container>
    </nav>
  );
}