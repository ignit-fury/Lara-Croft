import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category';
import Product from './models/Product';

dotenv.config();

const categories = [
  { name: 'Lehengas', slug: 'lehengas', order: 1 },
  { name: 'Sarees', slug: 'sarees', order: 2 },
  { name: 'Suits & Salwar', slug: 'suits-salwar', order: 3 },
  { name: 'Western Wear', slug: 'western-wear', order: 4 },
  { name: 'Jewellery', slug: 'jewellery', order: 5 },
  { name: 'Accessories', slug: 'accessories', order: 6 },
];

const products = [
  // Lehengas
  {
    name: 'Royal Velvet Lehenga - Maroon',
    slug: 'royal-velvet-lehenga-maroon',
    categorySlug: 'lehengas',
    brand: 'LARA CROFT',
    price: 1299900,
    originalPrice: 1899900,
    images: ['https://picsum.photos/seed/lehenga1/600/800', 'https://picsum.photos/seed/lehenga1b/600/800'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 15,
    description: 'Luxurious velvet lehenga with intricate zardozi embroidery. Perfect for weddings and special occasions.',
    featured: true,
    tags: ['wedding', 'velvet', 'embroidered'],
  },
  {
    name: 'Pastel Tulle Lehenga - Mint',
    slug: 'pastel-tulle-lehenga-mint',
    categorySlug: 'lehengas',
    brand: 'LARA CROFT',
    price: 899900,
    originalPrice: 1199900,
    images: ['https://picsum.photos/seed/lehenga2/600/800'],
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 8,
    description: 'Ethereal pastel lehenga with layered tulle and delicate thread work.',
    featured: true,
    tags: ['pastel', 'tulle', 'elegant'],
  },
  // Sarees
  {
    name: 'Banarasi Silk Saree - Gold',
    slug: 'banarasi-silk-saree-gold',
    categorySlug: 'sarees',
    brand: 'LARA CROFT',
    price: 799900,
    originalPrice: 1099900,
    images: ['https://picsum.photos/seed/saree1/600/800'],
    sizes: ['Free Size'],
    stock: 20,
    description: 'Classic Banarasi silk saree with rich gold zari work and traditional motifs.',
    featured: true,
    tags: ['banarasi', 'silk', 'traditional'],
  },
  {
    name: 'Chiffon Georgette Saree - Rose',
    slug: 'chiffon-georgette-saree-rose',
    categorySlug: 'sarees',
    brand: 'LARA CROFT',
    price: 499900,
    originalPrice: 699900,
    images: ['https://picsum.photos/seed/saree2/600/800'],
    sizes: ['Free Size'],
    stock: 25,
    description: 'Lightweight chiffon saree with subtle sequin detailing. Perfect for evening events.',
    featured: false,
    tags: ['chiffon', 'georgette', 'evening'],
  },
  // Suits
  {
    name: 'Anarkali Suit Set - Navy',
    slug: 'anarkali-suit-set-navy',
    categorySlug: 'suits-salwar',
    brand: 'LARA CROFT',
    price: 699900,
    originalPrice: 899900,
    images: ['https://picsum.photos/seed/suit1/600/800'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 12,
    description: 'Floor-length Anarkali suit with intricate thread work and matching dupatta.',
    featured: true,
    tags: ['anarkali', 'navy', 'elegant'],
  },
  {
    name: 'Palazzo Suit Set - Ivory',
    slug: 'palazzo-suit-set-ivory',
    categorySlug: 'suits-salwar',
    brand: 'LARA CROFT',
    price: 499900,
    originalPrice: 649900,
    images: ['https://picsum.photos/seed/suit2/600/800'],
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 18,
    description: 'Contemporary palazzo suit with embroidered kurta and flowing palazzo pants.',
    featured: false,
    tags: ['palazzo', 'ivory', 'contemporary'],
  },
  // Western Wear
  {
    name: 'Sequin Party Gown - Black',
    slug: 'sequin-party-gown-black',
    categorySlug: 'western-wear',
    brand: 'LARA CROFT',
    price: 599900,
    originalPrice: 799900,
    images: ['https://picsum.photos/seed/gown1/600/800'],
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 10,
    description: 'Stunning all-over sequin gown with thigh-high slit. Perfect for cocktail parties.',
    featured: true,
    tags: ['sequin', 'party', 'gown'],
  },
  {
    name: 'Drape Maxi Dress - Wine',
    slug: 'drape-maxi-dress-wine',
    categorySlug: 'western-wear',
    brand: 'LARA CROFT',
    price: 399900,
    originalPrice: 549900,
    images: ['https://picsum.photos/seed/dress1/600/800'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 14,
    description: 'Elegant draped maxi dress in rich wine color. Flattering silhouette for all body types.',
    featured: false,
    tags: ['maxi', 'drape', 'wine'],
  },
  // Jewellery
  {
    name: 'Kundan Necklace Set - Bridal',
    slug: 'kundan-necklace-set-bridal',
    categorySlug: 'jewellery',
    brand: 'LARA CROFT',
    price: 249900,
    originalPrice: 349900,
    images: ['https://picsum.photos/seed/jewel1/600/800'],
    sizes: ['One Size'],
    stock: 6,
    description: 'Exquisite kundan necklace set with earrings and maang tikka. Ideal for bridal wear.',
    featured: true,
    tags: ['kundan', 'bridal', 'necklace'],
  },
  {
    name: 'Pearl Choker Set - Classic',
    slug: 'pearl-choker-set-classic',
    categorySlug: 'jewellery',
    brand: 'LARA CROFT',
    price: 129900,
    originalPrice: 179900,
    images: ['https://picsum.photos/seed/jewel2/600/800'],
    sizes: ['One Size'],
    stock: 20,
    description: 'Timeless pearl choker set with gold-plated chain. Versatile for any occasion.',
    featured: false,
    tags: ['pearl', 'choker', 'classic'],
  },
  // Accessories
  {
    name: 'Embroidered Clutch Bag - Gold',
    slug: 'embroidered-clutch-bag-gold',
    categorySlug: 'accessories',
    brand: 'LARA CROFT',
    price: 39900,
    originalPrice: 59900,
    images: ['https://picsum.photos/seed/bag1/600/800'],
    sizes: ['One Size'],
    stock: 30,
    description: 'Beautifully embroidered clutch bag with gold chain strap. Perfect for festive occasions.',
    featured: false,
    tags: ['clutch', 'embroidered', 'gold'],
  },
  {
    name: 'Silk Stole - Multi',
    slug: 'silk-stole-multi',
    categorySlug: 'accessories',
    brand: 'LARA CROFT',
    price: 29900,
    originalPrice: 49900,
    images: ['https://picsum.photos/seed/stole1/600/800'],
    sizes: ['One Size'],
    stock: 40,
    description: 'Pure silk stole with vibrant print. Adds elegance to any outfit.',
    featured: false,
    tags: ['silk', 'stole', 'versatile'],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create categories
    const categoryMap: Record<string, mongoose.Types.ObjectId> = {};
    for (const cat of categories) {
      const created = await Category.create(cat);
      categoryMap[cat.slug] = created._id;
    }
    console.log(`Created ${categories.length} categories`);

    // Create products
    for (const product of products) {
      const { categorySlug, ...rest } = product;
      await Product.create({
        ...rest,
        category: categoryMap[categorySlug],
      });
    }
    console.log(`Created ${products.length} products`);

    console.log('Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
