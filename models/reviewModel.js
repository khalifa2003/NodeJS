const mongoose = require('mongoose');
const Product = require('./productModel');

const reviewSchema = new mongoose.Schema(
  {
    title: {type: String},
    ratings: { type: Number, min: [1, 'Min ratings value is 1.0'], max: [5, 'Max ratings value is 5.0'], required: [true, 'review ratings required']},
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: [true, 'Review must belong to user']},
    product: { type: mongoose.Schema.ObjectId, ref: 'Product', required: [true, 'Review must belong to product']},
  },
  { timestamps: true }
);
// Auto populate user
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' });
  next();
});
// Calc avg ratings & qty
reviewSchema.statics.calcAverageRatingsAndQuantity = async function (productId) {
  const result = await this.aggregate([
    {$match: { product: productId }},
    {$group: { _id: 'product', avgRatings: { $avg: '$ratings' }, ratingsQuantity: { $sum: 1 }}},
  ]);
  if (result.length > 0) await Product.findByIdAndUpdate(productId, { ratingsAverage: result[0].avgRatings, ratingsQuantity: result[0].ratingsQuantity});
  else await Product.findByIdAndUpdate(productId, { ratingsAverage: 0, ratingsQuantity: 0});
};
// Recalc after save
reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});
// Recalc after remove
reviewSchema.post('remove', async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);