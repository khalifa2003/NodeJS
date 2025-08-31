const express = require('express');
const { getBrandValidator, createBrandValidator, updateBrandValidator, deleteBrandValidator } = require('../utils/validators/brandValidator');
const authService = require('../services/authService');
const { getBrands, getBrand, createBrand, updateBrand, deleteBrand, uploadBrandImage, resizeImage } = require('../services/brandService');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Brand:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: Brand unique identifier
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 32
 *           description: Brand name (must be unique)
 *         slug:
 *           type: string
 *           description: Brand slug (auto-generated from name)
 *         image:
 *           type: string
 *           description: Full URL to brand image
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Brand creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Brand last update timestamp
 *       example:
 *         _id: "507f1f77bcf86cd799439011"
 *         name: "Nike"
 *         slug: "nike"
 *         image: "https://api.example.com/brands/brand-123e4567-e89b-12d3-a456-426614174000-1638360000000.jpeg"
 *         createdAt: "2024-01-15T10:30:00.000Z"
 *         updatedAt: "2024-01-15T10:30:00.000Z"
 * 
 *     CreateBrandRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 32
 *           description: Brand name (must be unique)
 *           example: "Nike"
 *         image:
 *           type: string
 *           format: binary
 *           description: Brand image file (JPEG/PNG, max 5MB)
 * 
 *     UpdateBrandRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 32
 *           description: Brand name (must be unique)
 *           example: "Adidas"
 *         image:
 *           type: string
 *           format: binary
 *           description: Brand image file (JPEG/PNG, max 5MB)
 * 
 *     BrandResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         data:
 *           $ref: '#/components/schemas/Brand'
 * 
 *     BrandsListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         results:
 *           type: number
 *           description: Number of brands returned
 *           example: 10
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
 *               example: 3
 *             next:
 *               type: number
 *               example: 2
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Brand'
 * 
 *     DeleteResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Brand deleted successfully"
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
 *           - msg: "Brand name must be between 3 and 32 characters"
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
 *           example: "No brand found for this id"
 * 
 *     DuplicateError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "Brand name already exists"
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
 *   name: Brands
 *   description: Brand management endpoints
 */

/**
 * @swagger
 * /api/v1/brands:
 *   get:
 *     summary: Get all brands
 *     description: Retrieve a paginated list of all brands. This endpoint is public and doesn't require authentication.
 *     tags: [Brands]
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
 *         description: Number of brands per page
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
 *         description: Search keyword for brand name
 *     responses:
 *       200:
 *         description: Brands retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BrandsListResponse'
 *             example:
 *               status: "success"
 *               results: 3
 *               paginationResult:
 *                 currentPage: 1
 *                 limit: 50
 *                 numberOfPages: 1
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   name: "Nike"
 *                   slug: "nike"
 *                   image: "https://api.example.com/brands/nike.jpeg"
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   name: "Adidas"
 *                   slug: "adidas"
 *                   image: "https://api.example.com/brands/adidas.jpeg"
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
 *     summary: Create new brand
 *     description: Create a new brand. Only admin and manager roles can create brands.
 *     tags: [Brands]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateBrandRequest'
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
 *                 example: "Nike"
 *     responses:
 *       201:
 *         description: Brand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BrandResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Nike"
 *                 slug: "nike"
 *                 image: "https://api.example.com/brands/brand-123e4567-e89b-12d3-a456-426614174000-1638360000000.jpeg"
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
 *         description: Brand name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuplicateError'
 *       500:
 *         description: Internal server error
 */
router.route('/').get(getBrands)
  .post(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadBrandImage,
    resizeImage,
    createBrandValidator,
    createBrand
  );

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   get:
 *     summary: Get brand by ID
 *     description: Retrieve a specific brand by its ID. This endpoint is public and doesn't require authentication.
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Brand ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Brand retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BrandResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Nike"
 *                 slug: "nike"
 *                 image: "https://api.example.com/brands/nike.jpeg"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Invalid brand ID format
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
 *                   example: "Invalid brand ID format"
 *       404:
 *         description: Brand not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 * 
 *   put:
 *     summary: Update brand
 *     description: Update a specific brand by its ID. Only admin and manager roles can update brands.
 *     tags: [Brands]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Brand ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBrandRequest'
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 32
 *                 example: "Nike Sports"
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BrandResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Nike Sports"
 *                 slug: "nike-sports"
 *                 image: "https://api.example.com/brands/brand-456e7890-e89b-12d3-a456-426614174000-1638360000000.jpeg"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T12:00:00.000Z"
 *       400:
 *         description: Validation error or invalid brand ID
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
 *         description: Brand not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       409:
 *         description: Brand name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuplicateError'
 *       500:
 *         description: Internal server error
 * 
 *   delete:
 *     summary: Delete brand
 *     description: Delete a specific brand by its ID. Only admin role can delete brands.
 *     tags: [Brands]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Brand ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 *       400:
 *         description: Invalid brand ID format
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
 *                   example: "Invalid brand ID format"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden - Only admin can delete brands
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         description: Brand not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 */
router.route('/:id').get(getBrandValidator, getBrand)
  .put(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadBrandImage,
    resizeImage,
    updateBrandValidator,
    updateBrand
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteBrandValidator,
    deleteBrand
  );

module.exports = router;