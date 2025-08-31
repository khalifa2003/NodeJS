const express = require('express');
const { signupValidator, loginValidator } = require('../utils/validators/authValidator');
const { signup, login, forgotPassword, verifyPassResetCode, resetPassword } = require('../services/authService');
const router = express.Router();

/**
 * @swagger
 * components:
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
 *           description: User ID
 *         name:
 *           type: string
 *           minLength: 1
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         phone:
 *           type: string
 *           description: User's phone number
 *         profileImg:
 *           type: string
 *           description: URL to user's profile image
 *         role:
 *           type: string
 *           enum: [user, manager, admin]
 *           default: user
 *           description: User role
 *         active:
 *           type: boolean
 *           default: true
 *           description: Account status
 *         wishlist:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of product IDs in wishlist
 *         addresses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               alias:
 *                 type: string
 *               details:
 *                 type: string
 *               phone:
 *                 type: string
 *               city:
 *                 type: string
 *               postalCode:
 *                 type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "507f1f77bcf86cd799439011"
 *         name: "Ahmed Mohamed"
 *         email: "ahmed@example.com"
 *         phone: "+201234567890"
 *         role: "user"
 *         active: true
 * 
 *     SignupRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           minLength: 6
 *           description: User's password
 *       example:
 *         name: "Ahmed Mohamed"
 *         email: "ahmed@example.com"
 *         password: "123456"
 * 
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password
 *       example:
 *         email: "ahmed@example.com"
 *         password: "123456"
 * 
 *     AuthResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 *           description: JWT authentication token
 *       example:
 *         data:
 *           _id: "507f1f77bcf86cd799439011"
 *           name: "Ahmed Mohamed"
 *           email: "ahmed@example.com"
 *           role: "user"
 *         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * 
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *       example:
 *         email: "ahmed@example.com"
 * 
 *     VerifyResetCodeRequest:
 *       type: object
 *       required:
 *         - resetCode
 *       properties:
 *         resetCode:
 *           type: string
 *           minLength: 6
 *           maxLength: 6
 *           description: 6-digit reset code sent to email
 *       example:
 *         resetCode: "123456"
 * 
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *         - newPassword
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         newPassword:
 *           type: string
 *           minLength: 6
 *           description: New password
 *       example:
 *         email: "ahmed@example.com"
 *         newPassword: "newpassword123"
 * 
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "Success"
 *         message:
 *           type: string
 *       example:
 *         status: "Success"
 *         message: "Reset code sent to email"
 * 
 *     TokenResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT authentication token
 *       example:
 *         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
 *           - msg: "Email is required"
 *             param: "email"
 *             location: "body"
 * 
 *     ApiError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *       example:
 *         status: "fail"
 *         message: "Incorrect email or password"
 * 
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization endpoints
 */

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with name, email, and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: "fail"
 *               message: "Email already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/signup', signupValidator, signup);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: "fail"
 *               message: "Incorrect email or password"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/login', loginValidator, login);

/**
 * @swagger
 * /api/v1/auth/forgotPassword:
 *   post:
 *     summary: Request password reset
 *     description: Send password reset code to user's email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Reset code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: "Success"
 *               message: "Reset code sent to email"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: "fail"
 *               message: "There is no user with that email ahmed@example.com"
 *       500:
 *         description: Email sending failed or server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: "fail"
 *               message: "There is an error in sending email"
 */
router.post('/forgotPassword', forgotPassword);

/**
 * @swagger
 * /api/v1/auth/verifyResetCode:
 *   post:
 *     summary: Verify password reset code
 *     description: Verify the 6-digit code sent to user's email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyResetCodeRequest'
 *     responses:
 *       200:
 *         description: Reset code verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: "Success"
 *       400:
 *         description: Invalid or expired reset code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: "fail"
 *               message: "Reset code invalid or expired"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/verifyResetCode', verifyPassResetCode);

/**
 * @swagger
 * /api/v1/auth/resetPassword:
 *   put:
 *     summary: Reset password
 *     description: Reset user password after code verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Reset code not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: "fail"
 *               message: "Reset code not verified"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: "fail"
 *               message: "There is no user with email ahmed@example.com"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put('/resetPassword', resetPassword);

module.exports = router;