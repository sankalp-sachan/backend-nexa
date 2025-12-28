const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../middleware/auth');
const { addToWishlist, removeFromWishlist, getMyWishlist } = require('../controllers/wishlistController');

router.route('/me').get(isAuthenticatedUser, getMyWishlist);
router.route('/add').post(isAuthenticatedUser, addToWishlist);
router.route('/:id').delete(isAuthenticatedUser, removeFromWishlist);

module.exports = router;
