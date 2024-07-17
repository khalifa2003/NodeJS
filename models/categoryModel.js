const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category required"],
      unique: [true, "Category must be unique"],
      minlength: [3, "Too short category name"],
      maxlength: [32, "Too long category name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: String,
    image: String,
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  if (doc.image) {
    if (doc.image.slice(0,4) != 'http') {
      const imageUrl = `https://node-js-beige.vercel.app/uploads/categories/${doc.image}`;
      doc.image = imageUrl;
    }
  }
};
// findOne, findAll and update
categorySchema.post("init", (doc) => {
  setImageURL(doc);
});

// create
categorySchema.post("save", (doc) => {
  setImageURL(doc);
});

const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
