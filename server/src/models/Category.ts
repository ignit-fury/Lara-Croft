import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: string;
  order: number;
  active: boolean;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  image: String,
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.index({ slug: 1 });
categorySchema.index({ active: 1, order: 1 });

export default mongoose.model<ICategory>('Category', categorySchema);
