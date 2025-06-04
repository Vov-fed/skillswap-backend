import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import cors from './cors';
import userRouter from './routes/users/index';
import skillsRouter from './routes/skills/index';
import chatRouter from './routes/chats/index';
import messageRouter from './routes/messages/index';
import { initSocket } from './socket';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
initSocket(server);

app.get('/', (_req, res) => {
  res.send('Hello from Express with TypeScript!');
});

app.use(cors);
app.use(express.json());

app.use('/users', userRouter);
app.use('/skills', skillsRouter);
app.use('/chats', chatRouter);
app.use('/messages', messageRouter);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB', MONGO_URI);
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error:', err);
  });