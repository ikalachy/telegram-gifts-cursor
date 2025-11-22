import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IOption {
  animals: string[];
  accessories: string[];
  animation_url: string;
  thumbnail_url: string;
}

export interface IPendingCreation extends Document {
  user_id: Types.ObjectId;
  options: IOption[];
  expires_at: Date;
  created_at: Date;
}

const PendingCreationSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  options: [{
    animals: [{ type: String }],
    accessories: [{ type: String }],
    animation_url: { type: String },
    thumbnail_url: { type: String },
  }],
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
});

export const PendingCreation: Model<IPendingCreation> = 
  mongoose.models.PendingCreation || mongoose.model<IPendingCreation>('PendingCreation', PendingCreationSchema, 'nanopets_pendingcreations');

