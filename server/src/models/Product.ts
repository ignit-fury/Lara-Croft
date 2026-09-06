import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: mongoose.Types.ObjectId;
  brand: string;
  price: number;
  originalPrice: number;
  images: string[];
  sizes: string[];
  stock: number;
  stockBySize?: Record<string, number>;
  description: string;
  featured: boolean;
  tags: string[];
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, required: true, min: 0 },
  images: [{ type: String, required: true }],
  sizes: [{ type: String }],
  stock: { type: Number, required: true, min: 0, default: 0 },
  stockBySize: { type: Map, of: Number },
  description: { type: String, required: true },
  featured: { type: Boolean, default: false },
  tags: [String],
}, { timestamps: true });

productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', productSchema);
