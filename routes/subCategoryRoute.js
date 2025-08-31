const express = require('express');
const { createSubCategory, getSubCategory, getSubCategories, updateSubCategory, deleteSubCategory, setCategoryIdToBody, createFilterObj } = require('../services/subCategoryService');
const { createSubCategoryValidator, getSubCategoryValidator, updateSubCategoryValidator, deleteSubCategoryValidator } = require('../utils/validators/subCategoryValidator');
const authService = require('../services/authService');
const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   schemas:
 *     SubCategory:
 *       type: object
 *       required:
 *         - name
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: SubCategory unique identifier
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 32
 *           description: SubCategory name (must be unique within category)
 *           example: "Smartphones"
 *         slug:
 *           type: string
 *           description: SubCategory slug (auto-generated from name)
 *           example: "smartphones"
 *         category:
 *           type: object
 *           description: Parent category (populated)
 *           properties:
 *             _id:
 *               type: string
 *               example: "507f1f77bcf86cd799439012"
 *             name:
 *               type: string
 *               example: "Electronics"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: SubCategory creation timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: SubCategory last update timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 * 
 *     CreateSubCategoryRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 32
 *           description: SubCategory name (must be unique within category)
 *           example: "Smartphones"
 *         category:
 *           type: string
 *           description: Category ID (optional if using nested route)
 *           example: "507f1f77bcf86cd799439012"
 * 
 *     UpdateSubCategoryRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 32
 *           description: Updated subcategory name
 *           example: "Mobile Phones"
 *         category:
 *           type: string
 *           description: Updated category ID
 *           example: "507f1f77bcf86cd799439012"
 * 
 *     SubCategoryResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         data:
 *           $ref: '#/components/schemas/SubCategory'
 * 
 *     SubCategoriesListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         results:
 *           type: number
 *           description: Number of subcategories returned
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
 *             $ref: '#/components/schemas/SubCategory'
 * 
 *     DeleteResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "SubCategory deleted successfully"
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
 *           - msg: "SubCategory name must be between 2 and 32 characters"
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
 *           example: "No subcategory found for this id"
 * 
 *     DuplicateError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "SubCategory name already exists in this category"
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
 *   name: SubCategories
 *   description: SubCategory management endpoints
 */

/**
 * @swagger
 * /api/v1/subcategories:
 *   get:
 *     summary: Get all subcategories
 *     description: Retrieve a paginated list of all subcategories. This endpoint is public and doesn't require authentication.
 *     tags: [SubCategories]
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
 *         description: Number of subcategories per page
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
 *         description: Search keyword for subcategory name
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *     responses:
 *       200:
 *         description: SubCategories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubCategoriesListResponse'
 *             example:
 *               status: "success"
 *               results: 3
 *               paginationResult:
 *                 currentPage: 1
 *                 limit: 50
 *                 numberOfPages: 1
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   name: "Smartphones"
 *                   slug: "smartphones"
 *                   category:
 *                     _id: "507f1f77bcf86cd799439012"
 *                     name: "Electronics"
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                 - _id: "507f1f77bcf86cd799439013"
 *                   name: "Laptops"
 *                   slug: "laptops"
 *                   category:
 *                     _id: "507f1f77bcf86cd799439012"
 *                     name: "Electronics"
 *                   createdAt: "2024-01-15T11:00:00.000Z"
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
 *     summary: Create new subcategory
 *     description: Create a new subcategory. Only admin and manager roles can create subcategories.
 *     tags: [SubCategories]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubCategoryRequest'
 *           example:
 *             name: "Smartphones"
 *             category: "507f1f77bcf86cd799439012"
 *     responses:
 *       201:
 *         description: SubCategory created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubCategoryResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Smartphones"
 *                 slug: "smartphones"
 *                 category:
 *                   _id: "507f1f77bcf86cd799439012"
 *                   name: "Electronics"
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
 *         description: SubCategory name already exists in this category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuplicateError'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/categories/{categoryId}/subcategories:
 *   get:
 *     summary: Get subcategories for specific category
 *     description: Retrieve all subcategories for a specific category. This endpoint is public.
 *     tags: [SubCategories]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: Category ID to get subcategories for
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
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
 *         description: Number of subcategories per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field (e.g., name, createdAt, -createdAt for descending)
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword for subcategory name
 *     responses:
 *       200:
 *         description: Category subcategories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubCategoriesListResponse'
 *             example:
 *               status: "success"
 *               results: 2
 *               paginationResult:
 *                 currentPage: 1
 *                 limit: 50
 *                 numberOfPages: 1
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   name: "Smartphones"
 *                   slug: "smartphones"
 *                   category:
 *                     _id: "507f1f77bcf86cd799439012"
 *                     name: "Electronics"
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *       500:
 *         description: Internal server error
 * 
 *   post:
 *     summary: Create subcategory for specific category
 *     description: Create a new subcategory for a specific category. Only admin and manager roles can create subcategories.
 *     tags: [SubCategories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: Category ID to create subcategory for
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 32
 *                 example: "Tablets"
 *     responses:
 *       201:
 *         description: SubCategory created successfully for the category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubCategoryResponse'
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
 *         description: SubCategory name already exists in this category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuplicateError'
 *       500:
 *         description: Internal server error
 */
router.route('/')
  .post(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    setCategoryIdToBody,
    createSubCategoryValidator,
    createSubCategory
  ).get(createFilterObj, getSubCategories);

/**
 * @swagger
 * /api/v1/subcategories/{id}:
 *   get:
 *     summary: Get subcategory by ID
 *     description: Retrieve a specific subcategory by its ID with populated category. This endpoint is public.
 *     tags: [SubCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: SubCategory ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: SubCategory retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubCategoryResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Smartphones"
 *                 slug: "smartphones"
 *                 category:
 *                   _id: "507f1f77bcf86cd799439012"
 *                   name: "Electronics"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Invalid subcategory ID format
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
 *                   example: "Invalid subcategory ID format"
 *       404:
 *         description: SubCategory not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 * 
 *   put:
 *     summary: Update subcategory
 *     description: Update a specific subcategory by its ID. Only admin and manager roles can update subcategories.
 *     tags: [SubCategories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: SubCategory ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSubCategoryRequest'
 *           example:
 *             name: "Mobile Phones"
 *             category: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: SubCategory updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubCategoryResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Mobile Phones"
 *                 slug: "mobile-phones"
 *                 category:
 *                   _id: "507f1f77bcf86cd799439012"
 *                   name: "Electronics"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T12:00:00.000Z"
 *       400:
 *         description: Validation error or invalid subcategory ID
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
 *         description: SubCategory not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       409:
 *         description: SubCategory name already exists in this category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuplicateError'
 *       500:
 *         description: Internal server error
 * 
 *   delete:
 *     summary: Delete subcategory
 *     description: Delete a specific subcategory by its ID. Only admin role can delete subcategories. This will also affect products that reference this subcategory.
 *     tags: [SubCategories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: SubCategory ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: SubCategory deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 *       400:
 *         description: Invalid subcategory ID format
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
 *                   example: "Invalid subcategory ID format"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden - Only admin can delete subcategories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         description: SubCategory not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 */
router.route('/:id').get(getSubCategoryValidator, getSubCategory)
  .put(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

module.exports = router;