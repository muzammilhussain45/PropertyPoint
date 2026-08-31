import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';

import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import propertyRouter from './routes/property.routes.js';
import inquiryRouter from './routes/inquiry.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';
import contactRouter from './routes/contact.routes.js';
import adminRouter from './routes/admin.routes.js';
import chatRouter from './routes/chat.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// CORS Setup
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Database Connection
connectDB();

// API Routes
app.get('/', (req, res) => {
  res.send('API Working');
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/property', propertyRouter);
app.use('/api/inquiry', inquiryRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/contact', contactRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chat', chatRouter);

const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.chatId).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {});
});

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});