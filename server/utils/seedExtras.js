require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

/**
 * Additive catalog expansion. Unlike utils/seeder.js this script never deletes
 * anything: products are matched by SKU and coupons by code, so it is safe to
 * run repeatedly on a database that already holds real orders and users.
 *
 * Usage: npm run seed:extras (from /server)
 */

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

const specs = (obj) => Object.entries(obj).map(([key, value]) => ({ key, value }));

const extraProducts = [
  // ---------- Fashion ----------
  {
    name: 'Red Floral Belted Summer Midi Dress',
    description: 'Flowing midi silhouette in a breathable viscose blend with an all-over floral print, flutter sleeves and a removable gold-tone waist belt. Made for garden parties, brunches and holiday evenings.',
    price: 59.99, discountPrice: 34.99, category: 'Fashion', brand: 'ABDULL Studio',
    images: [img('1572804013309-59a88b7e92f1'), img('1595777457583-95e059d581b8')],
    stock: 120, sku: 'ABS-DRS-RFL', rating: 4.6, numReviews: 312, soldCount: 1840,
    colors: ['Scarlet Floral', 'Navy Floral'], sizes: ['XS', 'S', 'M', 'L', 'XL'],
    specifications: specs({ Material: '100% Viscose', Fit: 'Relaxed, belted waist', Care: 'Machine wash cold' }),
    isFeatured: true,
  },
  {
    name: 'White Tiered Ruffle Mini Dress',
    description: 'Airy cotton poplin mini with tiered ruffles, puff sleeves and a smocked back for an easy, flattering fit. A wardrobe staple for warm days.',
    price: 44.99, discountPrice: 29.99, category: 'Fashion', brand: 'ABDULL Studio',
    images: [img('1515372039744-b8f02a3ae446')],
    stock: 85, sku: 'ABS-DRS-WRF', rating: 4.5, numReviews: 188, soldCount: 960,
    colors: ['Optic White', 'Butter Yellow'], sizes: ['XS', 'S', 'M', 'L'],
    specifications: specs({ Material: '100% Cotton Poplin', Length: 'Mini', Lining: 'Fully lined' }),
  },
  {
    name: 'Linen Blend Wrap Maxi Beach Dress',
    description: 'Lightweight linen-blend wrap dress with a thigh-high slit and tie waist. Breathable, packable and perfect over swimwear.',
    price: 69.0, discountPrice: 0, category: 'Fashion', brand: 'Coastline',
    images: [img('1539008835657-9e8e9680c956')],
    stock: 60, sku: 'CST-DRS-LNB', rating: 4.4, numReviews: 74, soldCount: 290,
    colors: ['Powder Blue', 'Sand'], sizes: ['S', 'M', 'L', 'XL'],
    specifications: specs({ Material: '55% Linen, 45% Viscose', Closure: 'Wrap tie', Care: 'Hand wash' }),
  },
  {
    name: 'Classic Genuine Leather Biker Jacket',
    description: 'Timeless asymmetric biker jacket cut from soft lambskin leather with YKK zips, quilted shoulders and a satin lining. Gets better with every wear.',
    price: 289.0, discountPrice: 219.0, category: 'Fashion', brand: 'Northline',
    images: [img('1551028719-00167b16eac5')],
    stock: 28, sku: 'NTL-JKT-LBK', rating: 4.8, numReviews: 143, soldCount: 410,
    colors: ['Jet Black', 'Cognac'], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: specs({ Material: '100% Lambskin Leather', Lining: 'Satin', Hardware: 'YKK zippers' }),
    isFeatured: true,
  },
  {
    name: 'Satin Utility Bomber Jacket',
    description: 'Lightweight satin-finish bomber with ribbed cuffs, a utility sleeve pocket and a water-repellent shell. Layers over anything.',
    price: 89.99, discountPrice: 64.99, category: 'Fashion', brand: 'Northline',
    images: [img('1591047139829-d91aecb6caea')],
    stock: 70, sku: 'NTL-JKT-BMB', rating: 4.5, numReviews: 96, soldCount: 380,
    colors: ['Rust', 'Olive', 'Black'], sizes: ['S', 'M', 'L', 'XL'],
    specifications: specs({ Shell: '100% Polyester satin', Finish: 'Water repellent', Fit: 'Regular' }),
  },
  {
    name: "Levi's 501 Original Fit Men's Jeans",
    description: 'The original straight-leg jean since 1873. Signature button fly, sits at the waist and cut from durable non-stretch denim.',
    price: 79.5, discountPrice: 59.5, category: 'Fashion', brand: "Levi's",
    images: [img('1542272604-787c3835535d')],
    stock: 140, sku: 'LEV-501-ORG', rating: 4.7, numReviews: 520, soldCount: 2310,
    colors: ['Dark Stonewash', 'Black', 'Light Indigo'], sizes: ['30', '32', '34', '36', '38'],
    specifications: specs({ Fit: 'Original straight', Rise: 'Mid rise', Material: '100% Cotton denim' }),
  },
  {
    name: 'Oversized Chunky Knit Crewneck Sweater',
    description: 'Cosy dropped-shoulder sweater in a soft wool-blend chunky knit with ribbed trims. Pairs with everything from denim to slip skirts.',
    price: 54.99, discountPrice: 39.99, category: 'Fashion', brand: 'ABDULL Studio',
    images: [img('1434389677669-e08b4cac3105')],
    stock: 95, sku: 'ABS-SWT-CHK', rating: 4.6, numReviews: 210, soldCount: 1120,
    colors: ['Oat', 'Charcoal', 'Sage'], sizes: ['XS', 'S', 'M', 'L', 'XL'],
    specifications: specs({ Material: '30% Wool, 70% Acrylic', Fit: 'Oversized', Care: 'Hand wash cold' }),
  },
  {
    name: 'Retro Graphic Print Cotton T-Shirt',
    description: 'Boxy-fit heavyweight cotton tee with a vintage-wash graphic print. Pre-shrunk and garment dyed for a broken-in feel.',
    price: 24.99, discountPrice: 14.99, category: 'Fashion', brand: 'ABDULL Studio',
    images: [img('1503342217505-b0a15ec3261c'), img('1576566588028-4147f3842f27')],
    stock: 260, sku: 'ABS-TEE-GRF', rating: 4.4, numReviews: 402, soldCount: 3150,
    colors: ['Washed Black', 'Off White'], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    specifications: specs({ Material: '100% Cotton, 220gsm', Fit: 'Boxy', Print: 'Water-based ink' }),
  },
  {
    name: 'Essential Crew Neck T-Shirt 3-Pack',
    description: 'Three everyday crew-neck tees in soft combed cotton with a clean regular fit. Tag-free neck label for all-day comfort.',
    price: 34.99, discountPrice: 0, category: 'Fashion', brand: 'ABDULL Basics',
    images: [img('1620799140408-edc6dcb6d633')],
    stock: 310, sku: 'ABB-TEE-3PK', rating: 4.7, numReviews: 865, soldCount: 4820,
    colors: ['White', 'Black', 'Heather Grey'], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: specs({ Material: '100% Combed cotton', Pack: '3 tees', Fit: 'Regular' }),
  },
  {
    name: "Slim Fit Stretch Oxford Dress Shirt",
    description: 'Wrinkle-resistant stretch cotton oxford with a spread collar and tailored slim fit. Office-ready, machine washable.',
    price: 49.99, discountPrice: 36.99, category: 'Fashion', brand: 'Northline',
    images: [img('1598033129183-c4f50c736f10')],
    stock: 110, sku: 'NTL-SHT-OXF', rating: 4.5, numReviews: 177, soldCount: 690,
    colors: ['White', 'Sky Blue'], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: specs({ Material: '97% Cotton, 3% Elastane', Collar: 'Spread', Care: 'Non-iron finish' }),
  },
  {
    name: 'Ray-Ban Original Wayfarer Classic Sunglasses',
    description: 'The most recognizable style in sunglasses history. Acetate frame with crystal G-15 lenses offering 100% UV protection.',
    price: 171.0, discountPrice: 145.0, category: 'Fashion', brand: 'Ray-Ban',
    images: [img('1572635196237-14b3f281503f')],
    stock: 54, sku: 'RAY-WAY-2140', rating: 4.8, numReviews: 640, soldCount: 1790,
    colors: ['Black / G-15 Green', 'Tortoise / Brown'], sizes: ['50mm', '54mm'],
    specifications: specs({ Frame: 'Acetate', Lens: 'Crystal G-15', 'UV Protection': '100% UVA/UVB' }),
  },
  {
    name: 'Round Metal Frame Polarized Sunglasses',
    description: 'Lightweight gold-tone metal frame with polarized lenses that cut glare. Adjustable nose pads for a custom fit.',
    price: 39.99, discountPrice: 22.99, category: 'Fashion', brand: 'Coastline',
    images: [img('1511499767150-a48a237f0083')],
    stock: 150, sku: 'CST-SUN-RND', rating: 4.3, numReviews: 230, soldCount: 1270,
    colors: ['Gold / Green', 'Silver / Grey'], sizes: ['One Size'],
    specifications: specs({ Frame: 'Stainless steel', Lens: 'Polarized TAC', 'UV Protection': 'UV400' }),
  },
  {
    name: 'Structured Top Handle Leather Satchel Bag',
    description: 'Polished vegan leather satchel with a structured silhouette, gold turn-lock closure and detachable crossbody strap.',
    price: 119.0, discountPrice: 79.0, category: 'Fashion', brand: 'Maison Rouge',
    images: [img('1584917865442-de89df76afd3'), img('1590874103328-eac38a683ce7')],
    stock: 46, sku: 'MRG-BAG-STH', rating: 4.7, numReviews: 158, soldCount: 520,
    colors: ['Lipstick Red', 'Tangerine', 'Black'], sizes: ['One Size'],
    specifications: specs({ Material: 'Premium vegan leather', Closure: 'Turn-lock', Strap: 'Detachable crossbody' }),
    isFeatured: true,
  },
  {
    name: 'Minimalist Leather Strap Quartz Watch',
    description: 'Clean 40mm stainless steel case with a sapphire-coated crystal, Japanese quartz movement and Italian leather strap.',
    price: 149.0, discountPrice: 99.0, category: 'Fashion', brand: 'Nordgreen',
    images: [img('1524592094714-0f0654e20314'), img('1585123334904-845d60e97b29')],
    stock: 63, sku: 'NRD-WTC-MIN', rating: 4.6, numReviews: 289, soldCount: 870,
    colors: ['Silver / Brown', 'Gold / Black'], sizes: ['36mm', '40mm'],
    specifications: specs({ Movement: 'Japanese quartz', Case: '316L stainless steel', 'Water Resistance': '5 ATM' }),
  },

  // ---------- Footwear ----------
  {
    name: 'Nike Air Max 90 Essential Sneakers',
    description: 'The icon returns with its waffle outsole, stitched overlays and visible Max Air cushioning in the heel for all-day comfort.',
    price: 130.0, discountPrice: 104.0, category: 'Footwear', brand: 'Nike',
    images: [img('1600185365483-26d7a4cc7519')],
    stock: 80, sku: 'NKE-AM90-ESS', rating: 4.7, numReviews: 512, soldCount: 1980,
    colors: ['White / Infrared', 'Triple Black'], sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    specifications: specs({ Upper: 'Leather & textile', Cushioning: 'Max Air unit', Outsole: 'Rubber waffle' }),
  },
  {
    name: 'Pastel Retro Court Platform Sneakers',
    description: 'Chunky platform sole with colour-blocked pastel panels and a padded collar. Adds height without sacrificing comfort.',
    price: 69.99, discountPrice: 44.99, category: 'Footwear', brand: 'ABDULL Studio',
    images: [img('1595950653106-6c9ebd614d3a')],
    stock: 130, sku: 'ABS-SNK-PST', rating: 4.4, numReviews: 266, soldCount: 1430,
    colors: ['Pastel Multi', 'Cloud White'], sizes: ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41'],
    specifications: specs({ Upper: 'Synthetic leather', Sole: '4cm EVA platform', Closure: 'Lace-up' }),
  },
  {
    name: 'Nike Air Zoom SuperRep Training Shoes',
    description: 'Built for HIIT and circuit training with Zoom Air units in the forefoot, a wide stable base and breathable mesh upper.',
    price: 120.0, discountPrice: 84.0, category: 'Footwear', brand: 'Nike',
    images: [img('1606107557195-0e29a4b5b4aa')],
    stock: 58, sku: 'NKE-ZSR-VLT', rating: 4.6, numReviews: 148, soldCount: 460,
    colors: ['Volt / Black', 'White / Grey'], sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
    specifications: specs({ Cushioning: 'Zoom Air', Upper: 'Engineered mesh', Use: 'HIIT / Gym' }),
  },
  {
    name: 'Nike Air Force 1 Wheat Suede Sneakers',
    description: 'A seasonal take on the basketball legend in warm wheat suede with a gum outsole and tonal Swoosh.',
    price: 125.0, discountPrice: 0, category: 'Footwear', brand: 'Nike',
    images: [img('1549298916-b41d501d3772')],
    stock: 44, sku: 'NKE-AF1-WHT', rating: 4.8, numReviews: 233, soldCount: 720,
    colors: ['Wheat / Gum'], sizes: ['US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    specifications: specs({ Upper: 'Premium suede', Outsole: 'Gum rubber', Cushioning: 'Encapsulated Air' }),
  },
  {
    name: 'Handcrafted Leather Lace-Up Ankle Boots',
    description: 'Goodyear-welted full-grain leather boots with a cushioned footbed and lug rubber sole. Built to be resoled for years.',
    price: 219.0, discountPrice: 179.0, category: 'Footwear', brand: 'Northline',
    images: [img('1608256246200-53e635b5b65f')],
    stock: 32, sku: 'NTL-BOT-LCE', rating: 4.9, numReviews: 121, soldCount: 300,
    colors: ['Dark Brown', 'Black'], sizes: ['US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    specifications: specs({ Upper: 'Full-grain leather', Construction: 'Goodyear welt', Sole: 'Lug rubber' }),
  },

  // ---------- Beauty ----------
  {
    name: 'Clinique Pop Lip Colour + Primer Lipstick',
    description: 'Bold, saturated colour and built-in primer in one swipe. Smooths and plumps lips with a comfortable satin finish.',
    price: 26.0, discountPrice: 19.5, category: 'Beauty', brand: 'Clinique',
    images: [img('1586495777744-4413f21062fa')],
    stock: 210, sku: 'CLQ-LIP-POP', rating: 4.6, numReviews: 390, soldCount: 2050,
    colors: ['Cherry Pop', 'Rose Pop', 'Nude Pop'], sizes: ['3.9g'],
    specifications: specs({ Finish: 'Satin', 'Skin Type': 'All', Cruelty: 'Dermatologist tested' }),
  },
  {
    name: 'Gentle Hydrating Foaming Facial Cleanser',
    description: 'Low-pH gel-to-foam cleanser with ceramides and hyaluronic acid. Removes makeup and impurities without stripping the skin barrier.',
    price: 18.0, discountPrice: 0, category: 'Beauty', brand: 'Purely Skin',
    images: [img('1620916566398-39f1143ab7be'), img('1556228578-8c89e6adf883')],
    stock: 340, sku: 'PSK-CLN-HYD', rating: 4.7, numReviews: 712, soldCount: 3900,
    colors: [], sizes: ['150ml', '300ml'],
    specifications: specs({ 'Key Ingredients': 'Ceramides, Hyaluronic Acid', 'Skin Type': 'All, incl. sensitive', Fragrance: 'Free' }),
  },
  {
    name: 'Vitamin C 15% Brightening Face Serum',
    description: 'Stabilised 15% vitamin C with ferulic acid and vitamin E to brighten dull skin, fade dark spots and defend against pollution.',
    price: 34.0, discountPrice: 24.0, category: 'Beauty', brand: 'Purely Skin',
    images: [img('1611930022073-b7a4ba5fcccd'), img('1631729371254-42c2892f0e6e')],
    stock: 190, sku: 'PSK-SRM-VTC', rating: 4.5, numReviews: 455, soldCount: 2280,
    colors: [], sizes: ['30ml'],
    specifications: specs({ Active: '15% L-Ascorbic Acid', Texture: 'Lightweight serum', Use: 'Morning' }),
    isFeatured: true,
  },
  {
    name: 'Complete Skincare Ritual Gift Set',
    description: 'A five-step routine in one box: cleanser, toner, serum, moisturiser and eye cream, plus a reusable cotton pouch.',
    price: 89.0, discountPrice: 62.0, category: 'Beauty', brand: 'Purely Skin',
    images: [img('1612817288484-6f916006741a'), img('1571781926291-c477ebfd024b')],
    stock: 75, sku: 'PSK-SET-RTL', rating: 4.8, numReviews: 168, soldCount: 640,
    colors: [], sizes: ['5-Piece Set'],
    specifications: specs({ Includes: '5 full-size products', 'Skin Type': 'Normal to dry', Packaging: 'Gift-ready box' }),
  },
  {
    name: 'Barrier Repair Rich Moisturising Cream',
    description: 'Fast-absorbing whipped cream with squalane, niacinamide and shea butter for 72-hour hydration and a stronger skin barrier.',
    price: 29.0, discountPrice: 0, category: 'Beauty', brand: 'Purely Skin',
    images: [img('1625772452859-1c03d5bf1137')],
    stock: 220, sku: 'PSK-CRM-BRR', rating: 4.6, numReviews: 301, soldCount: 1510,
    colors: [], sizes: ['50ml', '100ml'],
    specifications: specs({ 'Key Ingredients': 'Squalane, Niacinamide, Shea', Texture: 'Rich cream', Fragrance: 'Free' }),
  },

  // ---------- Phones ----------
  {
    name: 'Apple iPhone 15 Pro Titanium Smartphone',
    description: 'Aerospace-grade titanium design, A17 Pro chip, a customisable Action button and a pro camera system with 5x telephoto zoom.',
    price: 999.0, discountPrice: 949.0, category: 'Phones', brand: 'Apple',
    images: [img('1592750475338-74b7b21085ab'), img('1591337676887-a217a6970a8a')],
    stock: 40, sku: 'APL-IP15P-256', rating: 4.8, numReviews: 980, soldCount: 2600,
    colors: ['Natural Titanium', 'White Titanium', 'Black Titanium'], sizes: ['128GB', '256GB', '512GB'],
    specifications: specs({ Display: '6.1" Super Retina XDR ProMotion', Chip: 'A17 Pro', Camera: '48MP Main + 5x Telephoto', Port: 'USB-C (USB 3)' }),
    isFeatured: true,
  },

  // ---------- Computers ----------
  {
    name: 'Apple MacBook Air 13" M3 Chip Laptop',
    description: 'Strikingly thin and fast with the M3 chip, up to 18 hours of battery life, a Liquid Retina display and a fanless silent design.',
    price: 1099.0, discountPrice: 999.0, category: 'Computers', brand: 'Apple',
    images: [img('1517336714731-489689fd1ca8'), img('1541807084-5c52b6b3adef')],
    stock: 26, sku: 'APL-MBA-M3-13', rating: 4.9, numReviews: 640, soldCount: 1150,
    colors: ['Midnight', 'Starlight', 'Space Gray'], sizes: ['8GB / 256GB', '16GB / 512GB'],
    specifications: specs({ Chip: 'Apple M3 8-core', Display: '13.6" Liquid Retina', Battery: 'Up to 18 hours', Weight: '1.24 kg' }),
    isFeatured: true,
  },
  {
    name: 'Apple iPad Air 11" with Apple Pencil Support',
    description: 'Powerful M2 chip in a thin, light design with an 11-inch Liquid Retina display. Works with Apple Pencil Pro and Magic Keyboard.',
    price: 599.0, discountPrice: 549.0, category: 'Computers', brand: 'Apple',
    images: [img('1544244015-0df4b3ffc6b0'), img('1620912189865-1e8a33da4c5e')],
    stock: 38, sku: 'APL-IPADAIR-11', rating: 4.8, numReviews: 422, soldCount: 870,
    colors: ['Space Gray', 'Blue', 'Purple'], sizes: ['128GB', '256GB'],
    specifications: specs({ Chip: 'Apple M2', Display: '11" Liquid Retina', Connectivity: 'Wi-Fi 6E' }),
  },
  {
    name: '27" 4K UHD IPS USB-C Professional Monitor',
    description: 'Colour-accurate 27-inch 4K IPS panel covering 98% DCI-P3, with 90W USB-C power delivery and an ultra-thin bezel.',
    price: 449.0, discountPrice: 379.0, category: 'Computers', brand: 'LG',
    images: [img('1527443224154-c4a3942d3acf')],
    stock: 30, sku: 'LG-27UP-4K', rating: 4.6, numReviews: 215, soldCount: 480,
    colors: ['Silver'], sizes: ['27"'],
    specifications: specs({ Resolution: '3840 x 2160', Panel: 'IPS, 98% DCI-P3', 'USB-C': '90W Power Delivery' }),
  },
  {
    name: 'Slim Wireless Rechargeable Bluetooth Keyboard',
    description: 'Low-profile scissor-switch keyboard that pairs with up to three devices and lasts a month on a single charge.',
    price: 99.0, discountPrice: 79.0, category: 'Computers', brand: 'Logitech',
    images: [img('1587829741301-dc798b83add3')],
    stock: 90, sku: 'LOG-KBD-SLM', rating: 4.5, numReviews: 340, soldCount: 1320,
    colors: ['Silver / White', 'Graphite'], sizes: ['Compact', 'Full Size'],
    specifications: specs({ Connectivity: 'Bluetooth, 3 devices', Battery: 'Up to 1 month', Switches: 'Scissor' }),
  },

  // ---------- Audio ----------
  {
    name: 'Apple AirPods Pro (2nd Gen) with USB-C Case',
    description: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, personalised Spatial Audio and a MagSafe charging case with speaker.',
    price: 249.0, discountPrice: 189.0, category: 'Audio', brand: 'Apple',
    images: [img('1572569511254-d8f925fe2cbb'), img('1590658268037-6bf12165a8df')],
    stock: 120, sku: 'APL-APP2-USBC', rating: 4.8, numReviews: 1520, soldCount: 5400,
    colors: ['White'], sizes: ['Standard'],
    specifications: specs({ 'Noise Cancellation': 'Active + Adaptive', Battery: '6h (30h with case)', 'Water Resistance': 'IP54' }),
    isFeatured: true,
  },
  {
    name: 'Apple AirPods Max Over-Ear Headphones',
    description: 'High-fidelity audio with computational audio, Active Noise Cancellation and a breathable knit-mesh canopy.',
    price: 549.0, discountPrice: 479.0, category: 'Audio', brand: 'Apple',
    images: [img('1609081219090-a6d81d3085bf')],
    stock: 22, sku: 'APL-APMAX-SLV', rating: 4.7, numReviews: 610, soldCount: 920,
    colors: ['Silver', 'Space Gray', 'Sky Blue'], sizes: ['Standard'],
    specifications: specs({ Driver: '40mm Apple dynamic', Battery: 'Up to 20 hours', Audio: 'Spatial Audio' }),
  },
  {
    name: 'Smart Fabric Home Speaker with Voice Assistant',
    description: 'Room-filling 360° sound in a compact fabric design, with built-in voice assistant, multi-room grouping and smart-home control.',
    price: 99.99, discountPrice: 69.99, category: 'Audio', brand: 'Sonic Home',
    images: [img('1543512214-318c7553f230')],
    stock: 75, sku: 'SNH-SPK-SMT', rating: 4.4, numReviews: 280, soldCount: 1160,
    colors: ['Charcoal', 'Chalk'], sizes: ['Standard'],
    specifications: specs({ Sound: '360° omnidirectional', Connectivity: 'Wi-Fi + Bluetooth 5.0', Assistant: 'Built-in' }),
  },
  {
    name: 'Studio Monitor Wired Over-Ear Headphones',
    description: 'Closed-back studio headphones with 45mm drivers tuned for accurate, flat response. Swivel ear cups and detachable cable.',
    price: 149.0, discountPrice: 119.0, category: 'Audio', brand: 'Audio-Technica',
    images: [img('1583394838336-acd977736f90')],
    stock: 48, sku: 'ATH-M50-STD', rating: 4.8, numReviews: 870, soldCount: 2100,
    colors: ['Black', 'White'], sizes: ['Standard'],
    specifications: specs({ Driver: '45mm large-aperture', Type: 'Closed-back', Cable: 'Detachable (3 included)' }),
  },
  {
    name: 'True Wireless Gaming Earbuds with Charging Case',
    description: 'Low-latency 60ms gaming mode, RGB charging case, environmental noise cancellation on calls and 32 hours total playtime.',
    price: 59.99, discountPrice: 34.99, category: 'Audio', brand: 'Sonic Home',
    images: [img('1606220588913-b3aacb4d2f46')],
    stock: 200, sku: 'SNH-EBD-GMG', rating: 4.3, numReviews: 520, soldCount: 3300,
    colors: ['Black'], sizes: ['Standard'],
    specifications: specs({ Latency: '60ms game mode', Battery: '32h with case', Bluetooth: '5.3' }),
  },

  // ---------- Electronics ----------
  {
    name: 'Canon EOS R50 Mirrorless Camera with 18-45mm Lens',
    description: 'Compact 24.2MP APS-C mirrorless camera with Dual Pixel autofocus, uncropped 4K video and creative assist modes for beginners.',
    price: 799.0, discountPrice: 699.0, category: 'Electronics', brand: 'Canon',
    images: [img('1502920917128-1aa500764cbd'), img('1516035069371-29a1b244cc32')],
    stock: 18, sku: 'CAN-R50-KIT', rating: 4.7, numReviews: 260, soldCount: 410,
    colors: ['Black', 'White'], sizes: ['Body + 18-45mm'],
    specifications: specs({ Sensor: '24.2MP APS-C CMOS', Video: '4K 30p uncropped', Autofocus: 'Dual Pixel CMOS AF II' }),
  },
  {
    name: 'DJI Phantom 4K Camera Drone with Gimbal',
    description: 'Stable 3-axis gimbal camera shooting 4K/60fps, 30-minute flight time, obstacle sensing and intelligent flight modes.',
    price: 1199.0, discountPrice: 1049.0, category: 'Electronics', brand: 'DJI',
    images: [img('1473968512647-3e447244af8f')],
    stock: 12, sku: 'DJI-PHM-4K', rating: 4.7, numReviews: 140, soldCount: 190,
    colors: ['White'], sizes: ['Standard', 'Fly More Combo'],
    specifications: specs({ Camera: '20MP, 4K/60fps', 'Flight Time': '30 minutes', Range: '7 km' }),
  },
  {
    name: 'Samsung Galaxy Watch Classic Smartwatch',
    description: 'Rotating bezel, sapphire crystal glass and advanced health tracking including ECG, sleep coaching and body composition.',
    price: 399.0, discountPrice: 299.0, category: 'Electronics', brand: 'Samsung',
    images: [img('1523275335684-37898b6baf30')],
    stock: 55, sku: 'SAM-GWC-47', rating: 4.6, numReviews: 330, soldCount: 780,
    colors: ['Silver', 'Black'], sizes: ['43mm', '47mm'],
    specifications: specs({ Display: 'Super AMOLED, sapphire glass', Health: 'ECG, BIA, SpO2', Battery: 'Up to 40 hours' }),
  },
  {
    name: 'Fitness Tracker Smartwatch with AMOLED Display',
    description: 'Lightweight fitness watch with 120+ sport modes, built-in GPS, heart-rate and SpO2 tracking and 14-day battery life.',
    price: 79.99, discountPrice: 49.99, category: 'Electronics', brand: 'Amazfit',
    images: [img('1617043786394-f977fa12eddf')],
    stock: 180, sku: 'AMZ-FIT-AMD', rating: 4.4, numReviews: 910, soldCount: 4100,
    colors: ['Midnight Black', 'Rose Pink'], sizes: ['Standard'],
    specifications: specs({ Display: '1.75" AMOLED', GPS: 'Built-in dual-band', Battery: 'Up to 14 days' }),
  },

  // ---------- Gaming ----------
  {
    name: 'Sony DualShock 4 Wireless Controller',
    description: 'Precision control with a built-in touch pad, motion sensors, light bar and stereo headset jack for PS4 and PC.',
    price: 64.99, discountPrice: 49.99, category: 'Gaming', brand: 'Sony',
    images: [img('1592840496694-26d035b52b48')],
    stock: 95, sku: 'SNY-DS4-BLK', rating: 4.7, numReviews: 2100, soldCount: 6200,
    colors: ['Jet Black', 'Glacier White'], sizes: ['Standard'],
    specifications: specs({ Compatibility: 'PS4, PC, Mobile', Connectivity: 'Bluetooth / Micro-USB', Features: 'Touch pad, Light bar' }),
  },
  {
    name: 'Xbox Wireless Controller – Robot White',
    description: 'Modernised design with a textured grip, hybrid D-pad, Share button and Bluetooth for Xbox, PC and mobile.',
    price: 59.99, discountPrice: 0, category: 'Gaming', brand: 'Microsoft',
    images: [img('1600080972464-8e5f35f63d08')],
    stock: 110, sku: 'MSX-CTL-WHT', rating: 4.8, numReviews: 1750, soldCount: 5100,
    colors: ['Robot White', 'Carbon Black'], sizes: ['Standard'],
    specifications: specs({ Compatibility: 'Xbox Series X|S, One, PC', Connectivity: 'Xbox Wireless + Bluetooth', Port: 'USB-C' }),
  },
  {
    name: 'Nintendo Switch OLED Model Console',
    description: 'Vivid 7-inch OLED screen, wide adjustable stand, enhanced audio and 64GB storage. Play at home or on the go.',
    price: 349.99, discountPrice: 319.99, category: 'Gaming', brand: 'Nintendo',
    images: [img('1578303512597-81e6cc155b3e')],
    stock: 34, sku: 'NIN-SW-OLED', rating: 4.9, numReviews: 2800, soldCount: 3900,
    colors: ['Neon Red / Blue', 'White'], sizes: ['64GB'],
    specifications: specs({ Screen: '7" OLED', Storage: '64GB', Modes: 'TV, Tabletop, Handheld' }),
    isFeatured: true,
  },
  {
    name: 'Meta Quest 3 Mixed Reality VR Headset',
    description: 'Breakthrough mixed reality with full-colour passthrough, 4K+ Infinite Display, Snapdragon XR2 Gen 2 and Touch Plus controllers.',
    price: 499.0, discountPrice: 449.0, category: 'Gaming', brand: 'Meta',
    images: [img('1622979135225-d2ba269cf1ac')],
    stock: 27, sku: 'MTA-QST3-128', rating: 4.7, numReviews: 690, soldCount: 1040,
    colors: ['White'], sizes: ['128GB', '512GB'],
    specifications: specs({ Display: '2064 x 2208 per eye', Chip: 'Snapdragon XR2 Gen 2', Tracking: 'Inside-out, hand tracking' }),
  },
];

const coupons = [
  {
    code: 'ABDULL15',
    description: '15% off your first order (up to $50) — newsletter welcome gift',
    discountType: 'percent', value: 15, maxDiscount: 50, minOrder: 0, firstOrderOnly: true,
  },
  {
    code: 'WELCOME10',
    description: '10% off orders over $50',
    discountType: 'percent', value: 10, maxDiscount: 0, minOrder: 50,
  },
  {
    code: 'SAVE20',
    description: '$20 off orders over $150',
    discountType: 'fixed', value: 20, minOrder: 150,
  },
  {
    code: 'FREESHIP',
    description: 'Free standard shipping on any order',
    discountType: 'shipping', value: 0, minOrder: 0,
  },
  {
    code: 'FLASH30',
    description: '30% off orders over $300 (max $100) — limited time',
    discountType: 'percent', value: 30, maxDiscount: 100, minOrder: 300,
    usageLimit: 500,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
];

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[SeedExtras]: Connected to MongoDB');

    const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
    const categories = await Category.find({});
    if (categories.length === 0) {
      console.error('❌ No categories found. Run "npm run seed" first to create the base catalog.');
      process.exit(1);
    }

    const catId = (name) => {
      const match = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
      if (!match) throw new Error(`Category "${name}" not found`);
      return match._id;
    };

    // Fix the base-catalog fragrance whose photo shows a different brand's bottle
    const fragrance = await Product.findOne({ sku: 'DIR-SVG-100ML' });
    if (fragrance && fragrance.brand === 'Dior') {
      fragrance.name = 'Chanel Bleu de Chanel Eau de Parfum';
      fragrance.brand = 'Chanel';
      fragrance.description =
        'A woody aromatic fragrance for men. Fresh citrus notes open onto a heart of grapefruit and incense before settling into a deep, sensual base of cedar and sandalwood.';
      fragrance.images = [fragrance.images[0]];
      fragrance.colors = ['Deep Blue Glass'];
      fragrance.specifications = specs({ 'Fragrance Family': 'Woody Aromatic', 'Key Notes': 'Grapefruit, Incense, Cedar', Concentration: 'Eau de Parfum' });
      await fragrance.save();
      console.log('[SeedExtras]: Corrected fragrance listing to match its product photo');
    }

    let added = 0;
    let skipped = 0;
    for (const p of extraProducts) {
      const exists = await Product.exists({ sku: p.sku });
      if (exists) {
        skipped += 1;
        continue;
      }
      await Product.create({ ...p, category: catId(p.category), createdBy: admin ? admin._id : undefined });
      added += 1;
    }
    console.log(`[SeedExtras]: Products added: ${added}, already present: ${skipped}`);

    let couponsAdded = 0;
    for (const c of coupons) {
      const result = await Coupon.updateOne({ code: c.code }, { $setOnInsert: c }, { upsert: true });
      if (result.upsertedCount) couponsAdded += 1;
    }
    console.log(`[SeedExtras]: Coupons added: ${couponsAdded}, already present: ${coupons.length - couponsAdded}`);

    console.log('✅ Catalog expansion complete');
    process.exit(0);
  } catch (error) {
    console.error(`❌ [SeedExtras Error]: ${error.message}`);
    process.exit(1);
  }
};

run();
