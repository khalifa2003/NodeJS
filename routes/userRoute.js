const express = require('express');
const { getUserValidator, createUserValidator, updateUserValidator, deleteUserValidator, changeUserPasswordValidator, updateLoggedUserValidator } = require('../utils/validators/userValidator');
const { getUsers, getUser, createUser, updateUser, deleteUser, uploadUserImage, resizeImage, changeUserPassword, getLoggedUserData, updateLoggedUserPassword, updateLoggedUserData, deleteLoggedUserData } = require('../services/userService');
const authService = require('../services/authService');
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
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: User unique identifier
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 32
 *           description: User full name
 *         slug:
 *           type: string
 *           description: User slug (auto-generated from name)
 *         email:
 *           type: string
 *           format: email
 *           description: User email address (must be unique)
 *         phone:
 *           type: string
 *           description: User phone number
 *         profileImg:
 *           type: string
 *           description: User profile image filename
 *         role:
 *           type: string
 *           enum: [user, manager, admin]
 *           default: user
 *           description: User role in the system
 *         active:
 *           type: boolean
 *           default: true
 *           description: User account status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: User creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: User last update timestamp
 *       example:
 *         _id: "507f1f77bcf86cd799439011"
 *         name: "Ahmed Mohamed"
 *         slug: "ahmed-mohamed"
 *         email: "ahmed@example.com"
 *         phone: "+201234567890"
 *         profileImg: "user-123e4567-e89b-12d3-a456-426614174000-1638360000000.jpeg"
 *         role: "user"
 *         active: true
 *         createdAt: "2024-01-15T10:30:00.000Z"
 *         updatedAt: "2024-01-15T10:30:00.000Z"
 * 
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - passwordConfirm
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 32
 *           example: "Ahmed Mohamed"
 *         email:
 *           type: string
 *           format: email
 *           example: "ahmed@example.com"
 *         password:
 *           type: string
 *           minLength: 6
 *           example: "password123"
 *         passwordConfirm:
 *           type: string
 *           example: "password123"
 *         phone:
 *           type: string
 *           example: "+201234567890"
 *         role:
 *           type: string
 *           enum: [user, manager, admin]
 *           default: user
 *           example: "user"
 *         profileImg:
 *           type: string
 *           format: binary
 *           description: Profile image file (JPEG/PNG, max 5MB)
 * 
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 32
 *           example: "Ahmed Ali"
 *         email:
 *           type: string
 *           format: email
 *           example: "ahmed.ali@example.com"
 *         phone:
 *           type: string
 *           example: "+201234567890"
 *         role:
 *           type: string
 *           enum: [user, manager, admin]
 *           example: "manager"
 *         profileImg:
 *           type: string
 *           format: binary
 *           description: Profile image file (JPEG/PNG, max 5MB)
 * 
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - password
 *         - passwordConfirm
 *       properties:
 *         password:
 *           type: string
 *           minLength: 6
 *           example: "newpassword123"
 *         passwordConfirm:
 *           type: string
 *           example: "newpassword123"
 * 
 *     UpdateLoggedUserRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 32
 *           example: "Ahmed Ali"
 *         email:
 *           type: string
 *           format: email
 *           example: "ahmed.updated@example.com"
 *         phone:
 *           type: string
 *           example: "+201234567890"
 * 
 *     UpdateLoggedUserPasswordRequest:
 *       type: object
 *       required:
 *         - password
 *         - passwordConfirm
 *       properties:
 *         password:
 *           type: string
 *           minLength: 6
 *           example: "mynewpassword123"
 *         passwordConfirm:
 *           type: string
 *           example: "mynewpassword123"
 * 
 *     UserResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         data:
 *           $ref: '#/components/schemas/User'
 * 
 *     UsersListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         results:
 *           type: number
 *           description: Number of users returned
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
 *             previous:
 *               type: number
 *               example: null
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 * 
 *     UpdatePasswordResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         data:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * 
 *     DeleteResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "User deleted successfully"
 * 
 *     DeactivateResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "Success"
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
 *           - msg: "User name must be between 3 and 32 characters"
 *             param: "name"
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
 *           example: "No user found for this id"
 * 
 *     DuplicateError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "Email already exists"
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
 *   name: Users
 *   description: User management and profile endpoints
 */

