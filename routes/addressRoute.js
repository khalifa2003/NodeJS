const express = require("express");
const authService = require("../services/authService");
const { addAddress, removeAddress, getLoggedUserAddresses } = require("../services/addressService");
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       required:
 *         - alias
 *         - details
 *         - phone
 *         - city
 *       properties:
 *         _id:
 *           type: string
 *           description: Address unique identifier
 *         alias:
 *           type: string
 *           description: Address alias (e.g., Home, Work, etc.)
 *         details:
 *           type: string
 *           description: Detailed address description
 *         phone:
 *           type: string
 *           description: Contact phone number for this address
 *         city:
 *           type: string
 *           description: City name
 *         postalCode:
 *           type: string
 *           description: Postal/ZIP code
 *       example:
 *         _id: "507f1f77bcf86cd799439011"
 *         alias: "Home"
 *         details: "123 Main Street, Apartment 4B"
 *         phone: "+201234567890"
 *         city: "Cairo"
 *         postalCode: "12345"
 * 
 *     AddAddressRequest:
 *       type: object
 *       required:
 *         - alias
 *         - details
 *         - phone
 *         - city
 *       properties:
 *         alias:
 *           type: string
 *           description: Address alias (e.g., Home, Work, etc.)
 *           example: "Home"
 *         details:
 *           type: string
 *           description: Detailed address description
 *           example: "123 Main Street, Apartment 4B"
 *         phone:
 *           type: string
 *           description: Contact phone number for this address
 *           example: "+201234567890"
 *         city:
 *           type: string
 *           description: City name
 *           example: "Cairo"
 *         postalCode:
 *           type: string
 *           description: Postal/ZIP code
 *           example: "12345"
 * 
 *     AddressResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Address added successfully."
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Address'
 * 
 *     AddressListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         results:
 *           type: number
 *           description: Number of addresses
 *           example: 2
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Address'
 * 
 *     RemoveAddressResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Address removed successfully."
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Address'
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
 * 
 *     ServerError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "error"
 *         message:
 *           type: string
 *           example: "Internal server error"
 */

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: User address management endpoints (Protected - User only)
 */

// Apply auth middleware
router.use(authService.protect, authService.allowedTo("user"));

/**
 * @swagger
 * /api/v1/addresses:
 *   post:
 *     summary: Add new address
 *     description: Add a new address to the logged-in user's address list
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddAddressRequest'
 *     responses:
 *       200:
 *         description: Address added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddressResponse'
 *       400:
 *         description: Validation error - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               status: "fail"
 *               message: "Validation Error"
 *               errors:
 *                 - msg: "Alias is required"
 *                   param: "alias"
 *                   location: "body"
 *                 - msg: "Details is required"
 *                   param: "details"
 *                   location: "body"
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 * 
 *   get:
 *     summary: Get user addresses
 *     description: Retrieve all addresses for the logged-in user
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddressListResponse'
 *             example:
 *               status: "success"
 *               results: 2
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   alias: "Home"
 *                   details: "123 Main Street, Apartment 4B"
 *                   phone: "+201234567890"
 *                   city: "Cairo"
 *                   postalCode: "12345"
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   alias: "Work"
 *                   details: "456 Business Ave, Suite 200"
 *                   phone: "+201987654321"
 *                   city: "Giza"
 *                   postalCode: "54321"
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 */
router.route("/").post(addAddress).get(getLoggedUserAddresses);

/**
 * @swagger
 * /api/v1/addresses/{addressId}:
 *   delete:
 *     summary: Remove address
 *     description: Remove a specific address from the logged-in user's address list
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         description: The address ID to remove
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Address removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RemoveAddressResponse'
 *             example:
 *               status: "success"
 *               message: "Address removed successfully."
 *               data:
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   alias: "Work"
 *                   details: "456 Business Ave, Suite 200"
 *                   phone: "+201987654321"
 *                   city: "Giza"
 *                   postalCode: "54321"
 *       400:
 *         description: Invalid address ID format
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
 *                   example: "Invalid address ID format"
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
 *         description: Address not found
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
 *                   example: "Address not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 */
router.delete("/:addressId", removeAddress);

module.exports = router;