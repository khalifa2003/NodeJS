const express = require('express');
const authService = require('../services/authService');
const { addProductToWishlist, removeProductFromWishlist, getLoggedUserWishlist } = require('../services/wishlistService');
const asyncHandler = require('express-async-handler');

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Product unique identifier
 *         title:
 *           type: string
 *           description: Product title
 *         slug:
 *           type: string
 *           description: Product slug
 *         description:
 *           type: string
 *           description: Product description
 *         quantity:
 *           type: number
 *           description: Available quantity
 *         sold:
 *           type: number
 *           description: Number of items sold
 *         price:
 *           type: number
 *           description: Product price
 *         priceAfterDiscount:
 *           type: number
 *           description: Price after discount (if any)
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *           description: Available colors
 *         imageCover:
 *           type: string
 *           description: Main product image URL
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Additional product images
 *         category:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             slug:
 *               type: string
 *         subcategories:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *         brand:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             slug:
 *               type: string
 *         ratingsAverage:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Average product rating
 *         ratingsQuantity:
 *           type: number
 *           description: Number of ratings
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "507f1f77bcf86cd799439011"
 *         title: "iPhone 15 Pro"
 *         slug: "iphone-15-pro"
 *         description: "Latest iPhone with advanced features"
 *         quantity: 50
 *         sold: 25
 *         price: 999.99
 *         priceAfterDiscount: 899.99
 *         colors: ["Black", "White", "Blue"]
 *         imageCover: "https://api.example.com/products/iphone-15-pro-cover.jpg"
 *         images: ["https://api.example.com/products/iphone-15-pro-1.jpg"]
 *         category:
 *           _id: "507f1f77bcf86cd799439020"
 *           name: "Electronics"
 *           slug: "electronics"
 *         brand:
 *           _id: "507f1f77bcf86cd799439030"
 *           name: "Apple"
 *           slug: "apple"
 *         ratingsAverage: 4.5
 *         ratingsQuantity: 150
 *         createdAt: "2024-01-15T10:30:00.000Z"
 *         updatedAt: "2024-01-15T10:30:00.000Z"
 * 
 *     AddToWishlistRequest:
 *       type: object
 *       required:
 *         - productId
 *       properties:
 *         productId:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           description: Product ID to add to wishlist (MongoDB ObjectId)
 *           example: "507f1f77bcf86cd799439011"
 * 
 *     WishlistResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Product added successfully to your wishlist."
 *         data:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of product IDs in wishlist
 *           example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 * 
 *     WishlistProductsResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         results:
 *           type: number
 *           description: Number of products in wishlist
 *           example: 3
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 * 
 *     RemoveFromWishlistResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Product removed successfully from your wishlist."
 *         data:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of remaining product IDs in wishlist
 *           example: ["507f1f77bcf86cd799439012"]
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
 *           - msg: "Product ID is required"
 *             param: "productId"
 *             location: "body"
 * 
 *     UnauthorizedError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "You are not logged in. Please login to access this route"
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
 * 
 *     NotFoundError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "Product not found"
 * 
 *     ServerError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "error"
 *         message:
 *           type: string
 *           example: "Something went wrong on our servers"
 */

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: User wishlist management endpoints for saving favorite products
 */

// All wishlist routes require user authentication and user role
router.use(authService.protect, authService.allowedTo('user'));

