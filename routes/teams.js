const express = require('express');
const pool = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [teams] = await pool.query('SELECT * FROM teams');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, adminMiddleware, upload.single('team_image'), async (req, res) => {
  const { team_name, coach_name, city } = req.body;
  const team_image = req.file ? (req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`) : null;

  try {
    const [result] = await pool.query(
      'INSERT INTO teams (team_name, coach_name, city, team_image) VALUES (?, ?, ?, ?)',
      [team_name, coach_name, city, team_image]
    );
    res.status(201).json({ message: 'Team created', id: result.insertId, team_image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, upload.single('team_image'), async (req, res) => {
  const { id } = req.params;
  const { team_name, coach_name, city } = req.body;
  let updateQuery = 'UPDATE teams SET team_name = ?, coach_name = ?, city = ?';
  let params = [team_name, coach_name, city];

  if (req.file) {
    const team_image = req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
    updateQuery += ', team_image = ?';
    params.push(team_image);
  }

  updateQuery += ' WHERE team_id = ?';
  params.push(id);

  try {
    await pool.query(updateQuery, params);
    res.json({ message: 'Team updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM teams WHERE team_id = ?', [req.params.id]);
    res.json({ message: 'Team deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
