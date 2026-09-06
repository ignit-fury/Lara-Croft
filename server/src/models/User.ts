import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  supabaseId: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'manager';
  addresses: Array<{
    label: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  }>;
  preferences: {
    newsletter: boolean;
    notifications: boolean;
  };
}

const userSchema = new Schema<IUser>({
  supabaseId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: String,
  role: { type: String, enum: ['user', 'admin', 'manager'], default: 'user' },
  addresses: [{
    label: String,
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'IN' },
    phone: { type: String, required: true },
  }],
  preferences: {
    newsletter: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
  },
}, { timestamps: true });

userSchema.index({ supabaseId: 1 });
userSchema.index({ email: 1 });

export default mongoose.model<IUser>('User', userSchema);
