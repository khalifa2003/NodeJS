const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const sendEmail = require('../utils/sendEmail');
const createToken = require('../utils/createToken');
const User = require('../models/userModel');

// Signup
// GET /api/v1/auth/signup
exports.signup = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  const token = createToken(user._id);
  res.status(201).json({ data: user, token });
});

// Login
// GET /api/v1/auth/login
exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) return next(new ApiError('Incorrect email or password', 401));
  const token = createToken(user._id);
  delete user._doc.password;
  res.status(200).json({ data: user, token });
});

// make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer') ) token = req.headers.authorization.split(' ')[1];
  if (!token) return next(new ApiError('You are not login, Please login to get access this route',401));
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) return next( new ApiError('The user that belong to this token does no longer exist', 401));
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000,10);
    if (passChangedTimestamp > decoded.iat) return next( new ApiError('User recently changed his password. please login again..', 401));
  }
  req.user = currentUser;
  next();
});

// Authorization (User Permissions)
// ["admin", "manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(new ApiError('You are not allowed to access this route', 403));
    next();
  });

// Forgot password
// POST /api/v1/auth/forgotPassword
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ApiError(`There is no user with that email ${req.body.email}`, 404));
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');
  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  const message = `Hi ${user.name},\n We received a request to reset the password on your E-shop Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The E-shop Team`;
  try {
    await sendEmail({ email: user.email, subject: 'Your password reset code (valid for 10 min)', message });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(new ApiError('There is an error in sending email', 500));
  }
  res.status(200).json({ status: 'Success', message: 'Reset code sent to email' });
});

// Verify password reset code
// POST /api/v1/auth/verifyResetCode
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto.createHash('sha256').update(req.body.resetCode).digest('hex');
  const user = await User.findOne({ passwordResetCode: hashedResetCode, passwordResetExpires: { $gt: Date.now() } });
  if (!user) return next(new ApiError('Reset code invalid or expired'));
  user.passwordResetVerified = true;
  await user.save();
  res.status(200).json({status: 'Success'});
});

// Reset password
// POST /api/v1/auth/resetPassword
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ApiError(`There is no user with email ${req.body.email}`, 404));
  if (!user.passwordResetVerified) return next(new ApiError('Reset code not verified', 400));
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();
  const token = createToken(user._id);
  res.status(200).json({ token });
});