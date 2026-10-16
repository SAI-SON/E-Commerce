# Vastra E-Commerce Platform — Customer User Guide

Welcome to **Vastra**, an online boutique dedicated to handcrafted Indian wear, pure organic cotton and linen apparel, traditional temple jewellery, and mindful lifestyle accessories. This guide walks you through every feature of the customer shopping experience.

---

## 1. Exploring the Catalogue & Finding Garments

### 1.1 Homepage & Collections
- **Announcement Bar**: Displays active seasonal promotions (e.g. Free shipping on orders over ₹1,999).
- **Hero Showcase**: Quick access to the core handcrafted collections.
- **Featured Categories**: Explore Men's Kurtas, Women's Wear, Sarees, Dhoti Pants, and Jewellery.
- **New Arrivals & Best Sellers**: Hand-picked pieces updated in real-time based on actual store orders.

### 1.2 Powerful Faceted Search & Filters
Navigate to `/products` to explore the full catalogue:
- **Keyword Search**: Type any garment name, weaving style, or material (e.g., "khadi", "linen", "saree").
- **Category Filter**: Refine by apparel type or accessory style.
- **Size Pills**: Filter by S, M, L, XL, XXL, or Free Size.
- **Colour Swatches**: Filter by natural earthy dyes (Off-White, Terracotta, Indigo, Olive, Mustard).
- **Price Range Slider**: Filter within your budget.
- **In-Stock Only**: Hide variants that are currently out of stock.
- **View Modes**: Toggle between multi-column Grid View and detailed List View.

---

## 2. Product Details & Variant Selection

Each product page (`/products/:slug`) offers an in-depth look at craftsmanship:
1. **Interactive Gallery**: Inspect front and detail angles of each garment.
2. **Variant Configuration**:
   - Select your desired **Size** and **Colour**.
   - Note the **Live Stock Counter**: Shows whether the piece is in stock or running low.
   - If a size is out of stock, the purchase button automatically changes to "Sold Out" to prevent purchasing unavailable pieces.
3. **Craftsmanship & Care**: Read authentic weaving details, fabric composition, and washing recommendations.
4. **Wishlist**: Click the Heart icon to save the piece to your private account wishlist.

---

## 3. Shopping Cart & Promotional Coupons

Access your cart anytime by clicking the Shopping Bag icon in the header or visiting `/cart`:
- **Adjust Quantities**: Change units or remove unwanted items.
- **Free Shipping Tracker**: Shows how much more to add to unlock complimentary shipping.
- **Applying Coupons**:
  - Enter promo codes such as `VASTRA10` (10% off) or `FESTIVE25` (25% off on festive collections).
  - The server verifies coupon validity and displays your instant discount deduction.
- **Guest Persistence**: Items added as a guest are preserved in your browser session and automatically merge into your account upon signing in.

---

## 4. Seamless Checkout Workflow

Click **Proceed to Checkout** (`/checkout`) to complete your order:
1. **Customer Contact**: Enter your email and contact phone for dispatch notifications.
2. **Delivery Address**: Provide your shipping destination or select a saved address from your account address book.
3. **Order Review**: Check the authoritative subtotal, applied coupon discounts, and shipping cost.
4. **Simulated Payment**:
   - Vastra uses a simulated payment gateway (`VASTRA_MOCK_PAYMENT`) for prototype and development verification.
   - Choose your preferred method (Credit/Debit Card, UPI, or Net Banking) and click **Place Order**.
   - No real financial charge is incurred.

---

## 5. Order Confirmation & Tracking

Upon successful purchase, you are directed to `/order-confirmation/:orderNumber`:
- Review your unique Order Identifier (e.g., `VAS-20261016-1001`).
- Inspect the itemized snapshot of purchased sizes, colours, and quantities.
- Check current fulfillment status (`CONFIRMED`, `PROCESSING`, `SHIPPED`, or `DELIVERED`).

---

## 6. Managing Your Customer Account

Sign in at `/login` or register at `/register` to access your customer portal:
- **My Profile** (`/account/profile`): Update your name, email, and phone number.
- **Saved Addresses** (`/account/addresses`): Add and manage multiple delivery locations; set primary shipping and billing defaults.
- **Order History** (`/account/orders`): Review past receipts, item snapshots, and tracking information.
- **My Wishlist** (`/account/wishlist`): View your curated favorites with quick links to select sizes and add to cart.
