const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Add to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user._id,
                products: [req.body.productId]
            });
        } else {
            const isExist = wishlist.products.find(id => id.toString() === req.body.productId);
            if (isExist) {
                return res.status(400).json({
                    success: false,
                    message: "Product already in wishlist"
                });
            }
            wishlist.products.push(req.body.productId);
            await wishlist.save();
        }

        res.status(200).json({
            success: true,
            wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }

        wishlist.products = wishlist.products.filter(id => id.toString() !== req.params.id);
        await wishlist.save();

        res.status(200).json({
            success: true,
            wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get my wishlist
exports.getMyWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                products: []
            });
        }

        res.status(200).json({
            success: true,
            products: wishlist.products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
