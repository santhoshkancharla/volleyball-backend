const pool = require('./config/db');

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY DEFAULT 1,
        league_name VARCHAR(255) DEFAULT 'Premier Volley League',
        location VARCHAR(255) DEFAULT 'National Sports Arena, Metro City',
        season VARCHAR(50) DEFAULT 'Season 2026',
        organizer VARCHAR(255) DEFAULT 'National Sports Association'
      );
    `);
    
    await pool.query(`
      INSERT IGNORE INTO settings (id, league_name, location, season, organizer) 
      VALUES (1, 'Premier Volley League', 'National Sports Arena, Metro City', 'Season 2026', 'National Sports Association')
    `);
    
    console.log("Settings migration successful.");
  } catch (err) {
    console.error("Settings migration failed:", err);
  } finally {
    process.exit(0);
  }
}

migrate();
