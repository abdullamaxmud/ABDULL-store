# ABDULL E-Commerce Platform

> **"Discover More. Shop Smarter."**  
> A production-grade, full-stack **MERN** (MongoDB, Express.js, React.js, Node.js) e-commerce marketplace featuring modern design, dark/light theme switching, animated authentication, atomic inventory management, order fulfillment tracking, verified customer reviews, and a dedicated admin portal.

---

## 📑 Table of Contents
1. [Platform Overview](#platform-overview)
2. [Key Architecture & Features](#key-architecture--features)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Prerequisites & MongoDB Compass Setup](#prerequisites--mongodb-compass-setup)
6. [Installation & Quick Start](#installation--quick-start)
7. [Environment Variables](#environment-variables)
8. [Database Seeding & Default Credentials](#database-seeding--default-credentials)
9. [REST API Documentation](#rest-api-documentation)
10. [Database Schema Models](#database-schema-models)
11. [Troubleshooting Guide](#troubleshooting-guide)

---

## 1. Platform Overview
**ABDULL** is built with an original, high-performance visual identity inspired by premier e-commerce platforms. It provides:
- **For Customers**: Seamless catalog discovery, live search, faceted multi-criteria filtering, instant shopping bag, wishlist, multi-step checkout with Cash on Delivery (COD), order tracking with status timeline, and verified review submissions.
- **For Administrators**: Gated management console with real-time revenue analytics, complete CRUD product catalog management, multiple image URL previews, low-stock warnings, order fulfillment updates, customer management, and review moderation.

---

## 2. Key Architecture & Features

* **Original Design System**: Fluid typography, CSS custom properties, glassmorphism headers, responsive cards, skeleton shimmer loaders, and smooth transitions.
* **Dark & Light Mode**: Instant one-click toggle with local preference persistence.
* **Authentication & Security**:
  * Passwords salted and hashed with `bcryptjs`.
  * Stateless authentication using signed `jsonwebtoken` (JWT) passed via HTTP `Authorization: Bearer <token>` headers.
  * Role-Based Access Control (`protect` and `adminOnly` middlewares).
  * Centralized Axios request/response interceptors.
* **Atomic Inventory Management**:
  * Real-time stock boundaries preventing over-ordering.
  * MongoDB atomic decrements (`$inc: { stock: -qty, soldCount: +qty }`) upon order confirmation.
  * Automatic inventory restoration upon order cancellation.
* **Pluggable Payment Architecture**:
  * Operational Cash on Delivery (COD) out-of-the-box.
  * Backend payment interface structured for modular Stripe/PayPal integration without core refactoring.

---

## 3. Technology Stack

### Frontend
- **React.js 18** (SPA)
- **Vite 5** (High-speed build tool and dev server)
- **React Router v6** (Client-side routing with nested & protected routes)
- **Axios** (Centralized API client with interceptors)
- **Context API** (State management for Auth, Cart, Wishlist, Theme, and Toasts)
- **Modern CSS3** (Custom properties, grid, flexbox, keyframe animations)

### Backend
- **Node.js** (Runtime environment)
- **Express.js** (Modular REST API framework)
- **Mongoose 8** (MongoDB Object Data Modeling)
- **bcryptjs** (Password hashing)
- **jsonwebtoken** (JWT token signing & verification)
- **cors & dotenv** (Security & environment variable handling)

### Database
- **MongoDB** (`mongodb://127.0.0.1:27017/abdull_ecommerce`)
- **MongoDB Compass** (Database inspection & GUI management)

---

## 4. Folder Structure

```text
E-commerce project/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/         # Badge, Modal, RatingStars, Skeleton, EmptyState
│   │   │   ├── layout/         # Header, Footer, MobileNav
│   │   │   └── product/        # ProductCard
│   │   ├── context/            # AuthContext, CartContext, WishlistContext, ThemeContext, ToastContext
│   │   ├── layouts/            # MainLayout, AdminLayout
│   │   ├── pages/              # Home, Shop, ProductDetails, Cart, Wishlist, Checkout, Orders, Profile, Auth
│   │   │   └── admin/          # Dashboard, Products, ProductForm, Categories, Orders, Inventory, Users, Analytics
│   │   ├── routes/             # AppRoutes, ProtectedRoute, AdminRoute
│   │   ├── services/           # api.js, authService, productService, orderService, adminService, etc.
│   │   ├── styles/             # index.css (tokens, variables, theme classes, animations)
│   │   ├── utils/              # formatCurrency, formatDate
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── config/                 # db.js (Mongoose connection)
│   ├── controllers/            # authController, productController, orderController, adminController, etc.
│   ├── middleware/             # authMiddleware, errorMiddleware
│   ├── models/                 # User, Product, Category, Cart, Wishlist, Order, Review
│   ├── routes/                 # Express route handlers
│   ├── utils/                  # generateToken.js, seeder.js
│   ├── .env                    # Environment variables
│   ├── server.js               # Application server bootstrap
│   └── package.json
│
├── README.md
└── package.json                # Root management scripts
```

---

## 5. Prerequisites & MongoDB Compass Setup

1. **MongoDB Server**:
   Ensure MongoDB service is installed and running locally on port `27017`.
2. **MongoDB Compass**:
   - Open **MongoDB Compass**.
   - Paste the connection string:
     ```text
     mongodb://127.0.0.1:27017
     ```
   - Click **Connect**.
   - In the database list, locate:
     ```text
     abdull_ecommerce
     ```
   - The collections visible inside `abdull_ecommerce` are:
     * `users` — Admin and customer accounts.
     * `products` — Complete catalog with stock, SKU, and specifications.
     * `categories` — Product category taxonomies and slugs.
     * `orders` — Customer orders, snapshots, and fulfillment states.
     * `reviews` — Verified customer reviews and ratings.
     * `carts` — User shopping carts.
     * `wishlists` — Saved items.

---

## 6. Installation & Quick Start

### 1. Install Dependencies
From the project root:
```bash
npm run install:all
```
*(Or navigate into `server` and `client` individually and run `npm install`)*

### 2. Seed the Database
Populates the database with the administrator account, demo customer, categories, 16 sample products, orders, and reviews:
```bash
npm run seed
```

### 3. Launch Development Servers

**Run Server (Port 5000):**
```bash
npm run server
```

**Run Client (Port 5173):**
```bash
npm run client
```

* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:5000`
* API Health Check: `http://localhost:5000/api/health`

---

## 7. Environment Variables (`server/.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/abdull_ecommerce
JWT_SECRET=abdull_ultra_secure_jwt_secret_key_2026_dev_mode
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

---

## 8. Database Seeding & Default Credentials

> **Notice:** The seed credentials below are intended for local development and demonstration. Change administrator passwords prior to production deployment.

### 👤 Administrator Account
* **Email:** `admin@abdull.com`
* **Password:** `Admin123!`
* **Role:** `admin` (Has full access to `/admin` dashboard, catalog CRUD, orders, and inventory)

### 👤 Demo Customer Account
* **Email:** `customer@abdull.com`
* **Password:** `Customer123!`
* **Role:** `customer`

*(Note: The login page includes 1-click **Fill Admin** and **Fill Customer** buttons for quick testing).*

---

## 9. REST API Documentation

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new customer
* `POST /api/auth/login` — Sign in and receive JWT token
* `GET  /api/auth/me` — Retrieve current authenticated profile (Protected)
* `PUT  /api/auth/profile` — Update name, phone, address, city, country (Protected)
* `PUT  /api/auth/password` — Change password (Protected)

### Products (`/api/products`)
* `GET    /api/products` — Filtered, searched, sorted, and paginated product list
* `GET    /api/products/:id` — Single product details by ID or slug
* `GET    /api/products/featured` — Curated featured homepage products
* `GET    /api/products/deals` — Discounted products
* `GET    /api/products/trending` — Top selling items
* `GET    /api/products/:id/related` — Related category products
* `POST   /api/products` — Create new product (Admin Only)
* `PUT    /api/products/:id` — Update product details and stock (Admin Only)
* `DELETE /api/products/:id` — Remove product (Admin Only)

### Categories (`/api/categories`)
* `GET    /api/categories` — List active product categories
* `POST   /api/categories` — Create category (Admin Only)
* `PUT    /api/categories/:id` — Update category (Admin Only)
* `DELETE /api/categories/:id` — Delete category (Admin Only)

### Cart & Wishlist (`/api/cart` & `/api/wishlist`)
* `GET    /api/cart` — Get user cart
* `POST   /api/cart/items` — Add item to cart with stock validation
* `PUT    /api/cart/items/:id` — Update item quantity
* `DELETE /api/cart/items/:id` — Remove line item
* `DELETE /api/cart/clear` — Empty cart
* `GET    /api/wishlist` — View saved items
* `POST   /api/wishlist/toggle` — Add/remove from wishlist

### Orders (`/api/orders`)
* `POST   /api/orders` — Place order and decrement inventory atomically (Protected)
* `GET    /api/orders/my-orders` — View user's order history (Protected)
* `GET    /api/orders/:id` — View specific order tracking details (Protected)
* `PUT    /api/orders/:id/cancel` — Cancel order and restore stock (Protected)

### Admin Console (`/api/admin`)
* `GET    /api/admin/dashboard` — Revenue totals, counters, recent orders (Admin Only)
* `GET    /api/admin/analytics` — Periodic revenue and best-seller charts (Admin Only)
* `GET    /api/admin/orders` — Orders table with status filters (Admin Only)
* `PUT    /api/admin/orders/:id/status` — Transition order fulfillment state (Admin Only)
* `GET    /api/admin/inventory` — Live inventory stock table (Admin Only)
* `GET    /api/admin/users` — Registered accounts list (Admin Only)
* `PUT    /api/admin/users/:id/status` — Toggle customer active state (Admin Only)

---

## 10. Database Schema Models

### User
* `name` (String, required)
* `email` (String, unique, indexed)
* `password` (String, hashed via bcrypt)
* `role` (String: `customer` | `admin`)
* `phone`, `address`, `city`, `country`, `avatar`
* `isActive` (Boolean, default `true`)

### Product
* `name`, `slug`, `description`
* `price`, `discountPrice`
* `category` (ObjectId ref: `Category`)
* `brand`, `images` (Array of URLs), `stock`, `sku` (Unique)
* `rating` (0-5), `numReviews`, `soldCount`
* `colors`, `sizes`, `specifications`
* `isFeatured`, `isActive`

### Order
* `user` (ObjectId ref: `User`)
* `orderItems`: `[{ product, name, image, price, quantity, color, size }]`
* `shippingAddress`: `fullName, phone, email, country, city, address, notes`
* `paymentMethod`: `Cash on Delivery`
* `paymentStatus`: `Pending` | `Paid` | `Failed`
* `orderStatus`: `Pending` | `Confirmed` | `Processing` | `Shipped` | `Delivered` | `Cancelled`
* `subtotal`, `shippingPrice`, `discount`, `totalPrice`

---

## 11. Troubleshooting Guide

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| **MongoDB connection refused** | MongoDB service stopped | Run `net start MongoDB` or verify port `27017`. |
| **Port 5000 in use** | An existing server instance is active | Change `PORT=5001` in `server/.env` and update client proxy in `vite.config.js`. |
| **Cannot load npm.ps1** | Windows script execution policy | Use `npm.cmd` or run commands through standard command prompt. |
| **401 Unauthorized** | Token expired or invalid | Sign in again via `/login` to refresh the session token. |
| **Duplicate key error (11000)** | SKU or email already exists in MongoDB | Use a unique email or let the server auto-generate a unique SKU. |

---

Developed with ❤️ for **ABDULL E-Commerce Platform**.

---

## 🌍 Deploy for free (Render + MongoDB Atlas)

The server also serves the built React site, so the whole store runs as **one free Render web service**.

1. **Database — MongoDB Atlas (free M0):** create a cluster, add a database user, allow network access from `0.0.0.0/0`, and copy the connection string (`mongodb+srv://USER:PASSWORD@cluster.../abdull_ecommerce`).
2. **Hosting — Render:** *New → Blueprint* → choose this repository. `render.yaml` sets everything up; paste your Atlas string as `MONGO_URI` when asked. `JWT_SECRET` is generated automatically.
3. **Fill the database once** from your computer, pointing at Atlas:
   ```bash
   cd server
   MONGO_URI="mongodb+srv://..." npm run seed
   MONGO_URI="mongodb+srv://..." npm run seed:extras
   ```
   Set `SEED_ADMIN_PASSWORD` the same way to choose the admin password.

Build command `npm run build`, start command `npm start`. In production the server refuses to start without `MONGO_URI` and a random `JWT_SECRET` of at least 32 characters. Free Render services sleep after 15 minutes without visitors; the first visit after that takes about a minute.
