const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: [true, 'Order must be belong to user']},
    cartItems: [{product: {type: mongoose.Schema.ObjectId, ref: 'Product'}, quantity: Number, color: String, price: Number}],
    taxPrice: {type: Number, default: 0},
    shippingAddress: {details: String, phone: String, city: String, postalCode: String},
    shippingPrice: {type: Number, default: 0},
    totalOrderPrice: {type: Number},
    paymentMethodType: {type: String, enum: ['card', 'cash'], default: 'cash'},
    isPaid: {type: Boolean, default: false},
    paidAt: Date,
    isDelivered: {type: Boolean, default: false},
    deliveredAt: Date,
  },
  { timestamps: true }
);

// Auto populate user & product details when querying orders
orderSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name profileImg email phone'})
  .populate({ path: 'cartItems.product', select: 'title imageCover '});
  next();
});
// Virtual to check order status
orderSchema.virtual('status').get(function () {
  if (this.isDelivered) return 'Delivered';
  if (this.isPaid) return 'Paid';
  return 'Pending';
});

module.exports = mongoose.model('Order', orderSchema);