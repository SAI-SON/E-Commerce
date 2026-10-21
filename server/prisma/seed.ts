import 'dotenv/config';
import { PrismaClient, Role, DiscountType, OrderStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Vastra database...');

  // 1. Clean existing records in reverse dependency order
  await prisma.adminAuditLog.deleteMany();
  await prisma.couponRedemption.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.review.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@12345', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@vastrastore.com',
      passwordHash: adminPasswordHash,
      firstName: 'Aarav',
      lastName: 'Sharma',
      role: Role.ADMIN,
      phone: '+91 98765 43210',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@vastrastore.com',
      passwordHash: customerPasswordHash,
      firstName: 'Priya',
      lastName: 'Nair',
      role: Role.CUSTOMER,
      phone: '+91 91234 56789',
      addresses: {
        create: [
          {
            fullName: 'Priya Nair',
            phone: '+91 91234 56789',
            streetAddress: '42, Lotus Boulevard, Green Glen Layout',
            apartment: 'Flat 402, Tower B',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560103',
            country: 'India',
            isDefaultShipping: true,
            isDefaultBilling: true,
          },
        ],
      },
    },
  });

  console.log('Created Users:', { admin: admin.email, customer: customer.email });

  // 3. Create Categories
  const catMen = await prisma.category.create({
    data: {
      name: "Men's Wear",
      slug: 'mens-wear',
      description: 'Handwoven organic cotton and linen kurtas, shirts, and dhotis crafted for ease and quiet elegance.',
      imageUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
      sortOrder: 1,
    },
  });

  const catWomen = await prisma.category.create({
    data: {
      name: "Women's Wear",
      slug: 'womens-wear',
      description: 'Graceful silhouettes, handloom kurtas, raw silk sarees, and flowing dresses rooted in tradition.',
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      sortOrder: 2,
    },
  });

  const catJewellery = await prisma.category.create({
    data: {
      name: 'Temple Jewellery',
      slug: 'jewellery',
      description: 'Handcrafted silver, brass, and semi-precious stone ornaments inspired by timeless heritage art.',
      imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      sortOrder: 3,
    },
  });

  const catAccessories = await prisma.category.create({
    data: {
      name: 'Accessories & Living',
      slug: 'accessories',
      description: 'Pure Pashmina stoles, organic cotton tote bags, copper vessels, and handcrafted essentials.',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      sortOrder: 4,
    },
  });

  // Subcategories
  const catKurtas = await prisma.category.create({
    data: {
      name: 'Kurtas & Tunics',
      slug: 'kurtas',
      description: 'Breathable, naturally dyed and organic fabric kurtas.',
      parentId: catWomen.id,
      sortOrder: 1,
    },
  });

  const catSarees = await prisma.category.create({
    data: {
      name: 'Handloom Sarees',
      slug: 'sarees',
      description: 'Chanderi, Tussar silk, and hand-spun Khadi cotton sarees.',
      parentId: catWomen.id,
      sortOrder: 2,
    },
  });

  const catDhotis = await prisma.category.create({
    data: {
      name: 'Dhoti Pants & Bottoms',
      slug: 'dhotis',
      description: 'Relaxed fit, organic weave bottoms for comfort and ritual wear.',
      parentId: catMen.id,
      sortOrder: 3,
    },
  });

  // 4. Products Data (26 Realistic Products)
  const productsData = [
    // --- MEN'S WEAR ---
    {
      name: 'Organic Cotton Short Kurta - Raw Sand',
      slug: 'organic-cotton-short-kurta-sand',
      shortDescription: 'Minimalist mandarin collar short kurta woven from unbleached organic cotton.',
      description: 'Crafted with 100% GOTS-certified organic cotton, this relaxed-fit short kurta embodies understated refinement. Features wooden buttons, side slits, and a soft breathable texture that softens with every wash.',
      material: '100% Organic Handloom Cotton',
      careInstructions: 'Gentle hand wash with mild detergent. Dry in shade. Warm iron.',
      categoryId: catMen.id,
      isFeatured: true,
      isNewArrival: true,
      tags: ['organic', 'cotton', 'men', 'summer', 'breathable'],
      images: [
        { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80', altText: 'Front view of Raw Sand Kurta', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80', altText: 'Detail of fabric texture', isPrimary: false },
      ],
      variants: [
        { sku: 'VAS-MSK-SND-M', size: 'M', colour: 'Raw Sand', colourHex: '#D8CBB7', price: 2490, salePrice: 2190, stockQuantity: 18 },
        { sku: 'VAS-MSK-SND-L', size: 'L', colour: 'Raw Sand', colourHex: '#D8CBB7', price: 2490, salePrice: 2190, stockQuantity: 24 },
        { sku: 'VAS-MSK-SND-XL', size: 'XL', colour: 'Raw Sand', colourHex: '#D8CBB7', price: 2490, salePrice: null, stockQuantity: 12 },
        { sku: 'VAS-MSK-WHT-M', size: 'M', colour: 'Natural White', colourHex: '#F6F5F0', price: 2490, salePrice: 2190, stockQuantity: 15 },
        { sku: 'VAS-MSK-WHT-L', size: 'L', colour: 'Natural White', colourHex: '#F6F5F0', price: 2490, salePrice: 2190, stockQuantity: 8 },
      ],
    },
    {
      name: 'Indigo Khadi Long Kurta',
      slug: 'indigo-khadi-long-kurta',
      shortDescription: 'Naturally fermented indigo dyed khadi kurta with subtle hand-embroidery.',
      description: 'Handspun and handwoven by traditional artisans, this full-length kurta features authentic Ayurvedic fermented indigo dye. Breathable, sweat-wicking, and deeply calming against the skin.',
      material: 'Handspun Khadi Cotton',
      careInstructions: 'First wash dry clean. Subsequent washes cold water with mild liquid soap.',
      categoryId: catMen.id,
      isFeatured: true,
      isNewArrival: false,
      tags: ['khadi', 'indigo', 'natural dye', 'men'],
      images: [
        { url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80', altText: 'Indigo Khadi Kurta', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-MLK-IND-M', size: 'M', colour: 'Deep Indigo', colourHex: '#1E3A5F', price: 3450, salePrice: 2990, stockQuantity: 14 },
        { sku: 'VAS-MLK-IND-L', size: 'L', colour: 'Deep Indigo', colourHex: '#1E3A5F', price: 3450, salePrice: 2990, stockQuantity: 20 },
        { sku: 'VAS-MLK-IND-XL', size: 'XL', colour: 'Deep Indigo', colourHex: '#1E3A5F', price: 3450, salePrice: null, stockQuantity: 6 },
      ],
    },
    {
      name: 'Pleated Linen Dhoti Pants',
      slug: 'pleated-linen-dhoti-pants',
      shortDescription: 'Contemporary pre-pleated dhoti pants crafted from pure European flax linen.',
      description: 'The freedom of a traditional dhoti combined with modern trouser comfort. Elasticated back waistband, side pockets, and relaxed tapered pleats.',
      material: '100% Pure Flax Linen',
      careInstructions: 'Machine wash delicate or hand wash. Iron while slightly damp.',
      categoryId: catDhotis.id,
      isFeatured: false,
      isNewArrival: true,
      tags: ['dhoti', 'linen', 'comfort', 'men'],
      images: [
        { url: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&q=80', altText: 'Pleated Linen Dhoti Pants', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-MDP-BEI-M', size: 'M', colour: 'Natural Oatmeal', colourHex: '#E2D9CC', price: 2890, salePrice: null, stockQuantity: 16 },
        { sku: 'VAS-MDP-BEI-L', size: 'L', colour: 'Natural Oatmeal', colourHex: '#E2D9CC', price: 2890, salePrice: null, stockQuantity: 22 },
        { sku: 'VAS-MDP-BLK-M', size: 'M', colour: 'Charcoal Black', colourHex: '#252525', price: 2890, salePrice: 2590, stockQuantity: 10 },
        { sku: 'VAS-MDP-BLK-L', size: 'L', colour: 'Charcoal Black', colourHex: '#252525', price: 2890, salePrice: 2590, stockQuantity: 4 }, // low stock
      ],
    },
    {
      name: 'Terracotta Handloom Nehru Jacket',
      slug: 'terracotta-handloom-nehru-jacket',
      shortDescription: 'Tailored sleeveless bundi jacket woven from rich textured raw silk and cotton.',
      description: 'Layer effortlessly for celebrations or mindful gatherings. Featuring a crisp mandarin collar, welt pockets, and recycled coconut shell buttons.',
      material: '60% Raw Silk, 40% Handloom Cotton',
      careInstructions: 'Dry clean only to maintain silk luster and tailored shape.',
      categoryId: catMen.id,
      isFeatured: true,
      isNewArrival: false,
      tags: ['jacket', 'silk', 'terracotta', 'festive'],
      images: [
        { url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80', altText: 'Terracotta Nehru Jacket', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-MNJ-TER-38', size: '38', colour: 'Terracotta Rust', colourHex: '#8C4A2F', price: 4200, salePrice: 3750, stockQuantity: 8 },
        { sku: 'VAS-MNJ-TER-40', size: '40', colour: 'Terracotta Rust', colourHex: '#8C4A2F', price: 4200, salePrice: 3750, stockQuantity: 14 },
        { sku: 'VAS-MNJ-TER-42', size: '42', colour: 'Terracotta Rust', colourHex: '#8C4A2F', price: 4200, salePrice: 3750, stockQuantity: 9 },
      ],
    },
    {
      name: 'Organic Cotton Mandir Dhoti & Angavastram Set',
      slug: 'organic-cotton-mandir-dhoti-set',
      shortDescription: 'Pristine off-white traditional single dhoti with matching angavastram stole.',
      description: 'Woven with gentle care in Tamil Nadu, this unstitched traditional dhoti set is bordered with a delicate golden zari thread. Ideal for temple visits, meditation, and ceremonies.',
      material: '100% Combed Organic Cotton with Zari Border',
      careInstructions: 'Hand wash in cold water with mild shampoo. Do not wring.',
      categoryId: catDhotis.id,
      isFeatured: false,
      isNewArrival: false,
      tags: ['dhoti', 'traditional', 'temple', 'ceremony'],
      images: [
        { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80', altText: 'Mandir Dhoti Set', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-MDS-OFF-FS', size: 'Free Size', colour: 'Temple Gold & Cream', colourHex: '#FBF9F1', price: 1850, salePrice: 1590, stockQuantity: 30 },
      ],
    },
    {
      name: 'Olive Green Relaxed Linen Shirt',
      slug: 'olive-green-relaxed-linen-shirt',
      shortDescription: 'Breathable Cuban collar shirt tailored from pure European flax linen.',
      description: 'An airy staple for warm tropical afternoons. Pre-washed for maximum softness with natural shell buttons.',
      material: '100% Pure Flax Linen',
      careInstructions: 'Machine wash warm, tumble dry low or line dry.',
      categoryId: catMen.id,
      isFeatured: false,
      isNewArrival: true,
      tags: ['linen', 'shirt', 'olive', 'casual'],
      images: [
        { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80', altText: 'Olive Linen Shirt', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-MLS-OLV-M', size: 'M', colour: 'Sage Olive', colourHex: '#4A5D4E', price: 2790, salePrice: null, stockQuantity: 15 },
        { sku: 'VAS-MLS-OLV-L', size: 'L', colour: 'Sage Olive', colourHex: '#4A5D4E', price: 2790, salePrice: null, stockQuantity: 18 },
        { sku: 'VAS-MLS-OLV-XL', size: 'XL', colour: 'Sage Olive', colourHex: '#4A5D4E', price: 2790, salePrice: null, stockQuantity: 7 },
      ],
    },

    // --- WOMEN'S WEAR ---
    {
      name: 'Chanderi Silk Hand-Block Kurta & Dupatta Set',
      slug: 'chanderi-silk-hand-block-kurta-set',
      shortDescription: 'Ethereal Chanderi silk kurta with hand-block botanical motifs and matching sheer dupatta.',
      description: 'Loomed in Madhya Pradesh, this luminous Chanderi kurta features subtle gold zari piping, mother-of-pearl buttons, and a lightweight Mulmul cotton inner lining for all-day breathability.',
      material: 'Chanderi Silk (Body) & 100% Mulmul Cotton (Lining)',
      careInstructions: 'Dry clean recommended for first two washes.',
      categoryId: catKurtas.id,
      isFeatured: true,
      isNewArrival: true,
      tags: ['chanderi', 'silk', 'kurta', 'women', 'hand-block'],
      images: [
        { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', altText: 'Chanderi Silk Kurta Set', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', altText: 'Dupatta detail', isPrimary: false },
      ],
      variants: [
        { sku: 'VAS-WCK-RUS-S', size: 'S', colour: 'Dusty Rose', colourHex: '#C99D95', price: 4950, salePrice: 4290, stockQuantity: 12 },
        { sku: 'VAS-WCK-RUS-M', size: 'M', colour: 'Dusty Rose', colourHex: '#C99D95', price: 4950, salePrice: 4290, stockQuantity: 16 },
        { sku: 'VAS-WCK-RUS-L', size: 'L', colour: 'Dusty Rose', colourHex: '#C99D95', price: 4950, salePrice: 4290, stockQuantity: 9 },
        { sku: 'VAS-WCK-SND-M', size: 'M', colour: 'Ivory Sand', colourHex: '#EFE8DC', price: 4950, salePrice: 4290, stockQuantity: 14 },
        { sku: 'VAS-WCK-SND-L', size: 'L', colour: 'Ivory Sand', colourHex: '#EFE8DC', price: 4950, salePrice: 4290, stockQuantity: 11 },
      ],
    },
    {
      name: 'Organic Cotton Anarkali Tunic - Forest Sage',
      slug: 'organic-cotton-anarkali-tunic-sage',
      shortDescription: 'Flowing gathered Anarkali tunic with delicate hand-embroidered neckline.',
      description: 'A celebration of grace and comfort. Made from 80-count organic cotton with side seam pockets and a gentle calf-length flare.',
      material: '100% Organic Cotton',
      careInstructions: 'Machine wash cold on gentle cycle. Warm iron.',
      categoryId: catKurtas.id,
      isFeatured: false,
      isNewArrival: true,
      tags: ['anarkali', 'organic', 'sage', 'cotton', 'women'],
      images: [
        { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80', altText: 'Anarkali Tunic in Sage', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-WAT-SAG-S', size: 'S', colour: 'Forest Sage', colourHex: '#4A5D4E', price: 3290, salePrice: 2890, stockQuantity: 15 },
        { sku: 'VAS-WAT-SAG-M', size: 'M', colour: 'Forest Sage', colourHex: '#4A5D4E', price: 3290, salePrice: 2890, stockQuantity: 20 },
        { sku: 'VAS-WAT-SAG-L', size: 'L', colour: 'Forest Sage', colourHex: '#4A5D4E', price: 3290, salePrice: 2890, stockQuantity: 12 },
        { sku: 'VAS-WAT-SAG-XL', size: 'XL', colour: 'Forest Sage', colourHex: '#4A5D4E', price: 3290, salePrice: 2890, stockQuantity: 6 },
      ],
    },
    {
      name: 'Handwoven Tussar Silk Saree - Earth & Gold',
      slug: 'handwoven-tussar-silk-saree-earth-gold',
      shortDescription: 'Pure wild Tussar silk saree with rich natural texture and antique temple border.',
      description: 'Sourced from the forests of Jharkhand, this unbleached wild silk saree celebrates nature’s uneven golden tones. Complete with unstitched matching blouse fabric.',
      material: '100% Wild Tussar Silk',
      careInstructions: 'Dry clean only. Store in muslin cloth with cedar balls.',
      categoryId: catSarees.id,
      isFeatured: true,
      isNewArrival: false,
      tags: ['saree', 'tussar', 'silk', 'handwoven', 'gold'],
      images: [
        { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', altText: 'Tussar Silk Saree', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-WTS-EAR-FS', size: 'Free Size', colour: 'Raw Earth & Antique Gold', colourHex: '#B59569', price: 8900, salePrice: 7990, stockQuantity: 8 },
      ],
    },
    {
      name: 'Indigo Jamdani Fine Cotton Saree',
      slug: 'indigo-jamdani-fine-cotton-saree',
      shortDescription: 'Featherlight Bengal Jamdani saree with hand-woven geometric floral motifs.',
      description: 'Weaving a single Jamdani takes over 20 days on a pit loom. Each motif is inlaid by hand using bamboo needles into 100-count fine organic cotton.',
      material: '100% Fine Handspun Cotton',
      careInstructions: 'Dry clean or gentle hand wash in starch water.',
      categoryId: catSarees.id,
      isFeatured: true,
      isNewArrival: true,
      tags: ['jamdani', 'saree', 'indigo', 'cotton', 'bengal'],
      images: [
        { url: 'https://images.unsplash.com/photo-1610030469668-932d0cbcd203?auto=format&fit=crop&w=800&q=80', altText: 'Jamdani Cotton Saree', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-WJS-IND-FS', size: 'Free Size', colour: 'Midnight Indigo & White', colourHex: '#1B2C42', price: 6500, salePrice: null, stockQuantity: 6 },
      ],
    },
    {
      name: 'Pure Linen Wide-Leg Trousers',
      slug: 'pure-linen-wide-leg-trousers',
      shortDescription: 'High-waisted breezy linen trousers with deep front pleats and horn buttons.',
      description: 'The pinnacle of relaxed modern living. Pair effortlessly with our handloom kurtas or tucked-in linen shirts.',
      material: '100% European Flax Linen',
      careInstructions: 'Gentle wash in cold water. Iron on reverse while damp.',
      categoryId: catWomen.id,
      isFeatured: false,
      isNewArrival: true,
      tags: ['linen', 'trousers', 'women', 'relaxed'],
      images: [
        { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80', altText: 'Linen Wide-Leg Trousers', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-WLT-SND-S', size: 'S', colour: 'Desert Sand', colourHex: '#D8C6AF', price: 2990, salePrice: 2690, stockQuantity: 10 },
        { sku: 'VAS-WLT-SND-M', size: 'M', colour: 'Desert Sand', colourHex: '#D8C6AF', price: 2990, salePrice: 2690, stockQuantity: 18 },
        { sku: 'VAS-WLT-SND-L', size: 'L', colour: 'Desert Sand', colourHex: '#D8C6AF', price: 2990, salePrice: 2690, stockQuantity: 14 },
        { sku: 'VAS-WLT-TER-M', size: 'M', colour: 'Burnt Terracotta', colourHex: '#8C4A2F', price: 2990, salePrice: 2690, stockQuantity: 12 },
        { sku: 'VAS-WLT-TER-L', size: 'L', colour: 'Burnt Terracotta', colourHex: '#8C4A2F', price: 2990, salePrice: null, stockQuantity: 3 }, // low stock
      ],
    },
    {
      name: 'Hand-Pleated Mulmul Peplum Top',
      slug: 'hand-pleated-mulmul-peplum-top',
      shortDescription: 'Delicate tiered peplum top made from butter-soft hand-spun mulmul.',
      description: 'Light as a summer breeze. Styled with tie-up back cords, handcrafted tassels, and mother-of-pearl buttons.',
      material: '100% Hand-spun Mulmul Cotton',
      careInstructions: 'Hand wash in cold water with gentle detergent.',
      categoryId: catWomen.id,
      isFeatured: false,
      isNewArrival: false,
      tags: ['mulmul', 'top', 'cotton', 'summer'],
      images: [
        { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80', altText: 'Mulmul Peplum Top', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-WPT-WHT-S', size: 'S', colour: 'Natural Ecru', colourHex: '#F6F3EB', price: 2190, salePrice: 1890, stockQuantity: 14 },
        { sku: 'VAS-WPT-WHT-M', size: 'M', colour: 'Natural Ecru', colourHex: '#F6F3EB', price: 2190, salePrice: 1890, stockQuantity: 16 },
        { sku: 'VAS-WPT-WHT-L', size: 'L', colour: 'Natural Ecru', colourHex: '#F6F3EB', price: 2190, salePrice: 1890, stockQuantity: 8 },
      ],
    },
    {
      name: 'Ajrakh Natural Dye Overlay Kimono',
      slug: 'ajrakh-natural-dye-overlay-kimono',
      shortDescription: 'Free-flowing modal silk shrug printed with authentic 14-stage Kutch Ajrakh blocks.',
      description: 'Using indigo, madder root, and pomegranate rind, this stunning layer elevates any ensemble with timeless artisan artistry.',
      material: '100% Pure Modal Silk',
      careInstructions: 'Dry clean only.',
      categoryId: catWomen.id,
      isFeatured: true,
      isNewArrival: true,
      tags: ['ajrakh', 'shrug', 'kimono', 'modal silk', 'kutch'],
      images: [
        { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80', altText: 'Ajrakh Silk Overlay', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-WAO-IND-FS', size: 'Free Size', colour: 'Indigo Madder', colourHex: '#42242B', price: 3890, salePrice: 3490, stockQuantity: 12 },
      ],
    },

    // --- TEMPLE JEWELLERY ---
    {
      name: 'Temple Lakshmi Coin Necklace - Antique Gold Finish',
      slug: 'temple-lakshmi-coin-necklace',
      shortDescription: 'Handcrafted 92.5 sterling silver necklace with 24k gold micron plating and engraved Lakshmi coins.',
      description: 'A tribute to classical South Indian temple architecture. Each coin represents auspicious prosperity, interspersed with hand-set unrefined red kemp stones.',
      material: '92.5 Sterling Silver with 24k Micron Gold Plating & Kemp Stones',
      careInstructions: 'Keep away from moisture, perfumes, and sprays. Store in airtight pouch.',
      categoryId: catJewellery.id,
      isFeatured: true,
      isNewArrival: false,
      tags: ['jewellery', 'necklace', 'temple', 'silver', 'gold plated'],
      images: [
        { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', altText: 'Lakshmi Coin Necklace', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-JLN-GLD-FS', size: 'Free Size', colour: 'Antique Gold & Ruby Kemp', colourHex: '#C5A880', price: 6200, salePrice: 5490, stockQuantity: 15 },
      ],
    },
    {
      name: 'Peacock Feather Silver Jhumkas',
      slug: 'peacock-feather-silver-jhumkas',
      shortDescription: 'Traditional oxidized sterling silver bell earrings with dancing peacock filigree.',
      description: 'Hand-chiseled by silver smiths in Rajasthan. Delicate tiny silver seed bells chime softly with movement. Featherweight and hypoallergenic.',
      material: '92.5 Hallmarked Oxidized Sterling Silver',
      careInstructions: 'Wipe with soft cotton cloth after use. Store in dry suede pouch.',
      categoryId: catJewellery.id,
      isFeatured: true,
      isNewArrival: true,
      tags: ['jhumkas', 'earrings', 'silver', 'oxidized', 'temple'],
      images: [
        { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', altText: 'Peacock Silver Jhumkas', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-JEJ-SLV-FS', size: 'Free Size', colour: 'Antique Silver', colourHex: '#A8A8A8', price: 3490, salePrice: 2990, stockQuantity: 20 },
      ],
    },
    {
      name: 'Floral Filigree Silver Kada Bangle',
      slug: 'floral-filigree-silver-kada-bangle',
      shortDescription: 'Statement openable silver cuff bangle with intricate wire filigree and ruby cabochon ends.',
      description: 'Classic screw-lock design allowing versatile fit. Made with solid 92.5 sterling silver with a dual tone antique patina.',
      material: '92.5 Sterling Silver with Ruby Cabochons',
      careInstructions: 'Store individually in zip pouch to prevent friction.',
      categoryId: catJewellery.id,
      isFeatured: false,
      isNewArrival: false,
      tags: ['kada', 'bangle', 'silver', 'jewellery'],
      images: [
        { url: 'https://images.unsplash.com/photo-1611591475155-426c0438d407?auto=format&fit=crop&w=800&q=80', altText: 'Silver Kada Bangle', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-JKB-SLV-2.4', size: '2.4', colour: 'Antique Silver', colourHex: '#B0B0B0', price: 4800, salePrice: null, stockQuantity: 8 },
        { sku: 'VAS-JKB-SLV-2.6', size: '2.6', colour: 'Antique Silver', colourHex: '#B0B0B0', price: 4800, salePrice: null, stockQuantity: 12 },
      ],
    },
    {
      name: 'Raw Rudraksha & Silver Mala (108 Beads)',
      slug: 'raw-rudraksha-silver-mala',
      shortDescription: 'Authentic 5-Mukhi Himalayan Rudraksha beads capped in sterling silver wire.',
      description: 'Hand-knotted with pure silk thread. Each bead is naturally energized and cleansed with sandalwood and holy water.',
      material: 'Panchamukhi Himalayan Rudraksha & 92.5 Silver Caps',
      careInstructions: 'Condition beads with organic almond or sesame oil once every 3 months.',
      categoryId: catJewellery.id,
      isFeatured: true,
      isNewArrival: true,
      tags: ['rudraksha', 'mala', 'spiritual', 'meditation', 'silver'],
      images: [
        { url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80', altText: 'Rudraksha Silver Mala', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-JRM-BRN-FS', size: 'Free Size', colour: 'Nut Brown & Silver', colourHex: '#7C4E2E', price: 3950, salePrice: 3490, stockQuantity: 25 },
      ],
    },
    {
      name: 'Sunburst Brass Stud Earrings',
      slug: 'sunburst-brass-stud-earrings',
      shortDescription: 'Minimalist hand-hammered raw brass studs representing the solar mandala.',
      description: 'Understated everyday elegance. Features hypoallergenic surgical steel posts.',
      material: 'Pure Hand-hammered Solid Brass',
      careInstructions: 'Clean with lemon juice and salt paste to restore warm natural glow.',
      categoryId: catJewellery.id,
      isFeatured: false,
      isNewArrival: false,
      tags: ['earrings', 'brass', 'minimalist', 'sunburst'],
      images: [
        { url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80', altText: 'Brass Stud Earrings', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-JBS-BRS-FS', size: 'Free Size', colour: 'Brushed Gold Brass', colourHex: '#D4AF37', price: 1290, salePrice: 990, stockQuantity: 35 },
      ],
    },

    // --- ACCESSORIES & LIVING ---
    {
      name: 'Pure Himalayan Pashmina Stole - Natural Cashmere',
      slug: 'pure-himalayan-pashmina-stole',
      shortDescription: 'Hand-spun and hand-woven 100% Changthangi goat cashmere stole with delicate eyelash fringes.',
      description: 'So lightweight it effortlessly passes through a ring. Inimitable warmth, softness, and heirloom longevity.',
      material: '100% Grade A Changthangi Pashmina Cashmere',
      careInstructions: 'Dry clean only. Store wrapped in acid-free tissue paper.',
      categoryId: catAccessories.id,
      isFeatured: true,
      isNewArrival: false,
      tags: ['pashmina', 'cashmere', 'stole', 'luxury', 'warmth'],
      images: [
        { url: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80', altText: 'Pashmina Stole', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-APS-NAT-FS', size: 'Free Size', colour: 'Natural Oatmeal', colourHex: '#E5DCce', price: 7900, salePrice: 6990, stockQuantity: 10 },
        { sku: 'VAS-APS-WAL-FS', size: 'Free Size', colour: 'Walnut Bark Dye', colourHex: '#6E5244', price: 7900, salePrice: 6990, stockQuantity: 7 },
      ],
    },
    {
      name: 'Hand-Braided Jute & Leather Weekend Tote',
      slug: 'hand-braided-jute-leather-weekend-tote',
      shortDescription: 'Spacious artisanal weekender bag crafted from raw river jute and vegetable-tanned leather.',
      description: 'Sturdy brass zippers, organic cotton interior lining with zippered pockets, and reinforced leather shoulder straps.',
      material: '100% Biodegradable Bengal Jute & Vegetable-Tanned Leather',
      careInstructions: 'Spot clean with damp cloth. Condition leather handles with beeswax.',
      categoryId: catAccessories.id,
      isFeatured: true,
      isNewArrival: true,
      tags: ['tote', 'jute', 'leather', 'bag', 'sustainable'],
      images: [
        { url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', altText: 'Jute Weekend Tote', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-ABT-JUT-FS', size: 'Free Size', colour: 'Natural Golden Jute', colourHex: '#BEA07E', price: 3250, salePrice: 2850, stockQuantity: 16 },
      ],
    },
    {
      name: 'Pure Copper Water Pitcher & Tumbler Set',
      slug: 'pure-copper-water-pitcher-set',
      shortDescription: 'Traditional hammered 100% Ayurvedic copper jug (1200ml) with two matching drinking glasses.',
      description: 'Storing water in copper overnight balances all three doshas and naturally purifies drinking water. Crafted seamlessly from high-gauge copper.',
      material: '100% Pure Certified Copper (Uncoated interior)',
      careInstructions: 'Rinse daily. Clean interior with lemon slice and salt to remove natural oxidation.',
      categoryId: catAccessories.id,
      isFeatured: false,
      isNewArrival: false,
      tags: ['copper', 'ayurveda', 'living', 'wellness', 'water'],
      images: [
        { url: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?auto=format&fit=crop&w=800&q=80', altText: 'Copper Pitcher and Glasses', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-ACW-COP-FS', size: 'Free Size', colour: 'Warm Rose Copper', colourHex: '#B87333', price: 2650, salePrice: 2290, stockQuantity: 22 },
      ],
    },
    {
      name: 'Kashmiri Embroidered Woolen Shawl',
      slug: 'kashmiri-embroidered-woolen-shawl',
      shortDescription: 'Fine merino wool shawl decorated with delicate Sozni needlework flora.',
      description: 'Woven in the valleys of Kashmir using traditional wooden looms, this shawl offers sublime softness and rich winter protection.',
      material: '100% Australian Merino Wool with Silk Thread Embroidery',
      careInstructions: 'Dry clean only. Store with dried lavender sprigs.',
      categoryId: catAccessories.id,
      isFeatured: false,
      isNewArrival: false,
      tags: ['shawl', 'wool', 'kashmiri', 'sozni', 'winter'],
      images: [
        { url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80', altText: 'Kashmiri Embroidered Shawl', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-AKS-CHR-FS', size: 'Free Size', colour: 'Charcoal & Wine', colourHex: '#383234', price: 4400, salePrice: 3890, stockQuantity: 12 },
      ],
    },
    {
      name: 'Handmade Neem Wood Comb Set',
      slug: 'handmade-neem-wood-comb-set',
      shortDescription: 'Pair of wide and fine tooth combs carved from seasoned Indian Neem tree wood.',
      description: 'Anti-static, gentle on scalp, inhibits dandruff, and promotes blood circulation during mindful grooming.',
      material: '100% Seasoned Herbal Neem Wood',
      careInstructions: 'Wipe clean. Apply coconut oil periodically to nourish wood.',
      categoryId: catAccessories.id,
      isFeatured: false,
      isNewArrival: true,
      tags: ['neem', 'wood', 'wellness', 'comb', 'living'],
      images: [
        { url: 'https://images.unsplash.com/photo-1590159763121-7c9ff3149e0a?auto=format&fit=crop&w=800&q=80', altText: 'Neem Wood Comb', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-ANW-WOD-FS', size: 'Free Size', colour: 'Herbal Neem Wood', colourHex: '#8C6747', price: 590, salePrice: 450, stockQuantity: 50 },
      ],
    },
    {
      name: 'Organic Khadi Yoga Mat Bag',
      slug: 'organic-khadi-yoga-mat-bag',
      shortDescription: 'Durable canvas mat carrier with breathable eyelets and adjustable cotton webbing strap.',
      description: 'Fits all standard and extra-thick yoga mats. Includes a zippered key pouch and sacred Om wooden charm.',
      material: '100% Heavy Organic Khadi Canvas',
      careInstructions: 'Machine wash gentle. Line dry.',
      categoryId: catAccessories.id,
      isFeatured: false,
      isNewArrival: false,
      tags: ['yoga', 'mat bag', 'khadi', 'wellness'],
      images: [
        { url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80', altText: 'Khadi Yoga Bag', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-AYB-OLV-FS', size: 'Free Size', colour: 'Earthy Olive', colourHex: '#4A5D4E', price: 1450, salePrice: 1190, stockQuantity: 28 },
      ],
    },
    {
      name: 'Hand-Cast Brass Diya Lamp - Lotus Form',
      slug: 'hand-cast-brass-diya-lamp',
      shortDescription: 'Traditional five-petal lotus oil lamp hand-cast using the lost-wax technique.',
      description: 'A serene centerpiece for daily prayers or meditation alcoves. Deep oil reservoir allows steady flame for up to 6 hours.',
      material: '100% Solid Cast Brass',
      careInstructions: 'Wash with Pitambari powder or tamarind paste to maintain brilliant lustre.',
      categoryId: catAccessories.id,
      isFeatured: true,
      isNewArrival: true,
      tags: ['brass', 'diya', 'lamp', 'meditation', 'living'],
      images: [
        { url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', altText: 'Brass Lotus Diya', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-ALD-BRS-FS', size: 'Free Size', colour: 'Golden Temple Brass', colourHex: '#CCA43B', price: 1890, salePrice: 1590, stockQuantity: 30 },
      ],
    },
    {
      name: 'Organic Herbal Dhoop & Incense Cone Set',
      slug: 'organic-herbal-dhoop-incense-set',
      shortDescription: 'Charcoal-free incense cones blended from temple flower waste, sambrani resin, and vetiver.',
      description: '100% natural and non-toxic. Box of 40 cones with handcrafted ceramic mini burning plate.',
      material: 'Sacred Temple Flowers, Loban, Cow Ghee, Sandalwood',
      careInstructions: 'Keep dry. Light tip and gently fan out flame.',
      categoryId: catAccessories.id,
      isFeatured: false,
      isNewArrival: false,
      tags: ['incense', 'dhoop', 'wellness', 'fragrance', 'aromatherapy'],
      images: [
        { url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80', altText: 'Organic Incense Cones', isPrimary: true },
      ],
      variants: [
        { sku: 'VAS-AIC-NAT-FS', size: 'Free Size', colour: 'Earthy Sandalwood & Sambrani', colourHex: '#6E4E37', price: 690, salePrice: 550, stockQuantity: 60 },
      ],
    },
  ];

  // Insert all products, variants, images, and inventory movements
  for (const item of productsData) {
    const { images, variants, ...prodData } = item;

    const createdProduct = await prisma.product.create({
      data: {
        ...prodData,
        images: {
          create: images.map((img, idx) => ({
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary,
            sortOrder: idx,
          })),
        },
      },
    });

    for (const v of variants) {
      const createdVariant = await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          sku: v.sku,
          size: v.size,
          colour: v.colour,
          colourHex: v.colourHex,
          price: v.price,
          salePrice: v.salePrice,
          stockQuantity: v.stockQuantity,
        },
      });

      // Audit inventory movement for initial stock
      await prisma.inventoryMovement.create({
        data: {
          variantId: createdVariant.id,
          changeQuantity: v.stockQuantity,
          previousStock: 0,
          newStock: v.stockQuantity,
          reason: 'INITIAL_STOCK_SEED',
          adminUserId: admin.id,
        },
      });
    }
  }

  console.log(`Seeded ${productsData.length} products with variants, images, and inventory tracking.`);

  // 5. Create Promotional Coupons
  const coupons = [
    {
      code: 'VASTRA10',
      description: '10% discount on orders above ₹1,500',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10.0,
      minPurchaseAmount: 1500.0,
      maxDiscountAmount: 1000.0,
      usageLimit: 500,
      isActive: true,
    },
    {
      code: 'FESTIVE25',
      description: '25% celebration discount on orders above ₹3,000',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 25.0,
      minPurchaseAmount: 3000.0,
      maxDiscountAmount: 2500.0,
      usageLimit: 200,
      isActive: true,
    },
    {
      code: 'WELCOME500',
      description: 'Flat ₹500 discount for new patrons on orders above ₹2,000',
      discountType: DiscountType.FIXED_AMOUNT,
      discountValue: 500.0,
      minPurchaseAmount: 2000.0,
      maxDiscountAmount: null,
      usageLimit: 1000,
      isActive: true,
    },
    {
      code: 'EXPIRED20',
      description: 'Expired seasonal test coupon',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20.0,
      minPurchaseAmount: 1000.0,
      maxDiscountAmount: 500.0,
      usageLimit: 50,
      expiryDate: new Date('2025-01-01'), // Expired
      isActive: false,
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.create({ data: c });
  }

  console.log(`Seeded ${coupons.length} coupons.`);

  // 6. Create a realistic Sample Past Order for Priya
  const sampleVariant = await prisma.productVariant.findFirst({
    where: { sku: 'VAS-MSK-SND-M' },
    include: { product: true },
  });

  if (sampleVariant) {
    const orderNumber = 'VAS-20261016-1001';
    const sampleOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: customer.id,
        customerEmail: customer.email,
        customerPhone: '+91 91234 56789',
        shippingAddressSnapshot: {
          fullName: 'Priya Nair',
          phone: '+91 91234 56789',
          streetAddress: '42, Lotus Boulevard',
          apartment: 'Flat 402, Tower B',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560103',
          country: 'India',
        },
        status: OrderStatus.CONFIRMED,
        subtotal: 2190.0,
        discountTotal: 0.0,
        shippingTotal: 0.0,
        grandTotal: 2190.0,
        items: {
          create: [
            {
              variantId: sampleVariant.id,
              productName: sampleVariant.product.name,
              sku: sampleVariant.sku,
              size: sampleVariant.size,
              colour: sampleVariant.colour,
              unitPrice: 2190.0,
              quantity: 1,
              subtotal: 2190.0,
            },
          ],
        },
        payment: {
          create: {
            provider: 'SIMULATED_UPI',
            status: PaymentStatus.COMPLETED,
            transactionId: 'TXN_SIM_SAMPLE_892173',
            amount: 2190.0,
            paymentMethod: 'UPI',
          },
        },
        shipment: {
          create: {
            carrier: 'Vastra Express Logistics',
            trackingNumber: 'TRK-VAS-789210',
            status: 'PREPARING',
          },
        },
      },
    });

    console.log(`Created sample verified customer order: ${sampleOrder.orderNumber}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
