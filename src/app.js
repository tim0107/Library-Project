require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/database.js');
const router = require('./route');
const { initSocket, userSocketMap } = require('./socket');

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// middleware
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    allowedHeaders: ['Content-Type', 'token'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/share', express.static(path.join(__dirname, 'share')));

// db
connectDB();

// root route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// other routes
router(app);

// create http server for socket.io
const httpServer = http.createServer(app);

// socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

initSocket(io);

io.on('connection', (socket) => {
  const userIdRaw = socket.handshake.query.userId;
  const userId = userIdRaw ? userIdRaw.toString() : null;

  console.log('user connected:', userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log('user disconnected:', userId);

    if (userId) {
      delete userSocketMap[userId];
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`server running at port ${PORT}`);
  console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);
});
