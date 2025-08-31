const express = require('express');
const { getCategoryValidator, createCategoryValidator, updateCategoryValidator, deleteCategoryValidator } = require('../utils/validators/categoryValidator');
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory, uploadCategoryImage, resizeImage } = require('../services/categoryService');
const authService = require('../services/authService');
const subcategoriesRoute = require('./subCategoryRoute');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: Category unique identifier
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 32
 *           description: Category name (must be unique)
 *         slug:
 *           type: string
 *           description: Category slug (auto-generated from name)
 *         image:
 *           type: string
 *           description: Full URL to category image
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Category creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Category last update timestamp
 *       example:
 *         _id: "507f1f77bcf86cd799439011"
 *         name: "Electronics"
 *         slug: "electronics"
 *         image: "https://api.example.com/categories/category-123e4567-e89b-12d3-a456-426614174000-1638360000000.jpeg"
 *         createdAt: "2024-01-15T10:30:00.000Z"
 *         updatedAt: "2024-01-15T10:30:00.000Z"
 * 
 *     CreateCategoryRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 32
 *           description: Category name (must be unique)
 *           example: "Electronics"
 *         image:
 *           type: string
 *           format: binary
 *           description: Category image file (JPEG/PNG, max 5MB)
 * 
 *     UpdateCategoryRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 32
 *           description: Category name (must be unique)
 *           example: "Consumer Electronics"
 *         image:
 *           type: string
 *           format: binary
 *           description: Category image file (JPEG/PNG, max 5MB)
 * 
 *     CategoryResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         data:
 *           $ref: '#/components/schemas/Category'
 * 
 *     CategoriesListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         results:
 *           type: number
 *           description: Number of categories returned
 *           example: 5
 *         paginationResult:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: number
 *               example: 1
 *             limit:
 *               type: number
 *               example: 50
 *             numberOfPages:
 *               type: number
 *               example: 1
 *             next:
 *               type: number
 *               example: 2
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 * 
 *     DeleteResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Category deleted successfully"
 * 
 *     ValidationError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               msg:
 *                 type: string
 *               param:
 *                 type: string
 *               location:
 *                 type: string
 *       example:
 *         status: "fail"
 *         message: "Validation Error"
 *         errors:
 *           - msg: "Category name must be between 3 and 32 characters"
 *             param: "name"
 *             location: "body"
 * 
 *     NotFoundError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "No category found for this id"
 * 
 *     DuplicateError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "Category name already exists"
 * 
 *     UnauthorizedError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "You are not login, Please login to get access this route"
 * 
 *     ForbiddenError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "You are not allowed to access this route"
 */

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management endpoints
 */

// Nested route for subcategories
router.use('/:categoryId/subcategories', subcategoriesRoute);

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a paginated list of all categories. This endpoint is public and doesn't require authentication.
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of categories per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field (e.g., name, createdAt, -createdAt for descending)
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Fields to include in response (comma-separated)
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword for category name
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriesListResponse'
 *             example:
 *               status: "success"
 *               results: 3
 *               paginationResult:
 *                 currentPage: 1
 *                 limit: 50
 *                 numberOfPages: 1
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   name: "Electronics"
 *                   slug: "electronics"
 *                   image: "https://api.example.com/categories/electronics.jpeg"
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   name: "Clothing"
 *                   slug: "clothing"
 *                   image: "https://api.example.com/categories/clothing.jpeg"
 *                   createdAt: "2024-01-15T11:00:00.000Z"
 *                 - _id: "507f1f77bcf86cd799439013"
 *                   name: "Home & Garden"
 *                   slug: "home-garden"
 *                   image: "https://api.example.com/categories/home-garden.jpeg"
 *                   createdAt: "2024-01-15T11:30:00.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 * 
 *   post:
 *     summary: Create new category
 *     description: Create a new category. Only admin and manager roles can create categories.
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 32
 *                 example: "Electronics"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Electronics"
 *                 slug: "electronics"
 *                 image: "https://api.example.com/categories/category-123e4567-e89b-12d3-a456-426614174000-1638360000000.jpeg"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden - User role not allowed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       409:
 *         description: Category name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuplicateError'
 *       500:
 *         description: Internal server error
 */
router.route('/').get(getCategories)
  .post(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadCategoryImage,
    resizeImage,
    createCategoryValidator,
    createCategory
  );

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     description: Retrieve a specific category by its ID. This endpoint is public and doesn't require authentication.
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Electronics"
 *                 slug: "electronics"
 *                 image: "https://api.example.com/categories/electronics.jpeg"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Invalid category ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "Invalid category ID format"
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 * 
 *   put:
 *     summary: Update category
 *     description: Update a specific category by its ID. Only admin and manager roles can update categories.
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryRequest'
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 32
 *                 example: "Consumer Electronics"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Consumer Electronics"
 *                 slug: "consumer-electronics"
 *                 image: "https://api.example.com/categories/category-456e7890-e89b-12d3-a456-426614174000-1638360000000.jpeg"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T12:00:00.000Z"
 *       400:
 *         description: Validation error or invalid category ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden - User role not allowed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       409:
 *         description: Category name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuplicateError'
 *       500:
 *         description: Internal server error
 * 
 *   delete:
 *     summary: Delete category
 *     description: Delete a specific category by its ID. Only admin role can delete categories. Note - This will also delete all related subcategories and products.
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 *       400:
 *         description: Invalid category ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "Invalid category ID format"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden - Only admin can delete categories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 */
router.route('/:id').get(getCategoryValidator, getCategory)
  .put(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadCategoryImage,
    resizeImage,
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteCategoryValidator,
    deleteCategory
  );

module.exports = router;