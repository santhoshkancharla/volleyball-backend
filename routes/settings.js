const express = require('express');
const pool = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Get the global league settings
router.get('/', async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT * FROM settings WHERE id = 1');
    if (settings.length === 0) {
      return res.json({ league_name: '', location: '', season: '', organizer: '' });
    }
    res.json(settings[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update the global league settings
router.put('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { league_name, location, season, organizer } = req.body;
  try {
    await pool.query(
      'UPDATE settings SET league_name = ?, location = ?, season = ?, organizer = ? WHERE id = 1',
      [league_name, location, season, organizer]
    );
    res.json({ message: 'League settings updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
