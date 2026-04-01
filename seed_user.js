const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function run() {
  try {
    const hash = await bcrypt.hash('Santhosh@789', 10);
    // Insert ignoring duplicates if santhosh already exists
    await pool.query("INSERT IGNORE INTO users (username, password, role) VALUES ('santhosh', ?, 'admin')", [hash]);
    console.log("Admin user 'santhosh' created successfully.");
  } catch (err) {
    console.error("Error creating user:", err);
  } finally {
    process.exit(0);
  }
}
run();
