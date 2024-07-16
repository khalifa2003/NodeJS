const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Too short product title"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [20, "Too short product description"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      trim: true,
      max: [2000000, "Too long product price"],
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Product must be belong to category"],
    },
    subcategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "SubCategory",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
      // set: (val) => Math.round(val * 10) / 10, // 3.3333 * 10 => 33.333 => 33 => 3.3
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const setImageURL = (doc) => {
  if (doc.images && doc.images.length > 0) {
    // Updated to handle "images"
    doc.images = doc.images.map((image) => {
      if (image.slice(0, 4) != "http") {
        return `${process.env.BASE_URL}/uploads/products/${image}`;
      }
      return image;
    });
  }
};

// Middleware to set image URLs after initializing or saving
productSchema.post("init", setImageURL); // Runs after findOne and find
productSchema.post("save", setImageURL); // Runs after save

module.exports = mongoose.model("Product", productSchema);
