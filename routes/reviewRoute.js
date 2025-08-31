const express = require('express');
const { createReviewValidator, updateReviewValidator, getReviewValidator, deleteReviewValidator } = require('../utils/validators/reviewValidator');
const { getReview, getReviews, createReview, updateReview, deleteReview, createFilterObj, setProductIdAndUserIdToBody } = require('../services/reviewService');
const authService = require('../services/authService');
const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - title
 *         - ratings
 *         - user
 *         - product
 *       properties:
 *         _id:
 *           type: string
 *           description: Review unique identifier
 *           example: "507f1f77bcf86cd799439011"
 *         title:
 *           type: string
 *           description: Review title
 *           example: "Great product, highly recommended!"
 *         ratings:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Product rating (1-5 stars)
 *           example: 4.5
 *         user:
 *           type: object
 *           description: User who wrote the review (populated)
 *           properties:
 *             _id:
 *               type: string
 *               example: "507f1f77bcf86cd799439012"
 *             name:
 *               type: string
 *               example: "John Doe"
 *         product:
 *           type: object
 *           description: Product being reviewed (populated)
 *           properties:
 *             _id:
 *               type: string
 *               example: "507f1f77bcf86cd799439013"
 *             title:
 *               type: string
 *               example: "iPhone 15 Pro Max"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Review creation timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Review last update timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 * 
 *     CreateReviewRequest:
 *       type: object
 *       required:
 *         - title
 *         - ratings
 *       properties:
 *         title:
 *           type: string
 *           description: Review title
 *           example: "Amazing product quality!"
 *         ratings:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Product rating (1-5 stars)
 *           example: 5
 *         product:
 *           type: string
 *           description: Product ID (optional if using nested route)
 *           example: "507f1f77bcf86cd799439013"
 * 
 *     UpdateReviewRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Updated review title
 *           example: "Updated review - Still great!"
 *         ratings:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Updated rating (1-5 stars)
 *           example: 4
 * 
 *     ReviewResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         data:
 *           $ref: '#/components/schemas/Review'
 * 
 *     ReviewsListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         results:
 *           type: number
 *           description: Number of reviews returned
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
 *               example: 2
 *             next:
 *               type: number
 *               example: 2
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Review'
 * 
 *     DeleteResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Review deleted successfully"
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
 *           - msg: "Rating must be between 1 and 5"
 *             param: "ratings"
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
 *           example: "No review found for this id"
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
 * 
 *     DuplicateReviewError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "You already created a review before"
 */

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management endpoints
 */

