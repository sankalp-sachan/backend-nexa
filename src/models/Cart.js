const mongoose = require('mongoose');

// Note: Often carts are handled in session or local storage, but for a persistent cart:
const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    cartItems: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true
            },
            name: String,
            quantity: {
                type: Number,
                default: 1
            },
            price: Number,
            image: String
        }
    ],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cart', cartSchema);
