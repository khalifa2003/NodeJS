const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");
const ApiError = require("../utils/apiError");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const fs = require("fs");
const path = require("path");

// exports.uploadCategoryImage = uploadSingleImage("image");

// exports.resizeImage = asyncHandler(async (req, res, next) => {
//   if (!req.file) {
//     return next(new ApiError("No file uploaded", 400));
//   }

//   const filename = `category-${Date.now()}-${req.file.originalname}`;
//   req.body.image = filename;

//   const filePath = path.join(
//     __dirname,
//     "..",
//     "uploads",
//     "categories",
//     filename
//   );

//   fs.rename(req.file.path, filePath, (err) => {
//     if (err) return next(new ApiError("Error saving file", 500));
//     next();
//   });
// });

// @desc    Get Categories
// @route   GET /api/v1/categories
// @access  Private/Admin
exports.getCategories = asyncHandler(async (req, res) => {
  const documents = await Category.find({});
  res.status(200).json({ results: documents.length, data: documents });
});

// @desc    Get Specific Category
// @route   GET /api/v1/categories/:id
// @access  Private/Admin
exports.getCategory = asyncHandler(async (req, res, next) => {
  const document = await Category.findById(req.params.id);
  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc    Create Category
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res) => {
  const newDoc = await Category.create(req.body);
  res.status(201).json({ data: newDoc });
});

// @desc    Update Category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const document = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc    delete Category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const document = await Category.findByIdAndDelete(id);
  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(204).send();
});
