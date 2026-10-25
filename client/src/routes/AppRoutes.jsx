import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Public Customer Pages
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Wishlist from '../pages/Wishlist';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';
import PolicyPage from '../pages/info/PolicyPage';
import HelpCenter from '../pages/info/HelpCenter';
import Contact from '../pages/info/Contact';

// Protected Customer Pages
import ProtectedRoute from './ProtectedRoute';
import Checkout from '../pages/Checkout';
import OrderSuccess from '../pages/OrderSuccess';
import MyOrders from '../pages/MyOrders';
import OrderDetails from '../pages/OrderDetails';
import Profile from '../pages/Profile';

// Protected Admin Pages
import AdminRoute from './AdminRoute';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminProductForm from '../pages/admin/AdminProductForm';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminInventory from '../pages/admin/AdminInventory';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminCoupons from '../pages/admin/AdminCoupons';
import AdminMessages from '../pages/admin/AdminMessages';
import AdminSettings from '../pages/admin/AdminSettings';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Help, Policy & Company Pages */}
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<PolicyPage page="about" />} />
      <Route path="/shipping-policy" element={<PolicyPage page="shipping" />} />
      <Route path="/returns" element={<PolicyPage page="returns" />} />
      <Route path="/privacy" element={<PolicyPage page="privacy" />} />
      <Route path="/terms" element={<PolicyPage page="terms" />} />

      {/* Protected Customer Routes */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-success/:id"
        element={
          <ProtectedRoute>
            <OrderSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <AdminProducts />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products/new"
        element={
          <AdminRoute>
            <AdminProductForm />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products/:id/edit"
        element={
          <AdminRoute>
            <AdminProductForm />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminRoute>
            <AdminCategories />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminOrders />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <AdminRoute>
            <AdminInventory />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AdminRoute>
            <AdminAnalytics />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/coupons"
        element={
          <AdminRoute>
            <AdminCoupons />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/messages"
        element={
          <AdminRoute>
            <AdminMessages />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminSettings />
          </AdminRoute>
        }
      />

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
