import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IGift extends Document {
  owner_id: Types.ObjectId;
  animals: string[];
  accessories: string[];
  rarity: string;
  animation_url: string;
  thumbnail_url: string;
  source_type: 'daily' | 'fusion';
  fusion_parents: Types.ObjectId[];
  created_at: Date;
}

const GiftSchema: Schema = new Schema({
  owner_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  animals: [{ type: String }],
  accessories: [{ type: String }],
  rarity: { type: String, default: 'common' },
  animation_url: { type: String, required: true },
  thumbnail_url: { type: String, required: true },
  source_type: { type: String, enum: ['daily', 'fusion'], required: true },
  fusion_parents: [{ type: Schema.Types.ObjectId, ref: 'Gift' }],
  created_at: { type: Date, default: Date.now },
});

export const Gift: Model<IGift> = mongoose.models.Gift || mongoose.model<IGift>('Gift', GiftSchema);