// All routes below require authentication
router.use(authService.protect);

/**
 * @swagger
 * /api/v1/users/getMe:
 *   get:
 *     summary: Get current user profile
 *     description: |
 *       Retrieve the authenticated user's profile information.
 *       
 *       **Features:**
 *       - Returns current user's complete profile
 *       - Requires valid JWT token
 *       - No additional permissions needed
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Ahmed Mohamed"
 *                 slug: "ahmed-mohamed"
 *                 email: "ahmed@example.com"
 *                 phone: "+201234567890"
 *                 profileImg: "user-123e4567-e89b-12d3-a456-426614174000.jpeg"
 *                 role: "user"
 *                 active: true
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 */
router.get('/getMe', getLoggedUserData, asyncHandler(getUser));

/**
 * @swagger
 * /api/v1/users/changeMyPassword:
 *   put:
 *     summary: Change current user password
 *     description: |
 *       Change the authenticated user's password.
 *       
 *       **Features:**
 *       - Updates user's password securely
 *       - Returns new JWT token
 *       - Invalidates old tokens by updating passwordChangedAt
 *       - Password is hashed before storage
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLoggedUserPasswordRequest'
 *           example:
 *             password: "mynewpassword123"
 *             passwordConfirm: "mynewpassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdatePasswordResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Ahmed Mohamed"
 *                 email: "ahmed@example.com"
 *                 role: "user"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 */
router.put('/changeMyPassword', asyncHandler(updateLoggedUserPassword));

/**
 * @swagger
 * /api/v1/users/updateMe:
 *   put:
 *     summary: Update current user profile
 *     description: |
 *       Update the authenticated user's profile information.
 *       
 *       **Features:**
 *       - Updates user's name, email, and phone
 *       - Cannot change password or role through this endpoint
 *       - All fields are optional
 *       - Email must remain unique if changed
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLoggedUserRequest'
 *           examples:
 *             full_update:
 *               summary: Update all fields
 *               value:
 *                 name: "Ahmed Ali"
 *                 email: "ahmed.ali@example.com"
 *                 phone: "+201234567890"
 *             partial_update:
 *               summary: Update name only
 *               value:
 *                 name: "Ahmed Ali"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Ahmed Ali"
 *                 email: "ahmed.ali@example.com"
 *                 phone: "+201234567890"
 *                 role: "user"
 *                 updatedAt: "2024-01-15T12:00:00.000Z"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuplicateError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 */
router.put('/updateMe', updateLoggedUserValidator, asyncHandler(updateLoggedUserData));

/**
 * @swagger
 * /api/v1/users/deleteMe:
 *   delete:
 *     summary: Deactivate current user account
 *     description: |
 *       Deactivate the authenticated user's account (soft delete).
 *       
 *       **Features:**
 *       - Sets user's active status to false
 *       - Does not permanently delete the user
 *       - User can be reactivated by admin
 *       - Prevents user from logging in
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       204:
 *         description: Account deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeactivateResponse'
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 */
router.delete('/deleteMe', asyncHandler(deleteLoggedUserData));

// Routes below require admin or manager role
router.use(authService.allowedTo('admin', 'manager'));

/**
 * @swagger
 * /api/v1/users/changePassword/{id}:
 *   put:
 *     summary: Change user password (Admin/Manager)
 *     description: |
 *       Change any user's password. Only admin and manager can access this endpoint.
 *       
 *       **Requirements:**
 *       - User must be admin or manager
 *       - Target user must exist
 *       - Password will be hashed before storage
 *       - Updates passwordChangedAt timestamp
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User unique identifier
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *           example:
 *             password: "newpassword123"
 *             passwordConfirm: "newpassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Validation error or invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized - Invalid or expired token
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
 *         description: User not found
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
 */
