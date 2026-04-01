CREATE DATABASE IF NOT EXISTS volleytrack;
USE volleytrack;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS teams (
  team_id INT AUTO_INCREMENT PRIMARY KEY,
  team_name VARCHAR(255) NOT NULL,
  coach_name VARCHAR(255),
  city VARCHAR(255),
  team_image VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS players (
  player_id INT AUTO_INCREMENT PRIMARY KEY,
  player_name VARCHAR(255) NOT NULL,
  team_id INT,
  position VARCHAR(100),
  jersey_number INT,
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matches (
  match_id INT AUTO_INCREMENT PRIMARY KEY,
  team1_id INT,
  team2_id INT,
  match_date DATETIME,
  venue VARCHAR(255),
  total_sets INT DEFAULT 3,
  points_per_set INT DEFAULT 25,
  status ENUM('upcoming', 'live', 'completed') DEFAULT 'upcoming',
  FOREIGN KEY (team1_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  FOREIGN KEY (team2_id) REFERENCES teams(team_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sets (
  set_id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT,
  set_number INT,
  team1_score INT DEFAULT 0,
  team2_score INT DEFAULT 0,
  winner_team_id INT,
  FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE CASCADE,
  FOREIGN KEY (winner_team_id) REFERENCES teams(team_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
