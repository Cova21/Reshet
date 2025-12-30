import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Container from '@/components/Container';
import { initDatabase } from '@/lib/database';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GameStream - Платформа для игровых стримов',
  description: 'Присоединяйтесь к миру игровых стримов и найдите единомышленников',
};

// Инициализируем базу данных
initDatabase();

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-screen`}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-900 border-t border-gray-800 py-8">
          <Container>
            <div className="text-center text-gray-400">
              <p>© 2024 GameStream. Все права защищены.</p>
              <p className="mt-2">Платформа для игровых стримов и сообщества</p>
              <div className="mt-4 flex justify-center space-x-6">
                <a href="#" className="hover:text-purple-300 transition">Правила</a>
                <a href="#" className="hover:text-purple-300 transition">Контакты</a>
                <a href="#" className="hover:text-purple-300 transition">Поддержка</a>
                <a href="#" className="hover:text-purple-300 transition">О нас</a>
              </div>
            </div>
          </Container>
        </footer>
      </body>
    </html>
  );
}