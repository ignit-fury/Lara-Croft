import mongoose, { Schema, Document } from 'mongoose';

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: Array<{
    product: mongoose.Types.ObjectId;
    size: string;
    quantity: number;
  }>;
}

const cartSchema = new Schema<ICart>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  }],
}, { timestamps: true });

cartSchema.index({ user: 1 });

export default mongoose.model<ICart>('Cart', cartSchema);
