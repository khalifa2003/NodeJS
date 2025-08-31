const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');

const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const createToken = require('../utils/createToken');
const User = require('../models/userModel');
exports.uploadUserImage = uploadSingleImage('profileImg');

exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);
    req.body.profileImg = filename;
  }
  next();
});

// Get list of users
// GET /api/v1/users
// Private/Admin
exports.getUsers = factory.getAll(User);

// Get specific user by id
// GET /api/v1/users/:id
// Private/Admin
exports.getUser = factory.getOne(User);

// Create user
// POST  /api/v1/users
// Private/Admin
exports.createUser = factory.createOne(User);

// Update specific user
// PUT /api/v1/users/:id
// Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImg: req.body.profileImg,
      role: req.body.role,
    },
    { new: true }
  );
  if (!document) return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );
  if (!document) return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  res.status(200).json({ data: document });
});

// Delete specific user
// DELETE /api/v1/users/:id
// Private/Admin
exports.deleteUser = factory.deleteOne(User);

// Get Logged user data
// GET /api/v1/users/getMe
// Private/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// Update logged user password
// PUT /api/v1/users/updateMyPassword
// Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Update user password based user payload (req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );

  const token = createToken(user._id);
  res.status(200).json({ data: user, token });
});

// Update logged user data (without password, role)
// PUT /api/v1/users/updateMe
// Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );
  res.status(200).json({ data: updatedUser });
});

// Deactivate logged user
// DELETE /api/v1/users/deleteMe
// Private/Protect
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: 'Success' });
});