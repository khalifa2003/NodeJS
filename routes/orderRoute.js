const express = require('express');
const { createCashOrder, findAllOrders, findSpecificOrder, filterOrderForLoggedUser, updateOrderToPaid, updateOrderToDelivered, checkoutSession } = require('../services/orderSerivce');
const authService = require('../services/authService');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ShippingAddress:
 *       type: object
 *       required:
 *         - details
 *         - phone
 *         - city
 *         - postalCode
 *       properties:
 *         details:
 *           type: string
 *           description: Detailed shipping address
 *           example: "123 Main Street, Apartment 4B"
 *         phone:
 *           type: string
 *           description: Phone number for delivery contact
 *           example: "+201234567890"
 *         city:
 *           type: string
 *           description: City name
 *           example: "Cairo"
 *         postalCode:
 *           type: string
 *           description: Postal code
 *           example: "11511"
 * 
 *     CartItem:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *           description: Product ID
 *           example: "507f1f77bcf86cd799439011"
 *         quantity:
 *           type: number
 *           description: Quantity of the product
 *           example: 2
 *         color:
 *           type: string
 *           description: Selected color
 *           example: "Red"
 *         price:
 *           type: number
 *           description: Product price at time of order
 *           example: 999.99
 * 
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Order unique identifier
 *           example: "507f1f77bcf86cd799439011"
 *         user:
 *           type: string
 *           description: User ID who placed the order
 *           example: "507f1f77bcf86cd799439012"
 *         cartItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         taxPrice:
 *           type: number
 *           description: Tax amount
 *           example: 0
 *         shippingPrice:
 *           type: number
 *           description: Shipping cost
 *           example: 0
 *         totalOrderPrice:
 *           type: number
 *           description: Total order amount
 *           example: 1999.98
 *         paymentMethodType:
 *           type: string
 *           enum: [cash, card]
 *           default: cash
 *           description: Payment method used
 *           example: "cash"
 *         isPaid:
 *           type: boolean
 *           default: false
 *           description: Payment status
 *           example: false
 *         paidAt:
 *           type: string
 *           format: date-time
 *           description: Payment timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 *         isDelivered:
 *           type: boolean
 *           default: false
 *           description: Delivery status
 *           example: false
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           description: Delivery timestamp
 *           example: "2024-01-16T14:30:00.000Z"
 *         shippingAddress:
 *           $ref: '#/components/schemas/ShippingAddress'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Order creation timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Order last update timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 * 
 *     CreateOrderRequest:
 *       type: object
 *       required:
 *         - shippingAddress
 *       properties:
 *         shippingAddress:
 *           $ref: '#/components/schemas/ShippingAddress'
 * 
 *     OrderResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         data:
 *           $ref: '#/components/schemas/Order'
 * 
 *     OrdersListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         results:
 *           type: number
 *           description: Number of orders returned
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
 *             $ref: '#/components/schemas/Order'
 * 
 *     CheckoutSessionResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         session:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: Stripe session ID
 *               example: "cs_test_1234567890"
 *             url:
 *               type: string
 *               description: Stripe checkout URL
 *               example: "https://checkout.stripe.com/pay/cs_test_1234567890"
 * 
 *     NotFoundError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "There is no such cart with id 507f1f77bcf86cd799439011"
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
 *   name: Orders
 *   description: Order management endpoints
 */

// Apply authentication to all order routes
router.use(authService.protect);

/**
 * @swagger
 * /api/v1/orders/checkout-session/{cartId}:
 *   get:
 *     summary: Create Stripe checkout session
 *     description: Create a Stripe checkout session for online payment. Only users can access this endpoint.
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         description: Cart ID to create checkout session for
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *             properties:
 *               shippingAddress:
 *                 $ref: '#/components/schemas/ShippingAddress'
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckoutSessionResponse'
 *             example:
 *               status: "success"
 *               session:
 *                 id: "cs_test_1234567890"
 *                 url: "https://checkout.stripe.com/pay/cs_test_1234567890"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden - Only users can create checkout sessions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         description: Cart not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 */
router.get('/checkout-session/:cartId', authService.allowedTo('user'), checkoutSession);

