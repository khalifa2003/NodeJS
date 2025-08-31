const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {type: mongoose.Schema.ObjectId, ref: 'Product'},
        quantity: {type: Number, default: 1},
        color: String,
        price: Number,
      },
    ],
    // Total cart price before discount
    totalCartPrice: Number,
    // Total cart price after discount
    totalPriceAfterDiscount: Number,
    // Cart owner (user)
    user: {type: mongoose.Schema.ObjectId, ref: 'User'},
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);