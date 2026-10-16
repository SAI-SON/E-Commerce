export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone?: string | null;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  apartment?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  sortOrder: number;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: string;
  colour: string;
  colourHex?: string | null;
  price: number | string;
  salePrice?: number | string | null;
  stockQuantity: number;
  weightGrams?: number | null;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description: string;
  material?: string | null;
  careInstructions?: string | null;
  categoryId: string;
  category: Category;
  isPublished: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  primaryImage: string;
  sku: string;
  size: string;
  colour: string;
  colourHex?: string | null;
  unitPrice: number;
  regularPrice: number;
  salePrice: number | null;
  quantity: number;
  stockQuantity: number;
  isAvailable: boolean;
  subtotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  grandTotal: number;
  appliedCoupon?: {
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    discountApplied: number;
  } | null;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId?: string | null;
  productName: string;
  sku: string;
  size: string;
  colour: string;
  unitPrice: number | string;
  quantity: number;
  subtotal: number | string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerEmail: string;
  customerPhone: string;
  shippingAddressSnapshot: {
    fullName: string;
    phone: string;
    streetAddress: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddressSnapshot?: {
    fullName: string;
    phone: string;
    streetAddress: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status:
    | 'PENDING_PAYMENT'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REFUNDED';
  subtotal: number | string;
  discountTotal: number | string;
  shippingTotal: number | string;
  grandTotal: number | string;
  couponCode?: string | null;
  notes?: string | null;
  items: OrderItem[];
  payment?: {
    id: string;
    provider: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    transactionId: string;
    amount: number | string;
    paymentMethod: string;
  };
  shipment?: {
    id: string;
    carrier: string;
    trackingNumber: string;
    status: 'PREPARING' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';
    shippedAt?: string | null;
    estimatedDelivery?: string | null;
  };
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number | string;
  minPurchaseAmount?: number | string | null;
  maxDiscountAmount?: number | string | null;
  usageLimit?: number | null;
  usageCount: number;
  startDate: string;
  expiryDate?: string | null;
  isActive: boolean;
}

export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  primaryImage: string;
  price: number;
  salePrice: number | null;
  isPublished: boolean;
  addedAt: string;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  lowStockVariants: Array<{
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    sku: string;
    size: string;
    colour: string;
    stockQuantity: number;
  }>;
  recentOrders: Order[];
  topProducts: Array<{
    name: string;
    totalSold: number;
    revenue: number;
  }>;
}
