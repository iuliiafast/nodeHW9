import bcrypt from 'bcrypt';
import db from './db.js';

export const checkPasswordChange = (req, res, next) => {
  const { userId } = req.body;

  db.query('SELECT mustChangePassword FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    if (results.length > 0 && results[0].mustChangePassword) {
      return res.redirect('/change-password');
    }
    next();
  });
};

export const checkAdmin = (req, res, next) => {
  const { userId } = req.body;

  db.query('SELECT role FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    if (results.length === 0 || results[0].role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    next();
  });
};
