require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const sequelize = require("./config/db");

require("./models/user");
require("./models/project");
require("./models/weeklyReport");
require("./models/userProject");

const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.disable("x-powered-by");

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Weekly Report Generator API is running",
  });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("Database tables synchronized in development mode");
    } else {
      console.log("Database sync skipped outside development mode");
    }

    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      try {
        await sequelize.close();
        console.log("Database connection closed");
        process.exit(0);
      } catch (error) {
        console.error("Shutdown error:", error.message);
        process.exit(1);
      }
    });
  } else {
    await sequelize.close();
    process.exit(0);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error.message);
  gracefulShutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error.message);
  process.exit(1);
});

startServer();