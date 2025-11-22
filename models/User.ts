import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  telegram_id: number;
  username?: string;
  style: string;
  last_daily_at?: Date;
  created_at: Date;
}

const UserSchema: Schema = new Schema({
  telegram_id: { type: Number, required: true, unique: true, index: true },
  username: { type: String },
  style: { type: String, default: 'kawaii' },
  last_daily_at: { type: Date },
  created_at: { type: Date, default: Date.now },
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

