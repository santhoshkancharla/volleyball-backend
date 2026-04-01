const express = require('express');
const pool = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [players] = await pool.query(`
      SELECT p.*, t.team_name, t.team_image 
      FROM players p 
      LEFT JOIN teams t ON p.team_id = t.team_id
    `);
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { player_name, team_id, position, jersey_number } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO players (player_name, team_id, position, jersey_number) VALUES (?, ?, ?, ?)',
      [player_name, team_id, position, jersey_number]
    );
    res.status(201).json({ message: 'Player added', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { player_name, team_id, position, jersey_number } = req.body;
  try {
    await pool.query(
      'UPDATE players SET player_name=?, team_id=?, position=?, jersey_number=? WHERE player_id=?',
      [player_name, team_id, position, jersey_number, id]
    );
    res.json({ message: 'Player updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM players WHERE player_id = ?', [req.params.id]);
    res.json({ message: 'Player deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