/**
 * @swagger
 * /api/v1/wishlist:
 *   post:
 *     summary: Add product to wishlist
 *     description: |
 *       Add a product to the authenticated user's wishlist.
 *       
 *       **Features:**
 *       - Requires user authentication
 *       - Only 'user' role can access
 *       - Prevents duplicate entries (uses $addToSet)
 *       - Product must exist in the database
 *       - Returns updated wishlist array
 *       
 *       **Business Rules:**
 *       - Users can only manage their own wishlist
 *       - Same product cannot be added twice
 *       - Product availability is not checked (users can wishlist out-of-stock items)
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToWishlistRequest'
 *           examples:
 *             add_product:
 *               summary: Add iPhone to wishlist
 *               value:
 *                 productId: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Product added to wishlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WishlistResponse'
 *             examples:
 *               success:
 *                 summary: Product added successfully
 *                 value:
 *                   status: "success"
 *                   message: "Product added successfully to your wishlist."
 *                   data: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *               already_exists:
 *                 summary: Product already in wishlist
 *                 value:
 *                   status: "success"
 *                   message: "Product added successfully to your wishlist."
 *                   data: ["507f1f77bcf86cd799439011"]
 *       400:
 *         description: Validation error - Invalid or missing product ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               missing_product_id:
 *                 summary: Missing product ID
 *                 value:
 *                   status: "fail"
 *                   message: "Validation Error"
 *                   errors:
 *                     - msg: "Product ID is required"
 *                       param: "productId"
 *                       location: "body"
 *               invalid_product_id:
 *                 summary: Invalid product ID format
 *                 value:
 *                   status: "fail"
 *                   message: "Validation Error"
 *                   errors:
 *                     - msg: "Invalid product ID format"
 *                       param: "productId"
 *                       location: "body"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden - Only users can access wishlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *             example:
 *               status: "fail"
 *               message: "Access denied. Only users can manage wishlist."
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 * 
 *   get:
 *     summary: Get user wishlist
 *     description: |
 *       Retrieve the authenticated user's complete wishlist with populated product details.
 *       
 *       **Features:**
 *       - Returns complete product information for each wishlist item
 *       - Includes product images, prices, ratings, and availability
 *       - Shows category, subcategory, and brand information
 *       - Returns count of total wishlist items
 *       - Automatically filters out deleted products
 *       
 *       **Product Information Included:**
 *       - Basic details (title, description, price)
 *       - Images (cover image and gallery)
 *       - Category and brand information
 *       - Ratings and reviews summary
 *       - Stock availability
 *       - Discount information
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WishlistProductsResponse'
 *             examples:
 *               with_products:
 *                 summary: Wishlist with products
 *                 value:
 *                   status: "success"
 *                   results: 2
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       title: "iPhone 15 Pro"
 *                       slug: "iphone-15-pro"
 *                       description: "Latest iPhone with advanced features"
 *                       price: 999.99
 *                       priceAfterDiscount: 899.99
 *                       imageCover: "https://api.example.com/products/iphone-15-pro.jpg"
 *                       category:
 *                         name: "Electronics"
 *                         slug: "electronics"
 *                       brand:
 *                         name: "Apple"
 *                         slug: "apple"
 *                       ratingsAverage: 4.5
 *                       ratingsQuantity: 150
 *                       quantity: 50
 *                     - _id: "507f1f77bcf86cd799439012"
 *                       title: "Samsung Galaxy S24"
 *                       slug: "samsung-galaxy-s24"
 *                       price: 799.99
 *                       imageCover: "https://api.example.com/products/galaxy-s24.jpg"
 *                       category:
 *                         name: "Electronics"
 *                       brand:
 *                         name: "Samsung"
 *                       ratingsAverage: 4.3
 *                       quantity: 30
 *               empty_wishlist:
 *                 summary: Empty wishlist
 *                 value:
 *                   status: "success"
 *                   results: 0
 *                   data: []
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden - Only users can access wishlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 */
router.route('/')
  .post(asyncHandler(addProductToWishlist))
  .get(asyncHandler(getLoggedUserWishlist));

/**
 * @swagger
 * /api/v1/wishlist/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     description: |
 *       Remove a specific product from the authenticated user's wishlist.
 *       
 *       **Features:**
 *       - Removes product from user's wishlist array
 *       - Returns updated wishlist (product IDs only)
 *       - Safe operation - no error if product not in wishlist
 *       - Product doesn't need to exist in database to be removed
 *       
 *       **Business Rules:**
 *       - Users can only manage their own wishlist
 *       - Operation succeeds even if product not in wishlist
 *       - Returns remaining product IDs in wishlist
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: Product ID to remove from wishlist (MongoDB ObjectId)
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Product removed from wishlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RemoveFromWishlistResponse'
 *             examples:
 *               success:
 *                 summary: Product removed successfully
 *                 value:
 *                   status: "success"
 *                   message: "Product removed successfully from your wishlist."
 *                   data: ["507f1f77bcf86cd799439012"]
 *               not_in_wishlist:
 *                 summary: Product not in wishlist (still success)
 *                 value:
 *                   status: "success"
 *                   message: "Product removed successfully from your wishlist."
 *                   data: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *               empty_after_removal:
 *                 summary: Wishlist empty after removal
 *                 value:
 *                   status: "success"
 *                   message: "Product removed successfully from your wishlist."
 *                   data: []
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
 *                   example: "Invalid product ID format. Must be a valid MongoDB ObjectId"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden - Only users can access wishlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *             example:
 *               status: "fail"
 *               message: "Access denied. Only users can manage wishlist."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 */
router.delete('/:productId', asyncHandler(removeProductFromWishlist));

module.exports = router;