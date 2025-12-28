const Product = require('../models/Product');
// const APIFeatures = require('../utils/apiFeatures'); // Could implement filtering features class

exports.getProducts = async (req, res) => {
    try {
        // Basic filtering and searching can be done here.
        // tailored for simple usage:
        const keyword = req.query.keyword ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i'
            }
        } : {};

        const category = req.query.category ? { category: req.query.category } : {};

        const products = await Product.find({ ...keyword, ...category }).populate('category', 'name');

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getProductDetails = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Admin Routes
exports.createProduct = async (req, res) => {
    try {
        req.body.user = req.user.id; // Add admin user to product
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        console.error("Create Product Error:", error);

        let message = error.message;

        // Handle Mongoose Validation Errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            message = messages.join(', ');
        }

        // Handle Cast Error (e.g. invalid ObjectID)
        if (error.name === 'CastError') {
            message = `Invalid ${error.path}: ${error.value}`;
        }

        res.status(400).json({ message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Product deleted'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
