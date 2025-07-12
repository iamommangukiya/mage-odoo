import mongoose, { Schema, models, model } from 'mongoose';

const SwapSchema = new Schema({
  from_user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  to_user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  offered_skill: String,
  wanted_skill: String,
  message: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
});

export default models.Swap || model('Swap', SwapSchema); 