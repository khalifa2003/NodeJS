const Review = require("../models/reviewModel");
const asyncHandler = require("express-async-handler");

// Nested route (Create)
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
// @desc    Get list of reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res) => {
  const product = req.query.productId;
  const documents = await Review.find({ product });
  res.status(200).json({ results: documents.length, data: documents });
});

// @desc    Get specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const document = await Review.find({ product: req.params.productId });
  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc    Create review
// @route   POST  /api/v1/reviews
// @access  Private/Protect/User
exports.createReview = asyncHandler(async (req, res) => {
  const newDoc = await Review.create(req.body);
  res.status(201).json({ data: newDoc });
});

// // @desc    Update specific review
// // @route   PUT /api/v1/reviews/:id
// // @access  Private/Protect/User
exports.updateReview = asyncHandler(async (req, res, next) => {
  const document = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc    Delete specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Protect/User-Admin-Manager
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const document = await Review.findByIdAndDelete(id);
  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(204).send();
});
