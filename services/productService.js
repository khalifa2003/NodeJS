const asyncHandler = require("express-async-handler");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");

const Product = require("../models/productModel");
const ApiError = require("../utils/apiError");

// exports.uploadProductImages = uploadMixOfImages([
//   { name: "images", maxCount: 6 },
// ]);

// exports.resizeProductImages = asyncHandler(async (req, res, next) => {
//   if (!req.files || !req.files.images) {
//     return next(new ApiError("No files uploaded", 400));
//   }
//   req.body.images = [];
//   // Iterate through uploaded files and process each one
//   req.files.images.forEach((file) => {
//     const filename = `product-${Date.now()}-${file.originalname}`;
//     req.body.images.push(filename);

//     // Move the file to the desired directory
//     const fs = require("fs");
//     const path = require("path");
//     const filePath = path.join(
//       __dirname,
//       "..",
//       "uploads",
//       "products",
//       filename
//     );

//     fs.rename(file.path, filePath, (err) => {
//       if (err) return next(new ApiError("Error saving file", 500));
//     });
//   });
//   next();
// });

// @desc    Get All Products
// @route   GET /api/v1/products
// @access  Private/Admin
exports.getProducts = asyncHandler(async (req, res) => {
  if (req.query) {
    const keys = Object.keys(req.query);
    const values = Object.values(req.query);
    let query = {};

    for (let i = 0; i < keys.length; i++) {
      if (values[i] == "") {
        continue;
      } else if (keys[i] == "min" || keys[i] == "max") {
        query[keys[i]] = +values[i];
      } else if (
        keys[i] == "category" ||
        keys[i] === "brand" ||
        keys[i] === "subcategory"
      ) {
        if (values[i].includes(",")) {
          query[keys[i]] = values[i].split(",");
        } else {
          query[keys[i]] = values[i];
        }
      } else {
        query[keys[i]] = new RegExp(values[i], "i");
      }
    }
    req.query = query;
  }
  let documents = await Product.find(req.query);
  if (req.query.min && req.query.max) {
    console.log(documents.length);
    const filter = documents.filter(
      (product) =>
        product.price >= req.query.min && product.price <= req.query.max
    );
    documents = filter;
    console.log(documents.length);
  }
  res.status(200).json({ results: documents.length, data: documents });
});

// @desc    Get Soecific Product
// @route   GET /api/v1/products/:id
// @access  Private/Admin
exports.getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const document = await Product.findById(id);
  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc    Create Product
// @route   POST /api/v1/products/:id
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res) => {
  const newDoc = await Product.create(req.body);
  res.status(201).json({ data: newDoc });
});

// @desc    PUT Product
// @route   Update /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const document = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  // Trigger "save" event when update document
  document.save();
  res.status(200).json({ data: document });
});

// @desc    Delete Product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const document = await Product.findByIdAndDelete(id);

  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }

  res.status(204).send();
});
