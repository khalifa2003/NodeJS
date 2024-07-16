const fs = require("fs");
const path = require("path");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const asyncHandler = require("express-async-handler");
const Brand = require("../models/brandModel");
const ApiError = require("../utils/apiError");

exports.uploadBrandImage = uploadSingleImage("image");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError("No file uploaded", 400));
  }

  const filename = `brand-${Date.now()}-${req.file.originalname}`;
  req.body.image = filename;

  const filePath = path.join(__dirname, "..", "uploads", "brands", filename);

  fs.rename(req.file.path, filePath, (err) => {
    if (err) return next(new ApiError("Error saving file", 500));
    next();
  });
});

// @desc    Get All Brands
// @route   GET /api/v1/brands
// @access  Private/Admin
exports.getBrands = asyncHandler(async (req, res) => {
  const documents = await Brand.find({});
  res.status(200).json({ results: documents.length, data: documents });
});

// @desc    Get Specific Brand
// @route   GET /api/v1/brands/:id
// @access  Private/Admin
exports.getBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const document = await Brand.findById(id);
  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc    Create Brand
// @route   POST /api/v1/brands
// @access  Private/Admin
exports.createBrand = asyncHandler(async (req, res) => {
  const newDoc = await Brand.create(req.body);
  res.status(201).json({ data: newDoc });
});

// @desc    Update Brand
// @route   PUT /api/v1/brands/:id
// @access  Private/Admin
exports.updateBrand = asyncHandler(async (req, res, next) => {
  const document = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc    Delete Brand
// @route   DELETE /api/v1/brands/:id
// @access  Private/Admin
exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const document = await Brand.findByIdAndDelete(id);
  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(204).send();
});
