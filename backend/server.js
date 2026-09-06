import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Chat from './models/chat.model.js';
import User from './models/user.model.js';
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

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id isBlocked');

    if (!user || user.isBlocked) {
      return next(new Error('Account is unavailable'));
    }

    socket.userId = user._id.toString();
    return next();
  } catch {
    return next(new Error('Invalid or expired token'));
  }
});

io.on('connection', (socket) => {
  socket.on('joinChat', async (chatId) => {
    try {
      const chat = await Chat.findOne({
        _id: chatId,
        $or: [{ buyer: socket.userId }, { seller: socket.userId }],
      });

      if (chat) {
        socket.join(chatId);
      }
    } catch {
      // Ignore malformed or unauthorized chat IDs.
    }
  });

  socket.on('sendMessage', async (data) => {
    try {
      if (
        !data ||
        typeof data.chatId !== 'string' ||
        typeof data.text !== 'string' ||
        !data.text.trim() ||
        String(data.sender) !== String(socket.userId)
      ) {
        return;
      }

      const chat = await Chat.findOne({
        _id: data.chatId,
        $or: [{ buyer: socket.userId }, { seller: socket.userId }],
      });

      if (!chat) {
        return;
      }

      socket.to(data.chatId).emit('receiveMessage', {
        ...data,
        sender: socket.userId,
        text: data.text.trim(),
      });
    } catch {
      // Ignore malformed or unauthorized socket messages.
    }
  });

  socket.on('disconnect', () => {});
});

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});