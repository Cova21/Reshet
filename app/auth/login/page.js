'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Успешный вход
        router.push('/profile');
        router.refresh();
      } else {
        setErrors({ submit: data.error || 'Ошибка входа' });
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      setErrors({ submit: 'Ошибка сети. Попробуйте позже.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <Container>
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800 p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-white mb-2 text-center">Вход в аккаунт</h1>
            <p className="text-gray-400 text-center mb-8">Введите данные для входа в систему</p>

            {errors.submit && (
              <div className="bg-red-900 text-red-200 p-3 rounded-lg mb-6">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full bg-gray-700 text-white p-3 rounded-lg ${errors.email ? 'border-2 border-red-500' : ''}`}
                  placeholder="ivan@example.com"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Пароль *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full bg-gray-700 text-white p-3 rounded-lg ${errors.password ? 'border-2 border-red-500' : ''}`}
                  placeholder="Введите пароль"
                />
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Вход...
                  </div>
                ) : 'Войти'}
              </button>

              <div className="text-center">
                <Link 
                  href="/auth/register" 
                  className="text-purple-400 hover:text-purple-300 font-semibold text-sm"
                >
                  Нет аккаунта? Зарегистрироваться
                </Link>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Тестовые учетные данные:</p>
                <div className="mt-2 p-3 bg-gray-900 rounded-lg text-left">
                  <p className="text-gray-300 text-sm"><span className="text-gray-400">Email:</span> admin@example.com</p>
                  <p className="text-gray-300 text-sm"><span className="text-gray-400">Пароль:</span> admin123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}