import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IFusionJob extends Document {
  user_id: Types.ObjectId;
  parent_ids: Types.ObjectId[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result_gift_id?: Types.ObjectId;
  created_at: Date;
}

const FusionJobSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  parent_ids: [{ type: Schema.Types.ObjectId, ref: 'Gift', required: true }],
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  result_gift_id: { type: Schema.Types.ObjectId, ref: 'Gift' },
  created_at: { type: Date, default: Date.now },
});

export const FusionJob: Model<IFusionJob> = 
  mongoose.models.FusionJob || mongoose.model<IFusionJob>('FusionJob', FusionJobSchema);

