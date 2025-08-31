const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const factory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const Brand = require('../models/brandModel');

exports.uploadBrandImage = uploadSingleImage('image');

exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer).resize(600, 600).toFormat('jpeg').jpeg({ quality: 95 }).toFile(`uploads/brands/${filename}`);
  req.body.image = filename;
  next();
});

// Get list of brands
// GET /api/v1/brands
exports.getBrands = factory.getAll(Brand);

// Get specific brand by id
// GET /api/v1/brands/:id
exports.getBrand = factory.getOne(Brand);

// Create brand
// POST  /api/v1/brands
// Private
exports.createBrand = factory.createOne(Brand);

// Update specific brand
// PUT /api/v1/brands/:id
// Private
exports.updateBrand = factory.updateOne(Brand);

// Delete specific brand
// DELETE /api/v1/brands/:id
// Private
exports.deleteBrand = factory.deleteOne(Brand);