router.put('/changePassword/:id', changeUserPasswordValidator, asyncHandler(changeUserPassword));

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     description: |
 *       Retrieve a paginated list of all users with filtering, sorting, and search capabilities.
 *       
 *       **Features:**
 *       - Pagination support
 *       - Search by user name or email
 *       - Field selection
 *       - Custom sorting
 *       - Role-based filtering
 *       - Only admin and manager can access
 *       
 *       **Query Examples:**
 *       - `/api/v1/users?page=1&limit=20` - Basic pagination
 *       - `/api/v1/users?keyword=ahmed` - Search users
 *       - `/api/v1/users?sort=-createdAt` - Sort by creation date
 *       - `/api/v1/users?role=admin` - Filter by role
 *       - `/api/v1/users?fields=name,email,role` - Select specific fields
 *     tags: [Users]
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
 *         description: Number of users per page (max 100)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *           enum: [name, email, createdAt, updatedAt, -name, -email, -createdAt, -updatedAt]
 *         description: Sort field (use '-' prefix for descending order)
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to include
 *         example: "name,email,role,createdAt"
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search keyword for user name or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, manager, admin]
 *         description: Filter by user role
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by account status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersListResponse'
 *             example:
 *               status: "success"
 *               results: 25
 *               paginationResult:
 *                 currentPage: 1
 *                 limit: 50
 *                 numberOfPages: 1
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   name: "Ahmed Mohamed"
 *                   email: "ahmed@example.com"
 *                   role: "user"
 *                   active: true
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   name: "Sara Ali"
 *                   email: "sara@example.com"
 *                   role: "manager"
 *                   active: true
 *                   createdAt: "2024-01-15T11:00:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or expired token
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 * 
 *   post:
 *     summary: Create new user
 *     description: |
 *       Create a new user account with optional profile image.
 *       
 *       **Requirements:**
 *       - User must be admin or manager
 *       - Email must be unique
 *       - Password will be hashed before storage
 *       - Profile image is optional
 *       
 *       **Image Requirements:**
 *       - Supported formats: JPEG, PNG
 *       - Maximum file size: 5MB
 *       - Images are resized to 600x600px
 *       - Automatically converted to JPEG format
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *           examples:
 *             with_image:
 *               summary: User with profile image
 *               value:
 *                 name: "Ahmed Mohamed"
 *                 email: "ahmed@example.com"
 *                 password: "password123"
 *                 passwordConfirm: "password123"
 *                 phone: "+201234567890"
 *                 role: "user"
 *                 profileImg: "(binary file data)"
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - passwordConfirm
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ahmed Mohamed"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ahmed@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               passwordConfirm:
 *                 type: string
 *                 example: "password123"
 *               phone:
 *                 type: string
 *                 example: "+201234567890"
 *               role:
 *                 type: string
 *                 enum: [user, manager, admin]
 *                 example: "user"
 *           examples:
 *             basic:
 *               summary: Basic user creation
 *               value:
 *                 name: "Ahmed Mohamed"
 *                 email: "ahmed@example.com"
 *                 password: "password123"
 *                 passwordConfirm: "password123"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Ahmed Mohamed"
 *                 slug: "ahmed-mohamed"
 *                 email: "ahmed@example.com"
 *                 phone: "+201234567890"
 *                 role: "user"
 *                 active: true
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized - Invalid or expired token
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
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuplicateError'
 *       413:
 *         description: Image file too large
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
 *                   example: "Image file size exceeds 5MB limit"
 *       415:
 *         description: Unsupported media type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 */

router.use(authService.protect);

router.get('/getMe', getLoggedUserData, getUser);
router.put('/changeMyPassword', updateLoggedUserPassword);
router.put('/updateMe', updateLoggedUserValidator, updateLoggedUserData);
router.delete('/deleteMe', deleteLoggedUserData);
router.use(authService.allowedTo('admin', 'manager'));
router.put('/changePassword/:id', changeUserPasswordValidator, changeUserPassword);
router.route('/').get(getUsers).post(uploadUserImage, resizeImage, createUserValidator, createUser);
router.route('/:id')
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;