/**
 * @swagger
 * /api/v1/reviews:
 *   get:
 *     summary: Get all reviews
 *     description: Retrieve a paginated list of all reviews. This endpoint is public.
 *     tags: [Reviews]
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
 *         description: Number of reviews per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (e.g., ratings, -ratings, createdAt, -createdAt)
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Fields to include in response (comma-separated)
 *       - in: query
 *         name: ratings[gte]
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: Minimum rating filter
 *       - in: query
 *         name: ratings[lte]
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: Maximum rating filter
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewsListResponse'
 *             example:
 *               status: "success"
 *               results: 3
 *               paginationResult:
 *                 currentPage: 1
 *                 limit: 50
 *                 numberOfPages: 1
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   title: "Excellent product!"
 *                   ratings: 5
 *                   user:
 *                     _id: "507f1f77bcf86cd799439012"
 *                     name: "John Doe"
 *                   product:
 *                     _id: "507f1f77bcf86cd799439013"
 *                     title: "iPhone 15 Pro Max"
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                 - _id: "507f1f77bcf86cd799439014"
 *                   title: "Good value for money"
 *                   ratings: 4
 *                   user:
 *                     _id: "507f1f77bcf86cd799439015"
 *                     name: "Jane Smith"
 *                   product:
 *                     _id: "507f1f77bcf86cd799439013"
 *                     title: "iPhone 15 Pro Max"
 *                   createdAt: "2024-01-14T15:20:00.000Z"
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
 *     summary: Create new review
 *     description: Create a new review. Only authenticated users can create reviews.
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReviewRequest'
 *           example:
 *             title: "Amazing product quality!"
 *             ratings: 5
 *             product: "507f1f77bcf86cd799439013"
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 title: "Amazing product quality!"
 *                 ratings: 5
 *                 user:
 *                   _id: "507f1f77bcf86cd799439012"
 *                   name: "John Doe"
 *                 product:
 *                   _id: "507f1f77bcf86cd799439013"
 *                   title: "iPhone 15 Pro Max"
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
 *         description: Forbidden - Only users can create reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       409:
 *         description: Duplicate review - User already reviewed this product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuplicateReviewError'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/products/{productId}/reviews:
 *   get:
 *     summary: Get reviews for specific product
 *     description: Retrieve all reviews for a specific product. This endpoint is public.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: Product ID to get reviews for
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
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
 *         description: Number of reviews per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (e.g., ratings, -ratings, createdAt, -createdAt)
 *       - in: query
 *         name: ratings[gte]
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: Minimum rating filter
 *     responses:
 *       200:
 *         description: Product reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewsListResponse'
 *             example:
 *               status: "success"
 *               results: 2
 *               paginationResult:
 *                 currentPage: 1
 *                 limit: 50
 *                 numberOfPages: 1
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   title: "Excellent product!"
 *                   ratings: 5
 *                   user:
 *                     _id: "507f1f77bcf86cd799439012"
 *                     name: "John Doe"
 *                   product:
 *                     _id: "507f1f77bcf86cd799439013"
 *                     title: "iPhone 15 Pro Max"
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *       500:
 *         description: Internal server error
 * 
 *   post:
 *     summary: Create review for specific product
 *     description: Create a new review for a specific product. Only authenticated users can create reviews.
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: Product ID to review
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - ratings
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Great product for this product!"
 *               ratings:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4.5
 *     responses:
 *       201:
 *         description: Review created successfully for the product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewResponse'
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
 *         description: Forbidden - Only users can create reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       409:
 *         description: Duplicate review - User already reviewed this product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuplicateReviewError'
 *       500:
 *         description: Internal server error
 */
router.route('/').get(createFilterObj, getReviews)
  .post(
    authService.protect,
    authService.allowedTo('user'),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   get:
 *     summary: Get review by ID
 *     description: Retrieve a specific review by its ID. This endpoint is public.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Review ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Review retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 title: "Excellent product!"
 *                 ratings: 5
 *                 user:
 *                   _id: "507f1f77bcf86cd799439012"
 *                   name: "John Doe"
 *                 product:
 *                   _id: "507f1f77bcf86cd799439013"
 *                   title: "iPhone 15 Pro Max"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Invalid review ID format
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
 *                   example: "Invalid review ID format"
 *       404:
 *         description: Review not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 * 
 *   put:
 *     summary: Update review
 *     description: Update a specific review by its ID. Only the user who created the review can update it.
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Review ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReviewRequest'
 *           example:
 *             title: "Updated review - Still excellent!"
 *             ratings: 4.5
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 title: "Updated review - Still excellent!"
 *                 ratings: 4.5
 *                 user:
 *                   _id: "507f1f77bcf86cd799439012"
 *                   name: "John Doe"
 *                 product:
 *                   _id: "507f1f77bcf86cd799439013"
 *                   title: "iPhone 15 Pro Max"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T12:00:00.000Z"
 *       400:
 *         description: Validation error or invalid review ID
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
 *         description: Forbidden - Only review owner can update
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         description: Review not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 * 
 *   delete:
 *     summary: Delete review
 *     description: Delete a specific review by its ID. Users can delete their own reviews, while admins and managers can delete any review.
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Review ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 *       400:
 *         description: Invalid review ID format
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
 *                   example: "Invalid review ID format"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden - User not allowed to delete this review
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         description: Review not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 */
router.route('/:id').get(getReviewValidator, getReview)
  .put(
    authService.protect,
    authService.allowedTo('user'),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authService.protect,
    authService.allowedTo('user', 'manager', 'admin'),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;