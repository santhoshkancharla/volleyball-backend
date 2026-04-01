const express = require('express');
const pool = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [announcements] = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { title, description } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO announcements (title, description) VALUES (?, ?)',
      [title, description]
    );
    res.status(201).json({ message: 'Announcement created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
