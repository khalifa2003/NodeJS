const express = require('express');
const { getProductValidator, createProductValidator, updateProductValidator, deleteProductValidator } = require('../utils/validators/productValidator');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, uploadProductImages, resizeProductImages } = require('../services/productService');
const authService = require('../services/authService');
const reviewsRoute = require('./reviewRoute');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - quantity
 *         - price
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: Product unique identifier
 *           example: "507f1f77bcf86cd799439011"
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Product title
 *           example: "iPhone 15 Pro Max"
 *         slug:
 *           type: string
 *           description: Product slug (auto-generated from title)
 *           example: "iphone-15-pro-max"
 *         description:
 *           type: string
 *           minLength: 20
 *           description: Product description
 *           example: "Latest iPhone with advanced camera system and A17 Pro chip"
 *         quantity:
 *           type: number
 *           minimum: 0
 *           description: Available quantity in stock
 *           example: 50
 *         sold:
 *           type: number
 *           default: 0
 *           description: Number of units sold
 *           example: 25
 *         price:
 *           type: number
 *           minimum: 0
 *           description: Product price
 *           example: 1199.99
 *         priceAfterDiscount:
 *           type: number
 *           minimum: 0
 *           description: Discounted price (optional)
 *           example: 999.99
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *           description: Available colors
 *           example: ["Black", "White", "Gold", "Blue"]
 *         imageCover:
 *           type: string
 *           description: Main product image URL
 *           example: "https://api.example.com/products/product-123-cover.jpeg"
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Additional product images URLs
 *           example: ["https://api.example.com/products/product-123-1.jpeg", "https://api.example.com/products/product-123-2.jpeg"]
 *         category:
 *           type: string
 *           description: Category ID
 *           example: "507f1f77bcf86cd799439012"
 *         subcategories:
 *           type: array
 *           items:
 *             type: string
 *           description: Subcategory IDs
 *           example: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
 *         brand:
 *           type: string
 *           description: Brand ID
 *           example: "507f1f77bcf86cd799439015"
 *         ratingsAverage:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           default: 4.5
 *           description: Average rating
 *           example: 4.7
 *         ratingsQuantity:
 *           type: number
 *           default: 0
 *           description: Number of ratings
 *           example: 150
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Product creation timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Product last update timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 * 
 *     CreateProductRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - quantity
 *         - price
 *         - category
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Product title
 *           example: "iPhone 15 Pro Max"
 *         description:
 *           type: string
 *           minLength: 20
 *           description: Product description
 *           example: "Latest iPhone with advanced camera system and A17 Pro chip"
 *         quantity:
 *           type: number
 *           minimum: 0
 *           description: Available quantity in stock
 *           example: 50
 *         price:
 *           type: number
 *           minimum: 0
 *           description: Product price
 *           example: 1199.99
 *         priceAfterDiscount:
 *           type: number
 *           minimum: 0
 *           description: Discounted price (optional)
 *           example: 999.99
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *           description: Available colors
 *           example: ["Black", "White", "Gold", "Blue"]
 *         category:
 *           type: string
 *           description: Category ID
 *           example: "507f1f77bcf86cd799439012"
 *         subcategories:
 *           type: array
 *           items:
 *             type: string
 *           description: Subcategory IDs
 *           example: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
 *         brand:
 *           type: string
 *           description: Brand ID
 *           example: "507f1f77bcf86cd799439015"
 *         imageCover:
 *           type: string
 *           format: binary
 *           description: Main product image (JPEG/PNG, max 5MB)
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *           description: Additional product images (max 5 images, JPEG/PNG, max 5MB each)
 * 
 *     UpdateProductRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Product title
 *           example: "iPhone 15 Pro Max - Updated"
 *         description:
 *           type: string
 *           minLength: 20
 *           description: Product description
 *           example: "Latest iPhone with advanced camera system and A17 Pro chip - Updated description"
 *         quantity:
 *           type: number
 *           minimum: 0
 *           description: Available quantity in stock
 *           example: 75
 *         price:
 *           type: number
 *           minimum: 0
 *           description: Product price
 *           example: 1299.99
 *         priceAfterDiscount:
 *           type: number
 *           minimum: 0
 *           description: Discounted price (optional)
 *           example: 1099.99
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *           description: Available colors
 *           example: ["Black", "White", "Gold", "Blue", "Red"]
 *         category:
 *           type: string
 *           description: Category ID
 *           example: "507f1f77bcf86cd799439012"
 *         subcategories:
 *           type: array
 *           items:
 *             type: string
 *           description: Subcategory IDs
 *           example: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
 *         brand:
 *           type: string
 *           description: Brand ID
 *           example: "507f1f77bcf86cd799439015"
 *         imageCover:
 *           type: string
 *           format: binary
 *           description: Main product image (JPEG/PNG, max 5MB)
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *           description: Additional product images (max 5 images, JPEG/PNG, max 5MB each)
 * 
 *     ProductResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         data:
 *           $ref: '#/components/schemas/Product'
 * 
 *     ProductsListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         results:
 *           type: number
 *           description: Number of products returned
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
 *             $ref: '#/components/schemas/Product'
 * 
 *     DeleteResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Product deleted successfully"
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
 *           - msg: "Product title must be between 3 and 100 characters"
 *             param: "title"
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
 *           example: "No product found for this id"
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
 *   name: Products
 *   description: Product management endpoints
 */

