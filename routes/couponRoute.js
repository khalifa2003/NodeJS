const express = require('express');
const { getCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../services/couponService');
const authService = require('../services/authService');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       required:
 *         - name
 *         - expire
 *         - discount
 *       properties:
 *         _id:
 *           type: string
 *           description: Coupon unique identifier
 *         name:
 *           type: string
 *           description: Coupon name/code (must be unique)
 *         expire:
 *           type: string
 *           format: date-time
 *           description: Coupon expiration date
 *         discount:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Discount percentage (0-100)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Coupon creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Coupon last update timestamp
 *       example:
 *         _id: "507f1f77bcf86cd799439011"
 *         name: "SAVE20"
 *         expire: "2024-12-31T23:59:59.000Z"
 *         discount: 20
 *         createdAt: "2024-01-15T10:30:00.000Z"
 *         updatedAt: "2024-01-15T10:30:00.000Z"
 * 
 *     CreateCouponRequest:
 *       type: object
 *       required:
 *         - name
 *         - expire
 *         - discount
 *       properties:
 *         name:
 *           type: string
 *           description: Coupon name/code (must be unique)
 *           example: "SAVE20"
 *         expire:
 *           type: string
 *           format: date-time
 *           description: Coupon expiration date
 *           example: "2024-12-31T23:59:59.000Z"
 *         discount:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Discount percentage (0-100)
 *           example: 20
 * 
 *     UpdateCouponRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Coupon name/code (must be unique)
 *           example: "NEWSAVE25"
 *         expire:
 *           type: string
 *           format: date-time
 *           description: Coupon expiration date
 *           example: "2024-12-31T23:59:59.000Z"
 *         discount:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Discount percentage (0-100)
 *           example: 25
 * 
 *     CouponResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         data:
 *           $ref: '#/components/schemas/Coupon'
 * 
 *     CouponsListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         results:
 *           type: number
 *           description: Number of coupons returned
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
 *             $ref: '#/components/schemas/Coupon'
 * 
 *     DeleteResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Coupon deleted successfully"
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
 *           - msg: "Coupon name is required"
 *             param: "name"
 *             location: "body"
 *           - msg: "Discount must be between 0 and 100"
 *             param: "discount"
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
 *           example: "No coupon found for this id"
 * 
 *     DuplicateError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "Coupon name already exists"
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
 *     ExpiredCouponError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "Cannot create coupon with past expiration date"
 */

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon management endpoints (Admin/Manager only)
 */

// Apply auth middleware to all routes
router.use(authService.protect, authService.allowedTo('admin', 'manager'));

/**
 * @swagger
 * /api/v1/coupons:
 *   get:
 *     summary: Get all coupons
 *     description: Retrieve a paginated list of all coupons. Only accessible by admin and manager roles.
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
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
 *         description: Number of coupons per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field (e.g., name, expire, discount, createdAt, -createdAt for descending)
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Fields to include in response (comma-separated)
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword for coupon name
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active coupons (not expired)
 *     responses:
 *       200:
 *         description: Coupons retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CouponsListResponse'
 *             example:
 *               status: "success"
 *               results: 3
 *               paginationResult:
 *                 currentPage: 1
 *                 limit: 50
 *                 numberOfPages: 1
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   name: "SAVE20"
 *                   expire: "2024-12-31T23:59:59.000Z"
 *                   discount: 20
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   name: "WELCOME10"
 *                   expire: "2024-06-30T23:59:59.000Z"
 *                   discount: 10
 *                   createdAt: "2024-01-15T11:00:00.000Z"
 *                 - _id: "507f1f77bcf86cd799439013"
 *                   name: "SUMMER25"
 *                   expire: "2024-08-31T23:59:59.000Z"
 *                   discount: 25
 *                   createdAt: "2024-01-15T11:30:00.000Z"
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
 * 
 *   post:
 *     summary: Create new coupon
 *     description: Create a new discount coupon. Only admin and manager roles can create coupons.
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCouponRequest'
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CouponResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "SAVE20"
 *                 expire: "2024-12-31T23:59:59.000Z"
 *                 discount: 20
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Validation error or expired date
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationError'
 *                 - $ref: '#/components/schemas/ExpiredCouponError'
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
 *         description: Coupon name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuplicateError'
 *       500:
 *         description: Internal server error
 */
router.route('/').get(getCoupons).post(createCoupon);

/**
 * @swagger
 * /api/v1/coupons/{id}:
 *   get:
 *     summary: Get coupon by ID
 *     description: Retrieve a specific coupon by its ID. Only accessible by admin and manager roles.
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Coupon ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Coupon retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CouponResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "SAVE20"
 *                 expire: "2024-12-31T23:59:59.000Z"
 *                 discount: 20
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Invalid coupon ID format
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
 *                   example: "Invalid coupon ID format"
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
 *         description: Coupon not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 * 
 *   put:
 *     summary: Update coupon
 *     description: Update a specific coupon by its ID. Only admin and manager roles can update coupons.
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Coupon ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCouponRequest'
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CouponResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "NEWSAVE25"
 *                 expire: "2024-12-31T23:59:59.000Z"
 *                 discount: 25
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T12:00:00.000Z"
 *       400:
 *         description: Validation error or invalid coupon ID
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationError'
 *                 - $ref: '#/components/schemas/ExpiredCouponError'
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
 *         description: Coupon not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       409:
 *         description: Coupon name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuplicateError'
 *       500:
 *         description: Internal server error
 * 
 *   delete:
 *     summary: Delete coupon
 *     description: Delete a specific coupon by its ID. Only admin and manager roles can delete coupons.
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Coupon ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 *       400:
 *         description: Invalid coupon ID format
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
 *                   example: "Invalid coupon ID format"
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
 *         description: Coupon not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 */
router.route('/:id').get(getCoupon).put(updateCoupon).delete(deleteCoupon);

module.exports = router;