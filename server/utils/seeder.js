require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');

const categoriesData = [
  {
    name: 'Electronics',
    description: 'Cutting edge electronics, smart devices, and high-performance audio',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80',
    icon: 'cpu',
  },
  {
    name: 'Phones',
    description: 'Flagship smartphones, high-speed 5G devices, and mobile gear',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    icon: 'smartphone',
  },
  {
    name: 'Computers',
    description: 'Workstations, ultrabooks, keyboards, and productivity machines',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
    icon: 'laptop',
  },
  {
    name: 'Audio',
    description: 'Noise cancelling headphones, studio monitors, and portable speakers',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
    icon: 'headphones',
  },
  {
    name: 'Fashion',
    description: 'Contemporary streetwear, luxury leather goods, and premium basics',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80',
    icon: 'shirt',
  },
  {
    name: 'Footwear',
    description: 'Performance runners, designer sneakers, and athletic footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    icon: 'footprints',
  },
  {
    name: 'Gaming',
    description: 'Next-gen consoles, lightweight esports mice, and gaming gear',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80',
    icon: 'gamepad-2',
  },
  {
    name: 'Beauty',
    description: 'Designer fragrances, personal skincare, and luxury cosmetics',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    icon: 'sparkles',
  },
];

const seedDatabase = async () => {
  try {
    console.log('[Seeder]: Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seeder]: Connected to MongoDB successfully.');

    // Clear existing data
    console.log('[Seeder]: Clearing old collections...');
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();

    // 1. Create Admin & Demo Customer
    console.log('[Seeder]: Creating Admin and Customer accounts...');
    const adminUser = await User.create({
      name: 'Abdull Admin',
      email: 'admin@abdull.com',
      // Real passwords belong in server/.env (never committed); the defaults are the public demo ones from the README
      password: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
      phone: '+1 (555) 019-2831',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      country: 'United States',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    });

    const demoCustomer = await User.create({
      name: 'John Doe',
      email: 'customer@abdull.com',
      password: process.env.SEED_CUSTOMER_PASSWORD || 'Customer123!',
      phone: '+1 (555) 392-8172',
      address: '124 Conch Street',
      city: 'Bikini Bottom',
      country: 'United States',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    });

    // 2. Insert Categories
    console.log('[Seeder]: Inserting categories...');
    const createdCategories = await Category.insertMany(
      categoriesData.map((cat) => ({ ...cat, createdBy: adminUser._id }))
    );

    const getCatId = (name) => {
      const match = createdCategories.find((c) => c.name.toLowerCase() === name.toLowerCase());
      return match ? match._id : createdCategories[0]._id;
    };

    // 3. Insert 16 High-Quality Products
    console.log('[Seeder]: Inserting realistic sample catalog products...');
    const sampleProducts = [
      {
        name: 'Samsung Galaxy S24 Ultra Flagship Phone',
        description: 'Titanium chassis with built-in S Pen, Snapdragon 8 Gen 3 processor, 200MP quad-telephoto camera system, and all-day 5000mAh battery with AI photo editing assistance.',
        price: 1299.99,
        discountPrice: 1149.99,
        category: getCatId('Phones'),
        brand: 'Samsung',
        images: [
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 24,
        sku: 'SAM-S24U-512',
        rating: 4.9,
        numReviews: 86,
        soldCount: 142,
        colors: ['Titanium Gray', 'Titanium Black', 'Titanium Violet'],
        sizes: ['256GB', '512GB', '1TB'],
        specifications: [
          { key: 'Display', value: '6.8" Dynamic AMOLED 2X 120Hz' },
          { key: 'Processor', value: 'Snapdragon 8 Gen 3 for Galaxy' },
          { key: 'Battery', value: '5000 mAh' },
          { key: 'RAM', value: '12 GB' },
        ],
        isFeatured: true,
        createdBy: adminUser._id,
      },
      {
        name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        description: 'Industry-leading noise cancellation powered by two processors and eight microphones. Ultra-comfortable lightweight design with 30-hour battery life and speak-to-chat automation.',
        price: 399.99,
        discountPrice: 348.0,
        category: getCatId('Audio'),
        brand: 'Sony',
        images: [
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 35,
        sku: 'SNY-WHXM5-SLV',
        rating: 4.8,
        numReviews: 124,
        soldCount: 310,
        colors: ['Silver', 'Midnight Black', 'Smoke Blue'],
        sizes: ['Standard'],
        specifications: [
          { key: 'Battery Life', value: 'Up to 30 hours' },
          { key: 'Noise Cancellation', value: 'Dual Processor V1 + QN1' },
          { key: 'Connectivity', value: 'Bluetooth 5.2 / 3.5mm Aux' },
        ],
        isFeatured: true,
        createdBy: adminUser._id,
      },
      {
        name: 'Apple Watch Ultra 2 Rugged Titanium Smart Watch',
        description: 'Engineered for endurance and exploration. Corrosion-resistant 49mm titanium case, precision dual-frequency GPS, up to 36 hours of regular battery life, and 3000-nit display.',
        price: 799.0,
        discountPrice: 749.0,
        category: getCatId('Electronics'),
        brand: 'Apple',
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 18,
        sku: 'APL-WULTRA2-TI',
        rating: 4.9,
        numReviews: 92,
        soldCount: 89,
        colors: ['Natural Titanium'],
        sizes: ['49mm'],
        specifications: [
          { key: 'Case Material', value: 'Aerospace-Grade Titanium' },
          { key: 'Water Resistance', value: '100m water-resistant' },
          { key: 'Brightness', value: '3,000 nits' },
        ],
        isFeatured: true,
        createdBy: adminUser._id,
      },
      {
        name: 'Dell XPS 15 4K OLED InfinityEdge Laptop',
        description: 'Performance workstation featuring 13th Gen Intel Core i7, NVIDIA GeForce RTX 4060 graphics, 32GB DDR5 RAM, and a breathtaking 3.5K OLED touch display with 100% DCI-P3.',
        price: 1899.99,
        discountPrice: 1699.99,
        category: getCatId('Computers'),
        brand: 'Dell',
        images: [
          'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 12,
        sku: 'DEL-XPS15-OLED',
        rating: 4.7,
        numReviews: 44,
        soldCount: 65,
        colors: ['Platinum Silver'],
        sizes: ['1TB SSD / 32GB RAM'],
        specifications: [
          { key: 'Screen', value: '15.6" 3.5K (3456x2160) OLED Touch' },
          { key: 'GPU', value: 'NVIDIA GeForce RTX 4060 8GB' },
          { key: 'Weight', value: '1.92 kg' },
        ],
        isFeatured: true,
        createdBy: adminUser._id,
      },
      {
        name: "Nike Air Max Pulse Men's Athletic Sneakers",
        description: 'Drawing inspiration from the London music scene, the Air Max Pulse brings a tough, energetic edge to the iconic Air Max line with point-loaded Air cushioning.',
        price: 159.99,
        discountPrice: 129.99,
        category: getCatId('Footwear'),
        brand: 'Nike',
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 50,
        sku: 'NKE-AMP-RED',
        rating: 4.6,
        numReviews: 110,
        soldCount: 420,
        colors: ['Crimson Red', 'Phantom White', 'Triple Black'],
        sizes: ['US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
        specifications: [
          { key: 'Upper Material', value: 'Breathable Mesh and Synthetic Leather' },
          { key: 'Cushioning', value: 'Point-Loaded Air Unit' },
        ],
        isFeatured: false,
        createdBy: adminUser._id,
      },
      {
        name: "Luxury Classic Quilted Women's Handbag",
        description: 'Artisanal grained calfskin leather with signature gold-tone hardware, chain strap, and double-flap closure. An enduring staple of haute couture elegance.',
        price: 890.0,
        discountPrice: 750.0,
        category: getCatId('Fashion'),
        brand: 'ABDULL Atelier',
        images: [
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 8,
        sku: 'ABD-BAG-GLD',
        rating: 4.9,
        numReviews: 28,
        soldCount: 37,
        colors: ['Noir Black', 'Burgundy', 'Ivory Cream'],
        sizes: ['Medium', 'Large'],
        specifications: [
          { key: 'Material', value: '100% Genuine Italian Calfskin' },
          { key: 'Hardware', value: '24K Gold-Plated Brass' },
        ],
        isFeatured: true,
        createdBy: adminUser._id,
      },
      {
        name: 'Heavyweight Relaxed Fit Organic Cotton T-Shirt',
        description: 'Crafted from 280 GSM combed organic cotton. Features drop shoulders, a thick ribbed collar that never sags, and pre-shrunk heavyweight drape.',
        price: 48.0,
        discountPrice: 36.0,
        category: getCatId('Fashion'),
        brand: 'ABDULL Studio',
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 120,
        sku: 'ABD-TSHIRT-BLK',
        rating: 4.7,
        numReviews: 185,
        soldCount: 560,
        colors: ['Washed Black', 'Vintage White', 'Sage Green', 'Clay'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        specifications: [
          { key: 'Material', value: '100% GOTS Certified Organic Cotton' },
          { key: 'Weight', value: '280 GSM' },
        ],
        isFeatured: false,
        createdBy: adminUser._id,
      },
      {
        name: 'Logitech G Pro X Superlight 2 Wireless Gaming Mouse',
        description: 'The pinnacle of esports gear weighing only 60 grams. Hero 2 sensor with 32,000 DPI, zero smoothing, LIGHTFORCE hybrid optical-mechanical switches, and 95-hour battery life.',
        price: 159.99,
        discountPrice: 0,
        category: getCatId('Gaming'),
        brand: 'Logitech',
        images: [
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 45,
        sku: 'LOG-GPX2-WHT',
        rating: 4.8,
        numReviews: 95,
        soldCount: 280,
        colors: ['Matte White', 'Carbon Black', 'Magenta'],
        sizes: ['Standard'],
        specifications: [
          { key: 'Weight', value: '60 grams' },
          { key: 'Sensor', value: 'HERO 2 32K DPI' },
          { key: 'Polling Rate', value: 'Up to 2,000 Hz' },
        ],
        isFeatured: false,
        createdBy: adminUser._id,
      },
      {
        name: 'Keychron Q1 Pro Custom Wireless Mechanical Keyboard',
        description: 'Full CNC machined 6063 aluminum body with double-gasket design, hot-swappable Keychron K Pro Banana tactile switches, South-facing RGB, and QMK/VIA programmable layers.',
        price: 219.0,
        discountPrice: 195.0,
        category: getCatId('Computers'),
        brand: 'Keychron',
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 22,
        sku: 'KCH-Q1PRO-ALU',
        rating: 4.9,
        numReviews: 67,
        soldCount: 140,
        colors: ['Carbon Black', 'Silver Grey', 'Shell White'],
        sizes: ['75% Layout'],
        specifications: [
          { key: 'Body', value: 'Full CNC Aluminum' },
          { key: 'Switches', value: 'Pre-lubed K Pro Banana Tactile' },
          { key: 'Keycaps', value: 'Double-Shot KSA PBT' },
        ],
        isFeatured: false,
        createdBy: adminUser._id,
      },
      {
        name: 'JBL Charge 5 Waterproof Bluetooth Portable Speaker',
        description: 'Take the party anywhere with bold JBL Original Pro Sound. Features an optimized long-excursion driver, separate tweeter, dual bass radiators, and built-in powerbank.',
        price: 179.95,
        discountPrice: 139.95,
        category: getCatId('Audio'),
        brand: 'JBL',
        images: [
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 40,
        sku: 'JBL-CHG5-CAMO',
        rating: 4.7,
        numReviews: 148,
        soldCount: 512,
        colors: ['Squad Camo', 'Ocean Teal', 'Midnight Black'],
        sizes: ['Standard'],
        specifications: [
          { key: 'Waterproof', value: 'IP67 Waterproof and Dustproof' },
          { key: 'Battery Playtime', value: '20 Hours' },
          { key: 'Powerbank Output', value: 'USB-A 5V/2A' },
        ],
        isFeatured: false,
        createdBy: adminUser._id,
      },
      {
        name: 'Nomatic All-Weather Modular Travel Backpack 30L',
        description: 'Designed for everyday carry and 3-day travel. Waterproof tarpaulin materials, magnetic water bottle pockets, TSA-ready laptop compartment, and RFID blocking storage.',
        price: 279.99,
        discountPrice: 249.99,
        category: getCatId('Fashion'),
        brand: 'Nomatic',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 19,
        sku: 'NOM-TRV30L-BLK',
        rating: 4.8,
        numReviews: 53,
        soldCount: 95,
        colors: ['Matte Black', 'Slate Olive'],
        sizes: ['30 Liters'],
        specifications: [
          { key: 'Capacity', value: '20L expands to 30L' },
          { key: 'Laptop Compartment', value: 'Fits up to 16" MacBook Pro' },
          { key: 'Zippers', value: 'YKK Water Resistant' },
        ],
        isFeatured: false,
        createdBy: adminUser._id,
      },
      {
        name: 'Chanel Bleu de Chanel Eau de Parfum',
        description: 'A woody aromatic fragrance for men. Fresh citrus notes open onto a heart of grapefruit and incense before settling into a deep, sensual base of cedar and sandalwood.',
        price: 165.0,
        discountPrice: 0,
        category: getCatId('Beauty'),
        brand: 'Chanel',
        images: [
          'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 32,
        sku: 'DIR-SVG-100ML',
        rating: 4.9,
        numReviews: 210,
        soldCount: 640,
        colors: ['Deep Blue Glass'],
        sizes: ['60ml', '100ml', '200ml'],
        specifications: [
          { key: 'Fragrance Family', value: 'Woody Aromatic' },
          { key: 'Key Notes', value: 'Grapefruit, Incense, Cedar' },
          { key: 'Concentration', value: 'Eau de Parfum' },
        ],
        isFeatured: true,
        createdBy: adminUser._id,
      },
      {
        name: 'Adidas Ultraboost Light Running Shoes',
        description: 'Experience epic energy return with our lightest Boost foam ever. Primeknit+ upper hugs the foot, Continental Natural Rubber outsole gives superior wet and dry grip.',
        price: 189.99,
        discountPrice: 149.99,
        category: getCatId('Footwear'),
        brand: 'Adidas',
        images: [
          'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 42,
        sku: 'ADS-UBLT-CORE',
        rating: 4.6,
        numReviews: 78,
        soldCount: 230,
        colors: ['Core Black', 'Cloud White', 'Solar Red'],
        sizes: ['US 8.5', 'US 9.5', 'US 10.5', 'US 11.5'],
        specifications: [
          { key: 'Weight', value: '299g (Size 9)' },
          { key: 'Midsole Drop', value: '10 mm' },
          { key: 'Cushioning', value: 'Light BOOST 30% lighter' },
        ],
        isFeatured: false,
        createdBy: adminUser._id,
      },
      {
        name: 'LG C3 65-Inch 4K OLED evo Smart TV',
        description: 'Self-lit OLED pixels with 100% color volume. a9 AI Processor Gen6, Dolby Vision / Dolby Atmos, ultra-fast 0.1ms response time, 4x HDMI 2.1 ports, and NVIDIA G-SYNC support.',
        price: 1699.99,
        discountPrice: 1496.0,
        category: getCatId('Electronics'),
        brand: 'LG',
        images: [
          'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 9,
        sku: 'LG-C3-65OLED',
        rating: 4.9,
        numReviews: 58,
        soldCount: 45,
        colors: ['Titan Grey Finish'],
        sizes: ['55-inch', '65-inch', '77-inch'],
        specifications: [
          { key: 'Resolution', value: '4K Ultra HD (3,840 x 2,160)' },
          { key: 'Refresh Rate', value: '120Hz Native' },
          { key: 'Gaming', value: 'G-SYNC, FreeSync, VRR, ALLM' },
        ],
        isFeatured: true,
        createdBy: adminUser._id,
      },
      {
        name: 'Anker Prime 65W GaN Dual USB-C Ultra-Fast Charger',
        description: 'Power 3 devices at once in a body 53% smaller than original 67W chargers. ActiveShield 2.0 temperature monitoring and PowerIQ 4.0 dynamic power distribution.',
        price: 59.99,
        discountPrice: 49.99,
        category: getCatId('Electronics'),
        brand: 'Anker',
        images: [
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 65,
        sku: 'ANK-PRM-65W',
        rating: 4.8,
        numReviews: 135,
        soldCount: 680,
        colors: ['Space Grey', 'Anker Gold'],
        sizes: ['65W'],
        specifications: [
          { key: 'Total Wattage', value: '65W' },
          { key: 'Ports', value: '2x USB-C, 1x USB-A' },
          { key: 'Technology', value: 'GaNPrime' },
        ],
        isFeatured: false,
        createdBy: adminUser._id,
      },
      {
        name: 'Sony PlayStation 5 Slim Gaming Console',
        description: 'Play Has No Limits. Experience lightning-fast loading with an ultra-high speed 1TB SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.',
        price: 499.99,
        discountPrice: 0,
        category: getCatId('Gaming'),
        brand: 'Sony',
        images: [
          'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 14,
        sku: 'SNY-PS5-SLIM1T',
        rating: 4.9,
        numReviews: 310,
        soldCount: 890,
        colors: ['Glacier White'],
        sizes: ['1TB SSD'],
        specifications: [
          { key: 'Storage', value: '1TB Custom NVMe SSD' },
          { key: 'Ray Tracing', value: 'Hardware-Accelerated' },
          { key: 'Output', value: '4K 120Hz / 8K Support' },
        ],
        isFeatured: true,
        createdBy: adminUser._id,
      },
    ];

    const createdProducts = await Product.insertMany(sampleProducts);

    // 4. Create Sample Orders for Analytics
    console.log('[Seeder]: Creating sample completed orders for live analytics...');
    await Order.create({
      user: demoCustomer._id,
      orderItems: [
        {
          product: createdProducts[1]._id,
          name: createdProducts[1].name,
          image: createdProducts[1].images[0],
          price: createdProducts[1].discountPrice,
          quantity: 1,
          color: 'Midnight Black',
          size: 'Standard',
        },
      ],
      shippingAddress: {
        fullName: demoCustomer.name,
        phone: demoCustomer.phone,
        email: demoCustomer.email,
        country: 'United States',
        city: demoCustomer.city,
        address: demoCustomer.address,
        notes: 'Please leave package at the front porch.',
      },
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      subtotal: 348.0,
      shippingPrice: 0,
      discount: 0,
      totalPrice: 348.0,
      deliveredAt: new Date(),
    });

    await Order.create({
      user: demoCustomer._id,
      orderItems: [
        {
          product: createdProducts[0]._id,
          name: createdProducts[0].name,
          image: createdProducts[0].images[0],
          price: createdProducts[0].discountPrice,
          quantity: 1,
          color: 'Titanium Gray',
          size: '512GB',
        },
      ],
      shippingAddress: {
        fullName: demoCustomer.name,
        phone: demoCustomer.phone,
        email: demoCustomer.email,
        country: 'United States',
        city: demoCustomer.city,
        address: demoCustomer.address,
        notes: 'Call before delivery.',
      },
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      orderStatus: 'Confirmed',
      subtotal: 1149.99,
      shippingPrice: 0,
      discount: 0,
      totalPrice: 1149.99,
    });

    // 5. Create Sample Review
    console.log('[Seeder]: Creating verified sample customer reviews...');
    await Review.create({
      product: createdProducts[1]._id,
      user: demoCustomer._id,
      rating: 5,
      comment: 'The noise cancellation is astonishing! Blocks out subway rumbling completely and the battery lasts several days.',
    });

    console.log('----------------------------------------------------');
    console.log('✅ ABDULL E-COMMERCE SEED DATA GENERATED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log('Admin Account:');
    console.log('  Email:    admin@abdull.com');
    console.log('  Password: Admin123!');
    console.log('Customer Account:');
    console.log('  Email:    customer@abdull.com');
    console.log('  Password: Customer123!');
    console.log(`Categories Created: ${createdCategories.length}`);
    console.log(`Products Created:   ${createdProducts.length}`);
    console.log('Database Name:      abdull_ecommerce');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

seedDatabase();
