'use client';

import { useState } from 'react';
import Link from 'next/link';
import Container from '@/components/Container';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    city: '',
    favoriteGames: '',
    favoriteGenres: [],
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'favoriteGenres') {
      // Для мультиселекта обрабатываем массив значений
      const options = e.target.options;
      const selectedValues = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedValues.push(options[i].value);
        }
      }
      setFormData(prev => ({ ...prev, [name]: selectedValues }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.includes('@')) {
      newErrors.email = 'Введите корректный email';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна';
    }
    if (!formData.birthDate) {
      newErrors.birthDate = 'Дата рождения обязательна';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Город обязателен';
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

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          birth_date: formData.birthDate,
          city: formData.city,
          favorite_games: formData.favoriteGames,
          favorite_genres: formData.favoriteGenres.join(', '),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      } else {
        setErrors({ submit: data.error || 'Ошибка регистрации' });
      }
    } catch (error) {
      setErrors({ submit: 'Ошибка сети' });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Container>
          <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
            <div className="text-green-400 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-white mb-4">Регистрация успешна!</h2>
            <p className="text-gray-300">Перенаправляем на страницу входа...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <Container>
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800 p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-white mb-2 text-center">Регистрация</h1>
            <p className="text-gray-400 text-center mb-8">Создайте аккаунт для доступа к стримам</p>

            {errors.submit && (
              <div className="bg-red-900 text-red-200 p-3 rounded-lg mb-6">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Имя *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full bg-gray-700 text-white p-3 rounded-lg ${errors.firstName ? 'border-2 border-red-500' : ''}`}
                    placeholder="Иван"
                  />
                  {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Фамилия *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full bg-gray-700 text-white p-3 rounded-lg ${errors.lastName ? 'border-2 border-red-500' : ''}`}
                    placeholder="Иванов"
                  />
                  {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-gray-700 text-white p-3 rounded-lg ${errors.email ? 'border-2 border-red-500' : ''}`}
                  placeholder="ivan@example.com"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Пароль *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full bg-gray-700 text-white p-3 rounded-lg ${errors.password ? 'border-2 border-red-500' : ''}`}
                  />
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Подтвердите пароль *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full bg-gray-700 text-white p-3 rounded-lg ${errors.confirmPassword ? 'border-2 border-red-500' : ''}`}
                  />
                  {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Дата рождения *</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className={`w-full bg-gray-700 text-white p-3 rounded-lg ${errors.birthDate ? 'border-2 border-red-500' : ''}`}
                />
                {errors.birthDate && <p className="text-red-400 text-sm mt-1">{errors.birthDate}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Город проживания *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full bg-gray-700 text-white p-3 rounded-lg ${errors.city ? 'border-2 border-red-500' : ''}`}
                  placeholder="Москва"
                />
                {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Любимые игры</label>
                <input
                  type="text"
                  name="favoriteGames"
                  value={formData.favoriteGames}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg"
                  placeholder="CS:GO, Dota 2, Valorant"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Любимые жанры</label>
                <select
                  name="favoriteGenres"
                  value={formData.favoriteGenres}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg"
                  multiple
                  size="4"
                >
                  <option value="Shooter">Шутер</option>
                  <option value="MOBA">MOBA</option>
                  <option value="RPG">RPG</option>
                  <option value="Strategy">Стратегия</option>
                  <option value="Sports">Спортивные</option>
                  <option value="Adventure">Приключения</option>
                  <option value="Simulation">Симулятор</option>
                </select>
                <p className="text-gray-400 text-sm mt-1">
                  {formData.favoriteGenres.length > 0 
                    ? `Выбрано: ${formData.favoriteGenres.join(', ')}` 
                    : 'Удерживайте Ctrl (Cmd на Mac) для выбора нескольких'}
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold transition"
              >
                Зарегистрироваться
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Уже есть аккаунт?{' '}
                <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                  Войти
                </Link>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}