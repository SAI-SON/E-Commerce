import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

// Layouts
import { MainLayout } from './components/layout/MainLayout.js';
import { AccountLayout } from './components/layout/AccountLayout.js';
import { AdminLayout } from './components/layout/AdminLayout.js';

// Storefront & Auth Pages
import { Home } from './pages/Home.js';
import { Catalogue } from './pages/Catalogue.js';
import { ProductDetail } from './pages/ProductDetail.js';
import { Cart } from './pages/Cart.js';
import { Checkout } from './pages/Checkout.js';
import { OrderConfirmation } from './pages/OrderConfirmation.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { ForgotPassword } from './pages/ForgotPassword.js';

// Account Pages
import { Profile } from './pages/account/Profile.js';
import { Addresses } from './pages/account/Addresses.js';
import { Orders as CustomerOrders } from './pages/account/Orders.js';
import { OrderDetail } from './pages/account/OrderDetail.js';
import { WishlistPage } from './pages/account/Wishlist.js';

// Admin Pages
import { DashboardPage } from './pages/admin/Dashboard.js';
import { ProductsPage } from './pages/admin/Products.js';
import { ProductFormPage } from './pages/admin/ProductForm.js';
import { InventoryPage } from './pages/admin/Inventory.js';
import { OrdersPage as AdminOrdersPage } from './pages/admin/Orders.js';
import { CouponsPage } from './pages/admin/Coupons.js';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Customer Storefront Routes (wrapped in MainLayout) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Catalogue />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Customer Account Routes (wrapped in AccountLayout) */}
        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<Navigate to="/account/profile" replace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="addresses" element={<Addresses />} />
          <Route path="orders" element={<CustomerOrders />} />
          <Route path="orders/:orderNumber" element={<OrderDetail />} />
          <Route path="wishlist" element={<WishlistPage />} />
        </Route>

        {/* 404 Fallback Route */}
        <Route
          path="*"
          element={
            <div className="max-w-xl mx-auto text-center py-24 px-4 space-y-4">
              <h1 className="font-serif text-4xl font-bold text-stone-900">404</h1>
              <p className="text-stone-600 text-sm">
                The garment or page you are seeking could not be found.
              </p>
              <div className="pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-vastra-charcoal text-white rounded hover:bg-stone-800 transition-colors"
                >
                  Return to Storefront
                </Link>
              </div>
            </div>
          }
        />
      </Route>

      {/* Admin Dashboard Routes (Strictly protected by AdminLayout) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="coupons" element={<CouponsPage />} />
      </Route>
    </Routes>
  );
};

export default App;
