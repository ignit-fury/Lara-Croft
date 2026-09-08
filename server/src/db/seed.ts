import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lnbzbearlghucuftyncd.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuYnpiZWFybGdodWN1ZnR5bmNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODY3ODk4MiwiZXhwIjoyMTA0MjU0OTgyfQ.8iNv8H0JOfRunTtL5wZxfg7qt65gpcgQNWokZVBIyJc';

const db = createClient(SUPABASE_URL, SERVICE_KEY);

const IMG = (file: string) => `/images/products/${file}`;

const categories = [
  { name: 'Shirts', slug: 'shirts', image: IMG('shirt-1.jpg'), order_num: 1 },
  { name: 'Trousers', slug: 'trousers', image: IMG('trouser-1.jpg'), order_num: 2 },
  { name: 'Jeans', slug: 'jeans', image: IMG('jeans-1.jpg'), order_num: 3 },
  { name: 'T-Shirts', slug: 't-shirts', image: IMG('tshirt-1.jpg'), order_num: 4 },
  { name: 'Accessories', slug: 'accessories', image: IMG('hero-camp.jpg'), order_num: 5 },
];

const products = [
  // ─── SHIRTS ───
  {
    name: 'Desert Linen Shirt',
    slug: 'desert-linen-shirt',
    category_slug: 'shirts',
    brand: 'LARA CROFT',
    price: 349900,
    original_price: 449900,
    images: [IMG('shirt-1.jpg'), IMG('shirt-2.jpg')],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 25,
    description: 'Lightweight linen shirt inspired by desert expeditions. breathable fabric, relaxed fit, chest pockets with button flaps.',
    featured: true,
    tags: ['linen', 'summer', 'expedition'],
  },
  {
    name: 'Expedition Oxford Shirt',
    slug: 'expedition-oxford-shirt',
    category_slug: 'shirts',
    brand: 'LARA CROFT',
    price: 299900,
    original_price: 349900,
    images: [IMG('shirt-3.jpg'), IMG('shirt-4.jpg')],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 30,
    description: 'Classic oxford cloth shirt with adventure-ready details. reinforced seams, hidden zipper pocket.',
    featured: true,
    tags: ['oxford', 'casual', 'adventure'],
  },
  {
    name: 'Safari Utility Shirt',
    slug: 'safari-utility-shirt',
    category_slug: 'shirts',
    brand: 'LARA CROFT',
    price: 399900,
    original_price: 399900,
    images: [IMG('shirt-2.jpg'), IMG('shirt-1.jpg')],
    sizes: ['M', 'L', 'XL', 'XXL'],
    stock: 15,
    description: 'Rugged safari-style shirt with multiple utility pockets. UPF 30+ sun protection.',
    featured: false,
    tags: ['safari', 'utility', 'outdoor'],
  },
  {
    name: 'Heritage Flannel Shirt',
    slug: 'heritage-flannel-shirt',
    category_slug: 'shirts',
    brand: 'LARA CROFT',
    price: 279900,
    original_price: 329900,
    images: [IMG('shirt-4.jpg'), IMG('shirt-3.jpg')],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 20,
    description: 'Soft brushed flannel in earth tones. perfect for cooler expedition evenings.',
    featured: false,
    tags: ['flannel', 'winter', 'heritage'],
  },

  // ─── TROUSERS ───
  {
    name: 'Cargo Expedition Pants',
    slug: 'cargo-expedition-pants',
    category_slug: 'trousers',
    brand: 'LARA CROFT',
    price: 449900,
    original_price: 549900,
    images: [IMG('trouser-1.jpg'), IMG('trouser-2.jpg')],
    sizes: ['30', '32', '34', '36'],
    stock: 18,
    description: 'Reinforced cargo pants with 8 pockets. water-resistant ripstop fabric.',
    featured: true,
    tags: ['cargo', 'expedition', 'utility'],
  },
  {
    name: 'Trek Chinos',
    slug: 'trek-chinos',
    category_slug: 'trousers',
    brand: 'LARA CROFT',
    price: 299900,
    original_price: 349900,
    images: [IMG('trouser-2.jpg'), IMG('trouser-3.jpg')],
    sizes: ['30', '32', '34', '36', '38'],
    stock: 35,
    description: 'Slim-fit stretch chinos with a clean silhouette. 4-way stretch for comfort on the move.',
    featured: true,
    tags: ['chinos', 'casual', 'stretch'],
  },
  {
    name: 'Ripstop Field Pants',
    slug: 'ripstop-field-pants',
    category_slug: 'trousers',
    brand: 'LARA CROFT',
    price: 379900,
    original_price: 379900,
    images: [IMG('trouser-3.jpg'), IMG('trouser-1.jpg')],
    sizes: ['30', '32', '34', '36'],
    stock: 12,
    description: 'Military-inspired field pants. lightweight ripstop with articulated knees.',
    featured: false,
    tags: ['field', 'military', 'outdoor'],
  },

  // ─── JEANS ───
  {
    name: 'Rugged Slim Jeans',
    slug: 'rugged-slim-jeans',
    category_slug: 'jeans',
    brand: 'LARA CROFT',
    price: 349900,
    original_price: 449900,
    images: [IMG('jeans-1.jpg'), IMG('jeans-2.jpg')],
    sizes: ['30', '32', '34', '36'],
    stock: 22,
    description: '12oz selvedge denim with a slim tapered fit. reinforced rivets at stress points.',
    featured: true,
    tags: ['denim', 'slim', 'rugged'],
  },
  {
    name: 'Expedition Straight Jeans',
    slug: 'expedition-straight-jeans',
    category_slug: 'jeans',
    brand: 'LARA CROFT',
    price: 329900,
    original_price: 399900,
    images: [IMG('jeans-2.jpg'), IMG('jeans-3.jpg')],
    sizes: ['30', '32', '34', '36', '38'],
    stock: 28,
    description: 'Classic straight-fit jeans. medium wash with natural fading. 100% organic cotton.',
    featured: false,
    tags: ['denim', 'straight', 'classic'],
  },
  {
    name: 'Waxed Denim Jacket',
    slug: 'waxed-denim-jacket',
    category_slug: 'jeans',
    brand: 'LARA CROFT',
    price: 549900,
    original_price: 649900,
    images: [IMG('jeans-3.jpg'), IMG('jeans-1.jpg')],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 10,
    description: 'Waxed denim trucker jacket. water-repellent finish for unpredictable weather.',
    featured: true,
    tags: ['denim', 'jacket', 'outerwear'],
  },

  // ─── T-SHIRTS ───
  {
    name: 'Expedition Tee',
    slug: 'expedition-tee',
    category_slug: 't-shirts',
    brand: 'LARA CROFT',
    price: 149900,
    original_price: 199900,
    images: [IMG('tshirt-1.jpg'), IMG('tshirt-2.jpg')],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 50,
    description: 'Heavyweight cotton tee with embossed logo. pre-shrunk, garment-dyed.',
    featured: true,
    tags: ['cotton', 'casual', 'logo'],
  },
  {
    name: 'Trail Performance Tee',
    slug: 'trail-performance-tee',
    category_slug: 't-shirts',
    brand: 'LARA CROFT',
    price: 199900,
    original_price: 249900,
    images: [IMG('tshirt-2.jpg'), IMG('tshirt-3.jpg')],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 40,
    description: 'Moisture-wicking performance tee for active adventures. anti-odor treatment.',
    featured: false,
    tags: ['performance', 'active', 'moisture-wicking'],
  },
  {
    name: 'Vintage Wash Henley',
    slug: 'vintage-wash-henley',
    category_slug: 't-shirts',
    brand: 'LARA CROFT',
    price: 179900,
    original_price: 219900,
    images: [IMG('tshirt-3.jpg'), IMG('tshirt-4.jpg')],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 30,
    description: '3-button henley in vintage-washed cotton. ribbed cuffs and hem.',
    featured: false,
    tags: ['henley', 'vintage', 'casual'],
  },
  {
    name: 'Base Layer Long Sleeve',
    slug: 'base-layer-long-sleeve',
    category_slug: 't-shirts',
    brand: 'LARA CROFT',
    price: 229900,
    original_price: 229900,
    images: [IMG('tshirt-4.jpg'), IMG('tshirt-1.jpg')],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 25,
    description: 'Merino-blend base layer. temperature regulating for extreme conditions.',
    featured: true,
    tags: ['base-layer', 'merino', 'winter'],
  },

  // ─── ACCESSORIES ───
  {
    name: 'Expedition Backpack',
    slug: 'expedition-backpack',
    category_slug: 'accessories',
    brand: 'LARA CROFT',
    price: 699900,
    original_price: 849900,
    images: [IMG('hero-camp.jpg')],
    sizes: ['One Size'],
    stock: 8,
    description: '45L waterproof backpack with modular attachment system. padded laptop sleeve.',
    featured: true,
    tags: ['backpack', 'travel', 'waterproof'],
  },
  {
    name: 'Leather Belt',
    slug: 'leather-belt',
    category_slug: 'accessories',
    brand: 'LARA CROFT',
    price: 149900,
    original_price: 149900,
    images: [IMG('trouser-1.jpg')],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 45,
    description: 'Full-grain leather belt with antique brass buckle. hand-stitched edges.',
    featured: false,
    tags: ['belt', 'leather', 'heritage'],
  },
];

async function seed() {
  console.log('🗑  Clearing existing data...');
  await db.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await db.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('📁 Seeding categories...');
  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const { data, error } = await db.from('categories').insert({
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      order_num: cat.order_num,
      active: true,
    }).select('id, slug').single();
    if (error) {
      console.error(`  ✗ ${cat.name}:`, error.message);
      continue;
    }
    catMap[cat.slug] = data.id;
    console.log(`  ✓ ${cat.name} → ${data.id}`);
  }

  console.log('\n📦 Seeding products...');
  for (const p of products) {
    const catId = catMap[p.category_slug];
    const { error } = await db.from('products').insert({
      name: p.name,
      slug: p.slug,
      category_id: catId,
      brand: p.brand,
      price: p.price,
      original_price: p.original_price,
      images: p.images,
      sizes: p.sizes,
      stock: p.stock,
      description: p.description,
      featured: p.featured,
      tags: p.tags,
      stock_by_size: {},
    });
    if (error) {
      console.error(`  ✗ ${p.name}:`, error.message);
    } else {
      console.log(`  ✓ ${p.name}`);
    }
  }

  console.log('\n✅ Seed complete!');
}

seed().catch(console.error);
