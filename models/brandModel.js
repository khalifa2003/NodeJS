const mongoose = require("mongoose");
// 1- Create Schema
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand required"],
      unique: [true, "Brand must be unique"],
      minlength: [3, "Too short Brand name"],
      maxlength: [32, "Too long Brand name"],
    },
    description: String,
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  if (doc.image) {
    if (doc.image.slice(0, 4) != "http") {
      // const imageUrl = `${process.env.BASE_URL}/uploads/brands/${doc.image}`;
      const imageUrl = `https://node-js-beige.vercel.app/uploads/brands/${doc.image}`;
      doc.image = imageUrl;
    }
  }
};
// findOne, findAll and update
brandSchema.post("init", (doc) => {
  setImageURL(doc);
});

// create
brandSchema.post("save", (doc) => {
  setImageURL(doc);
});

module.exports = mongoose.model("Brand", brandSchema);
