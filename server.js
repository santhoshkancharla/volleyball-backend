require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const playerRoutes = require('./routes/players');
const matchRoutes = require('./routes/matches');
const announcementRoutes = require('./routes/announcements');
const settingsRoutes = require('./routes/settings');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // For locally mocked image uploads

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

app.set('io', io); // Make io accessible in controllers

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('joinMatch', (matchId) => {
    socket.join(`match_${matchId}`);
    console.log(`Socket ${socket.id} joined match_${matchId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Basic Route for testing
app.get('/', (req, res) => res.send('VolleyTrack API Running'));

// Mount specific Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/settings', settingsRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