// Nested route for reviews
router.use('/:productId/reviews', reviewsRoute);

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a paginated list of all products. This endpoint is public and includes search, filter, and sort functionality.
 *     tags: [Products]
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
 *         description: Number of products per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (e.g., price, -price, ratingsAverage, -ratingsAverage)
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Fields to include in response (comma-separated)
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword for product title and description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand ID
 *       - in: query
 *         name: price[gte]
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: price[lte]
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: ratingsAverage[gte]
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: Minimum rating filter
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsListResponse'
 *             example:
 *               status: "success"
 *               results: 3
 *               paginationResult:
 *                 currentPage: 1
 *                 limit: 50
 *                 numberOfPages: 1
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   title: "iPhone 15 Pro Max"
 *                   slug: "iphone-15-pro-max"
 *                   description: "Latest iPhone with advanced camera system"
 *                   quantity: 50
 *                   sold: 25
 *                   price: 1199.99
 *                   priceAfterDiscount: 999.99
 *                   colors: ["Black", "White", "Gold"]
 *                   imageCover: "https://api.example.com/products/iphone-cover.jpeg"
 *                   images: ["https://api.example.com/products/iphone-1.jpeg"]
 *                   ratingsAverage: 4.7
 *                   ratingsQuantity: 150
 *                   createdAt: "2024-01-15T10:30:00.000Z"
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
 *     summary: Create new product
 *     description: Create a new product. Only admin and manager roles can create products.
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - quantity
 *               - price
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: "iPhone 15 Pro Max"
 *               description:
 *                 type: string
 *                 example: "Latest iPhone with advanced camera system and A17 Pro chip"
 *               quantity:
 *                 type: number
 *                 example: 50
 *               price:
 *                 type: number
 *                 example: 1199.99
 *               priceAfterDiscount:
 *                 type: number
 *                 example: 999.99
 *               colors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Black", "White", "Gold", "Blue"]
 *               category:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *               subcategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439013"]
 *               brand:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439015"
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 title: "iPhone 15 Pro Max"
 *                 slug: "iphone-15-pro-max"
 *                 description: "Latest iPhone with advanced camera system and A17 Pro chip"
 *                 quantity: 50
 *                 sold: 0
 *                 price: 1199.99
 *                 priceAfterDiscount: 999.99
 *                 colors: ["Black", "White", "Gold", "Blue"]
 *                 imageCover: "https://api.example.com/products/product-123-cover.jpeg"
 *                 images: ["https://api.example.com/products/product-123-1.jpeg"]
 *                 category: "507f1f77bcf86cd799439012"
 *                 subcategories: ["507f1f77bcf86cd799439013"]
 *                 brand: "507f1f77bcf86cd799439015"
 *                 ratingsAverage: 4.5
 *                 ratingsQuantity: 0
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
 *       500:
 *         description: Internal server error
 */
router.route('/').get(getProducts)
  .post(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct
  );

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a specific product by its ID with populated reviews. This endpoint is public.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 title: "iPhone 15 Pro Max"
 *                 slug: "iphone-15-pro-max"
 *                 description: "Latest iPhone with advanced camera system and A17 Pro chip"
 *                 quantity: 50
 *                 sold: 25
 *                 price: 1199.99
 *                 priceAfterDiscount: 999.99
 *                 colors: ["Black", "White", "Gold", "Blue"]
 *                 imageCover: "https://api.example.com/products/iphone-cover.jpeg"
 *                 images: ["https://api.example.com/products/iphone-1.jpeg", "https://api.example.com/products/iphone-2.jpeg"]
 *                 category: "507f1f77bcf86cd799439012"
 *                 subcategories: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
 *                 brand: "507f1f77bcf86cd799439015"
 *                 ratingsAverage: 4.7
 *                 ratingsQuantity: 150
 *                 reviews: []
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Invalid product ID format
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
 *                   example: "Invalid product ID format"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 * 
 *   put:
 *     summary: Update product
 *     description: Update a specific product by its ID. Only admin and manager roles can update products.
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "iPhone 15 Pro Max - Updated"
 *               description:
 *                 type: string
 *                 example: "Latest iPhone with advanced camera system - Updated description"
 *               quantity:
 *                 type: number
 *                 example: 75
 *               price:
 *                 type: number
 *                 example: 1299.99
 *               priceAfterDiscount:
 *                 type: number
 *                 example: 1099.99
 *               colors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Black", "White", "Gold", "Blue", "Red"]
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 title: "iPhone 15 Pro Max - Updated"
 *                 slug: "iphone-15-pro-max-updated"
 *                 description: "Latest iPhone with advanced camera system - Updated description"
 *                 quantity: 75
 *                 sold: 25
 *                 price: 1299.99
 *                 priceAfterDiscount: 1099.99
 *                 colors: ["Black", "White", "Gold", "Blue", "Red"]
 *                 imageCover: "https://api.example.com/products/product-456-cover.jpeg"
 *                 images: ["https://api.example.com/products/product-456-1.jpeg"]
 *                 category: "507f1f77bcf86cd799439012"
 *                 ratingsAverage: 4.7
 *                 ratingsQuantity: 150
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T12:00:00.000Z"
 *       400:
 *         description: Validation error or invalid product ID
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
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 * 
 *   delete:
 *     summary: Delete product
 *     description: Delete a specific product by its ID. Only admin role can delete products. This will also delete all related reviews.
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 *       400:
 *         description: Invalid product ID format
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
 *                   example: "Invalid product ID format"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden - Only admin can delete products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 */
router.route('/:id').get(getProductValidator, getProduct)
  .put(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;