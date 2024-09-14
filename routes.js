import express from 'express';
import bcrypt from 'bcrypt';
import db from './db.js';
import { checkPasswordChange, checkAdmin } from './middleware.js';

const router = express.Router();

// Регистрация пользователя
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверка уникальности email
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      if (results.length > 0) {
        return res.status(400).json({ error: 'Email уже зарегистрирован' });
      }

      // Хэширование пароля
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Регистрация нового пользователя
      db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка базы данных' });
        }
        res.status(201).json({ message: 'Пользователь зарегистрирован!' });
      });
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка регистрации пользователя' });
  }
});

// Смена пароля
router.post('/change-password', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    // Хэширование нового пароля
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Обновление пароля
    db.query('UPDATE users SET password = ?, mustChangePassword = FALSE WHERE id = ?', [hashedPassword, userId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      res.json({ message: 'Пароль изменен' });
    });
  } catch (error) {
    console.error('Ошибка смены пароля:', error);
    res.status(500).json({ error: 'Ошибка смены пароля' });
  }
});

// Удаление аккаунта
router.post('/delete-account', async (req, res) => {
  try {
    const { userId, currentPassword } = req.body;

    // Проверка текущего пароля
    db.query('SELECT password FROM users WHERE id = ?', [userId], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      if (results.length === 0 || !(await bcrypt.compare(currentPassword, results[0].password))) {
        return res.status(400).json({ error: 'Неверный пароль' });
      }

      // Удаление аккаунта
      db.query('DELETE FROM users WHERE id = ?', [userId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка базы данных' });
        }
        res.json({ message: 'Аккаунт удален' });
      });
    });
  } catch (error) {
    console.error('Ошибка удаления аккаунта:', error);
    res.status(500).json({ error: 'Ошибка удаления аккаунта' });
  }
});

// Маршрут для администраторов
router.get('/admin', checkAdmin, (req, res) => {
  res.send('Административная панель');
});

// Смена email
router.post('/change-email', async (req, res) => {
  try {
    const { userId, newEmail, currentPassword } = req.body;

    // Проверка текущего пароля
    db.query('SELECT password FROM users WHERE id = ?', [userId], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      if (results.length === 0 || !(await bcrypt.compare(currentPassword, results[0].password))) {
        return res.status(400).json({ error: 'Неверный пароль' });
      }

      // Проверка уникальности нового email
      db.query('SELECT * FROM users WHERE email = ?', [newEmail], (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка базы данных' });
        }
        if (results.length > 0) {
          return res.status(400).json({ error: 'Email уже зарегистрирован' });
        }

        // Обновление email
        db.query('UPDATE users SET email = ? WHERE id = ?', [newEmail, userId], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Ошибка базы данных' });
          }
          res.json({ message: 'Email обновлен' });
        });
      });
    });
  } catch (error) {
    console.error('Ошибка изменения email:', error);
    res.status(500).json({ error: 'Ошибка изменения email' });
  }
});

export default router;
