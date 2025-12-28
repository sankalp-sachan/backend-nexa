const express = require('express');
const router = express.Router();
const {
    createOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    updateOrder,
    deleteOrder,
    cancelOrder,
    sendCancelOtp
} = require('../controllers/orderController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

router.route('/new').post(isAuthenticatedUser, createOrder);

router.route('/me').get(isAuthenticatedUser, myOrders);

router.route('/:id').get(isAuthenticatedUser, getSingleOrder);
router.route('/:id/cancel').put(isAuthenticatedUser, cancelOrder);

router.route('/admin/orders').get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);

router.route('/admin/order/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

router.route('/admin/order/:id/cancel-otp').post(isAuthenticatedUser, authorizeRoles('admin'), sendCancelOtp);

module.exports = router;
