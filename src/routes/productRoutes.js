const express = require('express');
const router = express.Router();
const {
    getProducts,
    createProduct,
    getProductDetails,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

router.route('/')
    .get(getProducts)
    .post(isAuthenticatedUser, authorizeRoles('admin'), createProduct);

router.route('/:id')
    .get(getProductDetails)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

module.exports = router;
