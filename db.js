import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Password1310',
  database: 'users_db'
});

db.connect(err => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
    process.exit(1);
  }
  console.log('Подключение к базе данных MySQL успешно');
});

export default db;
