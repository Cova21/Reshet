import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, '..', 'database.db'));

// Инициализация базы данных
function initDatabase() {
  // Пользователи
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      city TEXT NOT NULL,
      favorite_games TEXT,
      favorite_genres TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Стримы
  db.exec(`
    CREATE TABLE IF NOT EXISTS streams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      game TEXT NOT NULL,
      genre TEXT NOT NULL,
      streamer_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      max_participants INTEGER,
      current_participants INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (streamer_id) REFERENCES users (id)
    )
  `);

  // Записи на стримы
  db.exec(`
    CREATE TABLE IF NOT EXISTS stream_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      stream_id INTEGER NOT NULL,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (stream_id) REFERENCES streams (id),
      UNIQUE(user_id, stream_id)
    )
  `);

  // Создаем индексы для ускорения работы
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_streams_date ON streams(date);
    CREATE INDEX IF NOT EXISTS idx_streams_game ON streams(game);
    CREATE INDEX IF NOT EXISTS idx_streams_genre ON streams(genre);
    CREATE INDEX IF NOT EXISTS idx_registrations_stream_user ON stream_registrations(stream_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  // Проверяем количество пользователей
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();

  if (userCount.count === 0) {
    console.log('Создаем тестовых пользователей...');
    const bcrypt = require('bcryptjs');

    const testUsers = [
      ['admin@example.com', 'admin123', 'Admin', 'User', '1990-01-01', 'Moscow', 'CS:GO, Dota 2', 'Shooter, MOBA'],
      ['ivan@example.com', 'password123', 'Иван', 'Петров', '1995-03-15', 'Санкт-Петербург', 'Valorant, Fortnite', 'Shooter, Battle Royale'],
      ['anna@example.com', 'password123', 'Анна', 'Сидорова', '1998-07-22', 'Новосибирск', 'Minecraft, The Sims', 'Sandbox, Simulation'],
      ['alex@example.com', 'password123', 'Алексей', 'Козлов', '1993-11-30', 'Екатеринбург', 'League of Legends', 'MOBA'],
      ['maria@example.com', 'password123', 'Мария', 'Иванова', '2000-05-18', 'Казань', 'Overwatch 2, Apex Legends', 'Shooter'],
      ['dmitry@example.com', 'password123', 'Дмитрий', 'Смирнов', '1991-12-05', 'Ростов-на-Дону', 'World of Warcraft', 'MMORPG'],
      ['olga@example.com', 'password123', 'Ольга', 'Кузнецова', '1997-09-14', 'Владивосток', 'GTA V, Red Dead Redemption', 'Action-Adventure'],
      ['sergey@example.com', 'password123', 'Сергей', 'Попов', '1994-02-28', 'Краснодар', 'Rocket League, FIFA', 'Sports'],
      ['ekaterina@example.com', 'password123', 'Екатерина', 'Васильева', '1999-08-11', 'Нижний Новгород', 'The Witcher 3, Cyberpunk 2077', 'RPG'],
      ['mikhail@example.com', 'password123', 'Михаил', 'Федоров', '1996-04-25', 'Самара', 'Rainbow Six Siege, PUBG', 'Tactical Shooter'],
    ];

    const userStmt = db.prepare(`
      INSERT INTO users (email, password, first_name, last_name, birth_date, city, favorite_games, favorite_genres)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    testUsers.forEach((user, index) => {
      const hashedPassword = bcrypt.hashSync(user[1], 10);
      userStmt.run(
        user[0],
        hashedPassword,
        user[2],
        user[3],
        user[4],
        user[5],
        user[6],
        user[7]
      );
      console.log(`Создан пользователь: ${user[2]} ${user[3]} (${user[0]})`);
    });

    console.log(`✅ Создано ${testUsers.length} тестовых пользователей`);
  } else {
    console.log(`✅ В базе уже есть ${userCount.count} пользователей`);
  }

  // Проверяем количество стримов
  const streamCount = db.prepare('SELECT COUNT(*) as count FROM streams').get();

  if (streamCount.count === 0) {
    console.log('Создаем тестовые стримы...');

    // Получаем первого пользователя как стримера
    const streamerId = db.prepare('SELECT id FROM users LIMIT 1').get().id;

    // Массив разнообразных стримов
    const streams = [
      // CS:GO стримы
      ['CS:GO Турнир', 'Еженедельный турнир по CS:GO с призовым фондом. Присоединяйтесь к соревнованию!', 'CS:GO', 'Shooter', streamerId, '2024-12-25', '19:00', 16, 8],
      ['CS:GO Обучение', 'Обучение тактикам и стратегиям для новичков. Научим играть как про!', 'CS:GO', 'Shooter', streamerId, '2024-12-26', '20:00', 10, 3],
      ['CS:GO Киберспорт', 'Просмотр профессиональных матчей с комментариями экспертов', 'CS:GO', 'Shooter', streamerId, '2024-12-27', '21:00', 50, 25],

      // Dota 2 стримы
      ['Dota 2 Обучение', 'Основы игры для начинающих. Разбор механик и героев.', 'Dota 2', 'MOBA', streamerId, '2024-12-26', '18:00', 12, 6],
      ['Dota 2 Турнир', 'Аматорский турнир 5х5 с ценными призами для победителей', 'Dota 2', 'MOBA', streamerId, '2024-12-28', '19:30', 20, 15],
      ['Dota 2 Герои', 'Подробный разбор механик популярных героев и их комбинаций', 'Dota 2', 'MOBA', streamerId, '2024-12-29', '17:00', 15, 9],

      // Valorant стримы
      ['Valorant Развлечение', 'Веселый стрим с играми, конкурсами и призами для зрителей', 'Valorant', 'Shooter', streamerId, '2024-12-25', '16:00', 8, 4],
      ['Valorant Обучение', 'Улучшаем прицел и реакцию. Тренировки с опытными игроками', 'Valorant', 'Shooter', streamerId, '2024-12-27', '18:30', 10, 7],
      ['Valorant Соревнование', '1v1 дуэли на лучшего игрока. Покажи свои навыки!', 'Valorant', 'Shooter', streamerId, '2024-12-30', '20:00', 12, 2],

      // Fortnite стримы
      ['Fortnite Баттл', 'Королевская битва с подписчиками. Выживет сильнейший!', 'Fortnite', 'Battle Royale', streamerId, '2024-12-26', '15:00', 20, 12],
      ['Fortnite Строительство', 'Учимся строить как профессиональные игроки. Мастер-класс', 'Fortnite', 'Battle Royale', streamerId, '2024-12-28', '16:30', 15, 8],

      // League of Legends стримы
      ['LoL Обучение', 'Полный гайд по чемпионам и тактикам для новичков', 'League of Legends', 'MOBA', streamerId, '2024-12-27', '19:00', 25, 18],
      ['LoL ARAM', 'Веселые игры в режиме ARAM. Расслабленная атмосфера', 'League of Legends', 'MOBA', streamerId, '2024-12-29', '21:00', 30, 22],

      // Minecraft стримы
      ['Minecraft Выживание', 'Выживаем вместе на новом сервере. Стройте, исследуйте, выживайте!', 'Minecraft', 'Sandbox', streamerId, '2024-12-25', '14:00', 40, 30],
      ['Minecraft Строительство', 'Строим огромный фантастический город вместе с сообществом', 'Minecraft', 'Sandbox', streamerId, '2024-12-28', '13:00', 25, 20],

      // Overwatch 2 стримы
      ['Overwatch 2 Ранкед', 'Играем ранкед игры вместе. Поднимаем рейтинг в команде', 'Overwatch 2', 'Shooter', streamerId, '2024-12-26', '22:00', 10, 5],
      ['Overwatch 2 Quick Play', 'Расслабленные игры в Quick Play. Веселье без стресса', 'Overwatch 2', 'Shooter', streamerId, '2024-12-30', '19:00', 15, 10],

      // Apex Legends стримы
      ['Apex Legends Баттл', 'Королевская битва в трио. Тактики и стратегии победы', 'Apex Legends', 'Battle Royale', streamerId, '2024-12-27', '23:00', 12, 6],
      ['Apex Legends Обучение', 'Изучаем всех легенд и их способности. Стань мастером!', 'Apex Legends', 'Battle Royale', streamerId, '2024-12-31', '18:00', 20, 14],

      // Call of Duty стримы
      ['CoD: Warzone', 'Тактики выживания в варзоне. Как дожить до финала', 'Call of Duty', 'Shooter', streamerId, '2024-12-26', '20:00', 18, 11],
      ['CoD Мультиплеер', 'Быстрые и динамичные матчи в мультиплеере', 'Call of Duty', 'Shooter', streamerId, '2024-12-29', '20:00', 15, 9],

      // Rocket League стримы
      ['Rocket League Турнир', 'Соревнование 2х2 с призовым фондом. Покажи свои навыки в воздухе!', 'Rocket League', 'Sports', streamerId, '2024-12-27', '15:00', 8, 4],
      ['Rocket League Фристайл', 'Учимся трюкам и фристайлу. Мастер-класс от профессионала', 'Rocket League', 'Sports', streamerId, '2024-12-30', '16:00', 10, 3],

      // GTA V стримы
      ['GTA V Онлайн', 'Веселье в Los Santos. Миссии, гонки, хаос!', 'GTA V', 'Action-Adventure', streamerId, '2024-12-28', '22:00', 30, 25],
      ['GTA V Ролевая игра', 'Серьезная ролевая игра на RP сервере. Погружение в мир криминала', 'GTA V', 'Action-Adventure', streamerId, '2024-12-31', '21:00', 20, 15],

      // Rainbow Six Siege
      ['Rainbow Six Осада', 'Тактические рейды и защита. Командная работа - залог успеха', 'Rainbow Six Siege', 'Shooter', streamerId, '2024-12-29', '19:00', 10, 7],

      // World of Warcraft
      ['WoW Рейды', 'Проходим сложные рейды в команде. Эпические битвы с боссами', 'World of Warcraft', 'MMORPG', streamerId, '2024-12-30', '18:00', 40, 32],

      // PUBG
      ['PUBG Баттл', 'Классическая королевская битва. Старая добрая игра с друзьями', 'PUBG', 'Battle Royale', streamerId, '2024-12-31', '17:00', 25, 19],
    ];
    // В функции initDatabase(), после создания стримов, добавляем:
    // Обновляем даты стримов на текущий год
    const updateDates = () => {
      console.log('Обновляем даты стримов на текущий год...');

      // Получаем текущую дату
      const now = new Date();
      const currentYear = now.getFullYear();

      // Обновляем все стримы
      const updateStmt = db.prepare(`
        UPDATE streams 
        SET date = REPLACE(date, SUBSTR(date, 1, 4), ?)
        WHERE date LIKE '2024-%'
      `);

      const result = updateStmt.run(currentYear.toString());
      console.log(`✅ Обновлено ${result.changes} стримов на ${currentYear} год`);
    };

    // Вызываем эту функцию после создания стримов
    updateDates();
    // Подготавливаем запрос
    const stmt = db.prepare(`
      INSERT INTO streams (title, description, game, genre, streamer_id, date, time, max_participants, current_participants)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Вставляем все стримы
    streams.forEach(stream => {
      stmt.run(...stream);
      console.log(`Создан стрим: ${stream[0]} (${stream[3]})`);
    });

    console.log(`✅ Создано ${streams.length} тестовых стримов`);
  } else {
    console.log(`✅ В базе уже есть ${streamCount.count} стримов`);
  }

  // Проверяем и создаем тестовые записи на стримы
  const registrationCount = db.prepare('SELECT COUNT(*) as count FROM stream_registrations').get();

  if (registrationCount.count === 0) {
    console.log('Создаем тестовые записи на стримы...');

    // Получаем всех пользователей
    const users = db.prepare('SELECT id FROM users').all();
    // Получаем все стримы
    const allStreams = db.prepare('SELECT id, max_participants FROM streams').all();

    const registrationStmt = db.prepare(`
      INSERT INTO stream_registrations (user_id, stream_id)
      VALUES (?, ?)
    `);

    let totalRegistrations = 0;
    let errors = 0;

    // Для каждого стрима добавляем случайное количество записей
    allStreams.forEach((stream, index) => {
      // Случайное количество записей (от 20% до 80% от максимума)
      const minRegistrations = Math.floor(stream.max_participants * 0.2);
      const maxRegistrations = Math.floor(stream.max_participants * 0.8);
      const registrationsCount = minRegistrations + Math.floor(Math.random() * (maxRegistrations - minRegistrations));

      // Выбираем случайных пользователей
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
      const selectedUsers = shuffledUsers.slice(0, Math.min(registrationsCount, users.length));

      selectedUsers.forEach(user => {
        try {
          registrationStmt.run(user.id, stream.id);
          totalRegistrations++;
        } catch (e) {
          // Игнорируем ошибки дубликатов
          errors++;
        }
      });

      // Прогресс создания
      if ((index + 1) % 5 === 0 || index === allStreams.length - 1) {
        console.log(`Обработано ${index + 1}/${allStreams.length} стримов`);
      }
    });

    // Обновляем счетчики участников
    console.log('Обновляем счетчики участников...');
    const updateStmt = db.prepare(`
      UPDATE streams 
      SET current_participants = (
        SELECT COUNT(*) 
        FROM stream_registrations 
        WHERE stream_id = streams.id
      )
    `);
    updateStmt.run();

    console.log(`✅ Добавлено ${totalRegistrations} тестовых записей на стримы (${errors} ошибок дубликатов)`);
  } else {
    console.log(`✅ В базе уже есть ${registrationCount.count} записей на стримы`);
  }

  // Выводим итоговую статистику
  console.log('\n=== ИТОГОВАЯ СТАТИСТИКА БАЗЫ ДАННЫХ ===');
  const finalUserCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const finalStreamCount = db.prepare('SELECT COUNT(*) as count FROM streams').get();
  const finalRegCount = db.prepare('SELECT COUNT(*) as count FROM stream_registrations').get();

  console.log(`👥 Пользователей: ${finalUserCount.count}`);
  console.log(`🎮 Стримов: ${finalStreamCount.count}`);
  console.log(`📝 Записей на стримы: ${finalRegCount.count}`);
  console.log('=====================================\n');

  console.log('✅ База данных успешно инициализирована');
  console.log('🔑 Тестовые учетные данные для входа:');
  console.log('   Email: admin@example.com');
  console.log('   Пароль: admin123');
  console.log('\n🚀 Сайт готов к работе!');
}

// Экспортируем базу данных и функцию инициализации
export { db, initDatabase };

// Если файл запускается напрямую, инициализируем базу данных
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase();
}