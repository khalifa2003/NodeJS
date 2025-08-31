const ApiError = require("../utils/apiError");

// Send detailed error response in development
const sendErrorForDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

// Send simplified error response in production
const sendErrorForProd = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

// Handle invalid JWT token
const handleJwtInvalidSignature = () => new ApiError("Invalid token, please login again..", 401);

// Handle expired JWT token
const handleJwtExpired = () => new ApiError("Expired token, please login again..", 401);

// Global error handling middleware
const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();
    if (err.name === "TokenExpiredError") err = handleJwtExpired();
    sendErrorForProd(err, res);
  }
};

module.exports = globalError;
