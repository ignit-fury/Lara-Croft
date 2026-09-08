import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const categories = [
  { name: 'Shirts', slug: 'shirts', order_num: 1 },
  { name: 'T-Shirts', slug: 't-shirts', order_num: 2 },
  { name: 'Trousers', slug: 'trousers', order_num: 3 },
  { name: 'Jeans', slug: 'jeans', order_num: 4 },
];

const products = [
  {
    name: "Explorer's Linen Shirt",
    slug: 'explorers-linen-shirt',
    categorySlug: 'shirts',
    brand: 'Lara Croft Edition',
    price: 129900,
    original_price: 189900,
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    stock: 15,
    description: 'Crafted from breathable linen with a relaxed explorer cut. Features reinforced stitching and vintage-era brass buttons. Perfect for jungle treks and city evenings alike.',
    featured: true,
    tags: ['linen', 'explorer', 'casual'],
  },
  {
    name: 'Nameless Adventurer Tee',
    slug: 'nameless-adventurer-tee',
    categorySlug: 't-shirts',
    brand: 'Lara Croft Edition',
    price: 79900,
    original_price: 119900,
    images: ['https://images.unsplash.com/photo-1521223890158-e322e2b6f96d?w=600&q=80'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    stock: 25,
    description: 'Heavyweight cotton tee with the iconic Primal Logo print. Pre-shrunk fabric for a broken-in feel from day one. A wardrobe essential.',
    featured: true,
    tags: ['cotton', 'tee', 'casual'],
  },
  {
    name: 'Tomb Raider Cargo Trousers',
    slug: 'tomb-raider-cargo-trousers',
    categorySlug: 'trousers',
    brand: 'Lara Croft Edition',
    price: 99900,
    original_price: 149900,
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    stock: 18,
    description: 'Multi-pocket cargo trousers in durable cotton canvas. Articulated knees, reinforced seams, and a tapered leg. Built for movement.',
    featured: true,
    tags: ['cargo', 'trousers', 'adventure'],
  },
  {
    name: 'Croft Classic Denim Jeans',
    slug: 'croft-classic-denim-jeans',
    categorySlug: 'jeans',
    brand: 'Lara Croft Edition',
    price: 149900,
    original_price: 219900,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80'],
    sizes: ['28', '30', '32', '34', '36'],
    stock: 12,
    description: 'Classic straight-fit denim with a subtle sand-wash finish. 12oz Japanese denim with copper rivets and a leather patch. Ages beautifully.',
    featured: true,
    tags: ['denim', 'jeans', 'classic'],
  },
  {
    name: 'Pasha Silk Shirt',
    slug: 'pasha-silk-shirt',
    categorySlug: 'shirts',
    brand: 'Lara Croft Edition',
    price: 159900,
    original_price: 229900,
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 8,
    description: 'Luxurious silk-blend shirt with an iridescent finish. Roll-up sleeves with hidden button plackets. Formal enough for Shumbai, casual enough for Sinai.',
    featured: false,
    tags: ['silk', 'shirt', 'formal'],
  },
  {
    name: 'Relic Hunter Tee',
    slug: 'relic-hunter-tee',
    categorySlug: 't-shirts',
    brand: 'Lara Croft Edition',
    price: 69900,
    original_price: 99900,
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    stock: 30,
    description: 'Vintage-wash cotton tee with a distressed Relic Hunter screen print. Slightly oversized fit. Each print is unique — no two are exactly alike.',
    featured: false,
    tags: ['vintage', 'tee', 'casual'],
  },
  {
    name: 'Expedition Chinos',
    slug: 'expedition-chinos',
    categorySlug: 'trousers',
    brand: 'Lara Croft Edition',
    price: 119900,
    original_price: 169900,
    images: ['https://images.unsplash.com/photo-1624378439575-d87e5ad7ae80?w=600&q=80'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    stock: 20,
    description: 'Stretch cotton chinos in earth tones. Gusseted crotch for full range of motion. Water-resistant finish for unpredictable weather.',
    featured: false,
    tags: ['chinos', 'trousers', 'expedition'],
  },
  {
    name: 'Tiered Pocket Jeans',
    slug: 'tiered-pocket-jeans',
    categorySlug: 'jeans',
    brand: 'Lara Croft Edition',
    price: 129900,
    original_price: 179900,
    images: ['https://images.unsplash.com/photo-1475178626620-a4d074967571?w=600&q=80'],
    sizes: ['28', '30', '32', '34', '36'],
    stock: 0,
    description: 'Five-pocket jeans with a faded acid wash and subtle distressing at the cuffs. Mid-rise fit with a comfortable waistband.',
    featured: false,
    tags: ['jeans', 'acid-wash', 'casual'],
  },
];

async function seed() {
  try {
    // Clear existing data
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Cleared existing data');

    // Create categories
    const categoryMap: Record<string, string> = {};
    for (const cat of categories) {
      const { data, error } = await supabase.from('categories').insert({
        name: cat.name,
        slug: cat.slug,
        order_num: cat.order_num,
        active: true,
      }).select().single();
      if (error) throw error;
      categoryMap[cat.slug] = data.id;
    }
    console.log(`Created ${categories.length} categories`);

    // Create products
    for (const product of products) {
      const { categorySlug, ...rest } = product;
      const { error } = await supabase.from('products').insert({
        ...rest,
        category_id: categoryMap[categorySlug],
      });
      if (error) throw error;
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
