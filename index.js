const path = require("path");

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");

dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");
// Routes
const mountRoutes = require("./routes");

// Connect with db
dbConnection();
// express app
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// Enable other domains to access your application
app.use(cors());
const serverless = require('./api/serverless');
app.use('/api/serverless', serverless);

// Middlewares
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
mountRoutes(app);
app.get("/", (req, res) => {
  res.json({ msg: "Hello World!" });
});

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running running on port ${PORT}`);
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
