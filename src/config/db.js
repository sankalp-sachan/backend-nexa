const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Check and remove the problematic index
// This is a temporary fix that runs once connected
mongoose.connection.once('open', async () => {
    try {
        const collection = mongoose.connection.collection('products');
        if (collection) {
            const indexes = await collection.indexes();
            if (Array.isArray(indexes)) {
                const idIndex = indexes.find(idx => idx && idx.name === 'id_1');
                if (idIndex) {
                    await collection.dropIndex('id_1');
                    console.log('Dropped problematic index: id_1');
                }
            }
        }
    } catch (err) {
        console.log('Index check failed (non-fatal):', err.message);
    }
});

module.exports = connectDB;
