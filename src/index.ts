import express from 'express';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import blogsRoutes from './presentation/routes/blogs.routes.js';
import postsRoutes from './presentation/routes/posts.routes.js';
import usersRoutes from './presentation/routes/users.routes.js';
import authRoutes from './presentation/routes/auth.routes.js';
import commentsRoutes from './presentation/routes/comments.routes.js';
import testingRoutes from './presentation/routes/testing.routes.js';
import { connectToDatabase, closeDatabaseConnection } from './infrastructure/database/mongodb.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);
app.use(express.json());
app.use(cookieParser());
app.use('/blogs', blogsRoutes);
app.use('/posts', postsRoutes);
app.use('/users', usersRoutes);
app.use('/auth', authRoutes);
app.use('/comments', commentsRoutes);
app.use('/testing', testingRoutes);

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});

startServer();
