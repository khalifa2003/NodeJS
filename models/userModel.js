const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      trim: true,
      required: [true, "name required"],
    },
    lname: {
      type: String,
      trim: true,
      required: [true, "name required"],
    },
    slug: { type: String, lowercase: true },
    email: {
      type: String,
      required: [true, "Email Required"],
      unique: true,
      lowercase: true,
    },
    phone: String,
    profileImage: String,
    password: {
      type: String,
      required: [true, "Password Required"],
      minlength: [6, "Too Short Password"],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: { type: String, enum: ["user", "manager", "admin"], default: "user" },

    active: { type: Boolean, default: true },
    wishlist: [{ type: mongoose.Schema.ObjectId, ref: "Product" }],
    addresses: [
      {
        id: { type: mongoose.Schema.ObjectId },
        fname: String,
        lname: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        country: String,
        state: String,
        postalCode: String,
      },
    ],
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  // Hasing User Password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const setImageURL = (doc) => {
  if (doc.profileImage) {
    if (doc.profileImage.slice(0, 4) != "http") {
      const imageUrl = `${process.env.BASE_URL}/uploads/users/${doc.profileImage}`;
      doc.profileImage = imageUrl;
    }
  }
};
// findOne, findAll and update
userSchema.post("init", (doc) => {
  setImageURL(doc);
});

// create
userSchema.post("save", (doc) => {
  setImageURL(doc);
});
const User = mongoose.model("User", userSchema);

module.exports = User;
