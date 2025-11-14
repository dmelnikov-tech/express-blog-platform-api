import express from "express";
import "dotenv/config";
import blogsRoutes from "./routes/blogs.routes.js";
import { connectToDatabase, closeDatabaseConnection } from "./db/mongodb.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/blogs", blogsRoutes);

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await closeDatabaseConnection();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await closeDatabaseConnection();
  process.exit(0);
});

startServer();

//TODO: тесты сделать
//TODO: сваггер запилить
