const asyncHandler = require("express-async-handler");
const SubCategory = require("../models/subCategoryModel");
const ApiError = require("../utils/apiError");

exports.getSubCategories = asyncHandler(async (req, res) => {
  const documents = await SubCategory.find(req.query);
  res.status(200).json({ results: documents.length, data: documents });
});

exports.getSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const document = await SubCategory.findById(id);
  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(200).json({ data: document });
});

exports.createSubCategory = asyncHandler(async (req, res) => {
  const newDoc = await SubCategory.create(req.body);
  res.status(201).json({ data: newDoc });
});

exports.updateSubCategory = asyncHandler(async (req, res, next) => {
  const document = await SubCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const document = await SubCategory.findByIdAndDelete(id);
  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(204).send();
});
