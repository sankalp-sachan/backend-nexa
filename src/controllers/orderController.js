const Order = require('../models/Order');
const Product = require('../models/Product');
const { getOTPTemplate } = require('../utils/emailTemplates');
const sendEmail = require('../utils/sendEmail');

// Create new Order
exports.createOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo
        } = req.body;

        // Optional: Check stock for each item
        // For now, proceed.

        const order = await Order.create({
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo,
            paidAt: Date.now(), // Since it's Pending/Demo, maybe set paidAt to null until verified? 
            // But for simplicity in UI, if user says they paid, we might record the time.
            // Let's leave paidAt for when it is verified.
            user: req.user._id
        });

        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get Single Order
exports.getSingleOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found with this ID' });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get Logged in User Orders
exports.myOrders = async (req, res) => {
    try {
        // Select deliveryOtp so user can see it when status is Shipped
        const orders = await Order.find({ user: req.user.id }).select('+deliveryOtp');

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Admin: Get All Orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });

        let totalAmount = 0;
        orders.forEach(order => {
            totalAmount += order.totalPrice;
        });

        res.status(200).json({
            success: true,
            totalAmount,
            orders
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Send Cancel OTP (Admin)
exports.sendCancelOtp = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        order.cancelOtp = otp;
        await order.save();

        try {
            const message = `Your OTP to cancel order ${order._id} is: ${otp}.`;
            const html = getOTPTemplate(
                'Cancel Order',
                req.user.name,
                otp,
                `You requested to cancel your order #${order._id}. Use the following OTP to confirm cancellation.`,
                process.env.FRONTEND_URL
            );

            await sendEmail({
                email: req.user.email,
                subject: 'Order Cancellation OTP',
                message,
                html
            });
            res.status(200).json({ success: true, message: `OTP sent to ${req.user.email}` });
        } catch (error) {
            order.cancelOtp = undefined;
            await order.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Admin: Update Order Status / Payment Verification
exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).select('+deliveryOtp +cancelOtp'); // Select OTPs for verification

        if (!order) {
            return res.status(404).json({ message: 'Order not found with this ID' });
        }

        if (order.orderStatus === 'Delivered') {
            return res.status(400).json({ message: 'You have already delivered this order' });
        }

        const { status, deliveryOtp } = req.body;

        if (status) {
            // If marking as Shipped, generate and send OTP
            if (status === 'Shipped' && order.orderStatus !== 'Shipped') {
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                order.deliveryOtp = otp;
                order.orderStatus = status;

                // Send Email
                const user = await ((await order.populate('user', 'email name')).user);
                // Note: user might be null if populated differently or if user deleted, check strictly
                if (user) {
                    const message = `Your order ${order._id} has been shipped.\n\nYour Delivery Confirmation OTP is: ${otp}`;
                    const html = getOTPTemplate(
                        'Order Shipped',
                        user.name,
                        otp,
                        `Your order #${order._id} has been shipped. Please share this OTP with the delivery agent to receive your order.`,
                        process.env.FRONTEND_URL
                    );
                    try {
                        await sendEmail({
                            email: user.email,
                            subject: 'Order Shipped - Delivery OTP',
                            message,
                            html
                        });
                    } catch (err) {
                        console.error("Email send failed", err);
                    }
                }
            }
            // If marking as Delivered, Verify OTP
            else if (status === 'Delivered') {
                if (order.deliveryOtp) {
                    if (deliveryOtp !== order.deliveryOtp) {
                        return res.status(400).json({ message: 'Invalid Delivery OTP' });
                    }
                }
                // If no OTP exists (legacy orders), allow delivery or require reset? 
                // Let's assume strict verification if OTP exists.

                order.orderStatus = status;
                order.deliveredAt = Date.now();

                // Update stock
                async function updateStock(id, quantity) {
                    const product = await Product.findById(id);
                    if (product) {
                        product.stock -= quantity;
                        await product.save({ validateBeforeSave: false });
                    }
                }
                order.orderItems.forEach(async item => {
                    await updateStock(item.product, item.qty);
                });
            }
            // If marking as Cancelled (Admin)
            else if (status === 'Cancelled') {
                if (order.orderStatus === 'Shipped') {
                    if (!req.body.cancelOtp) {
                        return res.status(400).json({ message: 'OTP required to cancel shipped order', requireOtp: true });
                    }
                    if (req.body.cancelOtp !== order.cancelOtp) {
                        return res.status(400).json({ message: 'Invalid Clean OTP' });
                    }
                }
                order.orderStatus = status;
            }
            else {
                order.orderStatus = status;
            }
        }

        // Verify Payment / Update Payment Status
        if (req.body.paymentStatus) {
            order.paymentInfo.status = req.body.paymentStatus;
            if (req.body.paymentStatus === 'Verified') {
                order.paidAt = Date.now();
            }
        }

        await order.save();

        // 3. Hide OTP from response so admin cannot see it (security)
        order.deliveryOtp = undefined;

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Admin: Delete Order
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found with this ID' });
        }

        await order.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Order deleted'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// User/Admin: Cancel Order
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check ownership (simple check, assuming req.user exists)
        // If regular user, must match order.user
        if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
            return res.status(400).json({ message: 'Cannot cancel order that is already shipped or delivered' });
        }

        order.orderStatus = 'Cancelled';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
