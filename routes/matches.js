const express = require('express');
const pool = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [matches] = await pool.query(`
      SELECT m.*, 
             t1.team_name as team1_name, t1.team_image as team1_image,
             t2.team_name as team2_name, t2.team_image as team2_image
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      ORDER BY m.match_date DESC
    `);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { team1_id, team2_id, match_date, venue, total_sets, points_per_set } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO matches (team1_id, team2_id, match_date, venue, total_sets, points_per_set) VALUES (?, ?, ?, ?, ?, ?)',
      [team1_id, team2_id, match_date, venue, total_sets || 3, points_per_set || 25]
    );
    res.status(201).json({ message: 'Match created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE matches SET status = ? WHERE match_id = ?', [status, id]);
    
    // Notify clients via Socket.io
    const io = req.app.get('io');
    io.emit('scoreUpdated', { matchId: id, event: 'statusChange', data: { status } });
    
    res.json({ message: 'Match status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/sets', async (req, res) => {
  try {
    const [sets] = await pool.query('SELECT * FROM sets WHERE match_id = ? ORDER BY set_number ASC', [req.params.id]);
    res.json(sets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/sets', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { set_number, team1_score, team2_score, winner_team_id } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM sets WHERE match_id = ? AND set_number = ?', [id, set_number]);
    if (existing.length > 0) {
      await pool.query(
        'UPDATE sets SET team1_score = ?, team2_score = ?, winner_team_id = ? WHERE match_id = ? AND set_number = ?',
        [team1_score, team2_score, winner_team_id || null, id, set_number]
      );
    } else {
      await pool.query(
        'INSERT INTO sets (match_id, set_number, team1_score, team2_score, winner_team_id) VALUES (?, ?, ?, ?, ?)',
        [id, set_number, team1_score, team2_score, winner_team_id || null]
      );
    }

    const io = req.app.get('io');
    io.emit('scoreUpdated', { 
      matchId: id, 
      event: 'scoreUpdate', 
      data: { set_number, team1_score, team2_score, winner_team_id } 
    });

    res.json({ message: 'Set updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
