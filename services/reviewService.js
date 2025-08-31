const factory = require('./handlersFactory');
const Review = require('../models/reviewModel');

// Nested route
// GET /api/v1/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;
  next();
};

// Get list of reviews
// GET /api/v1/reviews
exports.getReviews = factory.getAll(Review);

// Get specific review by id
// GET /api/v1/reviews/:id
exports.getReview = factory.getOne(Review);

// Nested route (Create)
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
// Create review
// POST  /api/v1/reviews
// Private/Protect/User
exports.createReview = factory.createOne(Review);

// Update specific review
// PUT /api/v1/reviews/:id
// Private/Protect/User
exports.updateReview = factory.updateOne(Review);

// Delete specific review
// DELETE /api/v1/reviews/:id
// Private/Protect/User-Admin-Manager
exports.deleteReview = factory.deleteOne(Review);