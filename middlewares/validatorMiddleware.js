const { validationResult } = require("express-validator");
const ApiError = require("../utils/apiError");

const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      if (!formattedErrors[error.path || error.param]) formattedErrors[error.path || error.param] = [];
      formattedErrors[error.path || error.param].push(error.msg);
    });
    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: formattedErrors, ...(process.env.NODE_ENV === "development" && { rawErrors: errors.array()}),
    });
  }
  next();
};

const validatorMiddlewareWithThrow = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({ field: error.path || error.param, message: error.msg, value: error.value, }));
    const errorMessage = formattedErrors.map((err) => `${err.field}: ${err.message}`).join(", ");
    return next(new ApiError(`Validation failed: ${errorMessage}`, 400));
  }
  next();
};

const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    Object.keys(obj).forEach((key) => {
      if (obj[key] === "" || obj[key] === "undefined") obj[key] = null;
      else if (typeof obj[key] === "object" && obj[key] !== null) sanitizeObject(obj[key]);
    });
  };
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

module.exports = { validatorMiddleware, validatorMiddlewareWithThrow, sanitizeInput };
