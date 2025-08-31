const express = require("express");
const authService = require("../services/authService");
const { addAddress, removeAddress, getLoggedUserAddresses } = require("../services/addressService");
const router = express.Router();

// Apply auth middleware
router.use(authService.protect, authService.allowedTo("user"));

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: User addresses management
 */

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Add new address
 *     tags: [Addresses]
 *     responses:
 *       201:
 *         description: Address added successfully
 *   get:
 *     summary: Get logged user addresses
 *     tags: [Addresses]
 *     responses:
 *       200:
 *         description: List of user addresses
 */
router.route("/").post(addAddress).get(getLoggedUserAddresses);

/**
 * @swagger
 * /addresses/{addressId}:
 *   delete:
 *     summary: Remove address by ID
 *     tags: [Addresses]
 *     parameters:
 *       - in: path
 *         name: addressId
 *         schema:
 *           type: string
 *         required: true
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address removed successfully
 *       404:
 *         description: Address not found
 */
router.delete("/:addressId", removeAddress);

module.exports = router;
