const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');
const User = require('./src/models/User');

dotenv.config();

const products = [
    {
        name: 'Quantum Sound Wireless Headphones',
        description: 'Immerse yourself in pure studio-quality sound. Features advanced active noise cancellation and 40-hour battery life.',
        price: 24999,
        stock: 50,
        categoryName: 'Tech & Innovation',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
        discount: 15
    },
    {
        name: 'Midnight Series Smartwatch 5',
        description: 'The ultimate fitness companion with titanium finish and sapphire glass. Tracking your health with precision.',
        price: 35000,
        stock: 30,
        categoryName: 'Tech & Innovation',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
        discount: 10
    },
    {
        name: 'Velvet Noir Evening Gown',
        description: 'A masterpiece of Italian craftsmanship. Hand-stitched velvet fabric with a silk inner lining for maximum comfort.',
        price: 8500,
        stock: 20,
        categoryName: 'Haute Couture',
        imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop',
        discount: 0
    },
    {
        name: 'Artisan Crafted Ceramic Vase',
        description: 'Hand-thrown earth-toned ceramic vase. Perfect for adding a touch of organic elegance to your living space.',
        price: 4200,
        stock: 15,
        categoryName: 'Luxe Living',
        imageUrl: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=1000&auto=format&fit=crop',
        discount: 5
    },
    {
        name: 'Rose Gold Shimmer Palette',
        description: 'Highly pigmented 12-shade eyeshadow palette with a mix of matte and metallic finishes. Cruelty-free.',
        price: 2800,
        stock: 100,
        categoryName: 'Artisan Beauty',
        imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop',
        discount: 20
    }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Find an admin user
        let adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            // If no admin, find the first user and make them admin for seeding purposes
            adminUser = await User.findOne();
            if (adminUser) {
                adminUser.role = 'admin';
                await adminUser.save();
            } else {
                console.error('No users found in database. Please register a user first.');
                process.exit(1);
            }
        }

        for (const item of products) {
            // Find or create category
            let category = await Category.findOne({ name: item.categoryName });
            if (!category) {
                category = await Category.create({
                    name: item.categoryName,
                    description: `${item.categoryName} premium collection.`
                });
                console.log(`Created category: ${item.categoryName}`);
            }

            // Check if product already exists
            const productExists = await Product.findOne({ name: item.name });
            if (!productExists) {
                await Product.create({
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    stock: item.stock,
                    category: category._id,
                    user: adminUser._id,
                    discount: item.discount,
                    images: [
                        {
                            public_id: `seed_${Date.now()}_${Math.random()}`,
                            url: item.imageUrl
                        }
                    ]
                });
                console.log(`Added product: ${item.name}`);
            }
        }

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
