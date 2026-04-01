const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role === 'admin' ? 'admin' : 'user';

    const [result] = await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, userRole]
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { id: user.user_id, role: user.role, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: payload });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
