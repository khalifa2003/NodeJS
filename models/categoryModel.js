const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Category required'], unique: [true, 'Category must be unique'], minlength: [3, 'Too short category name'], maxlength: [32, 'Too long category name']},
    slug: { type: String, lowercase: true},
    image: String,
  },
  { timestamps: true }
);

// helper to set full image URL
const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};
// middleware
categorySchema.post('init', (doc) => setImageURL(doc));
categorySchema.post('save', (doc) => setImageURL(doc));

const CategoryModel = mongoose.model('Category', categorySchema);
module.exports = CategoryModel;