/**
 * @swagger
 * /api/v1/orders/{cartId}:
 *   post:
 *     summary: Create cash order
 *     description: Create a new cash order from cart. Only users can create cash orders.
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         description: Cart ID to create order from
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *           example:
 *             shippingAddress:
 *               details: "123 Main Street, Apartment 4B"
 *               phone: "+201234567890"
 *               city: "Cairo"
 *               postalCode: "11511"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 user: "507f1f77bcf86cd799439012"
 *                 cartItems:
 *                   - product: "507f1f77bcf86cd799439013"
 *                     quantity: 2
 *                     color: "Red"
 *                     price: 999.99
 *                 taxPrice: 0
 *                 shippingPrice: 0
 *                 totalOrderPrice: 1999.98
 *                 paymentMethodType: "cash"
 *                 isPaid: false
 *                 isDelivered: false
 *                 shippingAddress:
 *                   details: "123 Main Street, Apartment 4B"
 *                   phone: "+201234567890"
 *                   city: "Cairo"
 *                   postalCode: "11511"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden - Only users can create orders
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         description: Cart not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 */
router.route('/:cartId').post(authService.allowedTo('user'), createCashOrder);

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all orders
 *     description: Retrieve orders based on user role. Users see only their orders, admins and managers see all orders.
 *     tags: [Orders]
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
 *         description: Number of orders per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (e.g., createdAt, -createdAt for descending)
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Fields to include in response (comma-separated)
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdersListResponse'
 *             example:
 *               status: "success"
 *               results: 2
 *               paginationResult:
 *                 currentPage: 1
 *                 limit: 50
 *                 numberOfPages: 1
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   user: "507f1f77bcf86cd799439012"
 *                   totalOrderPrice: 1999.98
 *                   paymentMethodType: "cash"
 *                   isPaid: false
 *                   isDelivered: false
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                 - _id: "507f1f77bcf86cd799439013"
 *                   user: "507f1f77bcf86cd799439012"
 *                   totalOrderPrice: 599.99
 *                   paymentMethodType: "card"
 *                   isPaid: true
 *                   isDelivered: true
 *                   createdAt: "2024-01-14T15:20:00.000Z"
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
router.get('/',
  authService.allowedTo('user', 'admin', 'manager'),
  filterOrderForLoggedUser,
  findAllOrders
);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get specific order
 *     description: Retrieve a specific order by its ID. Users can only access their own orders.
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Order ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 user: "507f1f77bcf86cd799439012"
 *                 cartItems:
 *                   - product: "507f1f77bcf86cd799439013"
 *                     quantity: 2
 *                     color: "Red"
 *                     price: 999.99
 *                 taxPrice: 0
 *                 shippingPrice: 0
 *                 totalOrderPrice: 1999.98
 *                 paymentMethodType: "cash"
 *                 isPaid: false
 *                 isDelivered: false
 *                 shippingAddress:
 *                   details: "123 Main Street, Apartment 4B"
 *                   phone: "+201234567890"
 *                   city: "Cairo"
 *                   postalCode: "11511"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 */
router.get('/:id', findSpecificOrder);

/**
 * @swagger
 * /api/v1/orders/{id}/pay:
 *   put:
 *     summary: Update order to paid
 *     description: Mark an order as paid. Only admins and managers can update payment status.
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Order ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Order payment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 user: "507f1f77bcf86cd799439012"
 *                 totalOrderPrice: 1999.98
 *                 paymentMethodType: "cash"
 *                 isPaid: true
 *                 paidAt: "2024-01-15T12:30:00.000Z"
 *                 isDelivered: false
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T12:30:00.000Z"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden - Only admins and managers can update payment status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 */
router.put('/:id/pay',
  authService.allowedTo('admin', 'manager'),
  updateOrderToPaid
);

/**
 * @swagger
 * /api/v1/orders/{id}/deliver:
 *   put:
 *     summary: Update order to delivered
 *     description: Mark an order as delivered. Only admins and managers can update delivery status.
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Order ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Order delivery status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 user: "507f1f77bcf86cd799439012"
 *                 totalOrderPrice: 1999.98
 *                 paymentMethodType: "cash"
 *                 isPaid: true
 *                 paidAt: "2024-01-15T12:30:00.000Z"
 *                 isDelivered: true
 *                 deliveredAt: "2024-01-16T14:30:00.000Z"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-16T14:30:00.000Z"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden - Only admins and managers can update delivery status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 */
router.put('/:id/deliver',
  authService.allowedTo('admin', 'manager'),
  updateOrderToDelivered
);

module.exports = router;