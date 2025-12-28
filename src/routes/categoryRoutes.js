const express = require('express');
const router = express.Router();
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

router.route('/')
    .get(getCategories)
    .post(isAuthenticatedUser, authorizeRoles('admin'), createCategory);

router.route('/:id')
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteCategory);

module.exports = router;
