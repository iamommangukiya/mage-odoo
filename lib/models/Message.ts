import mongoose, { Schema, models, model } from 'mongoose';

const MessageSchema = new Schema({
  swap_id: { type: Schema.Types.ObjectId, ref: 'Swap' },
  from_user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  to_user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  message: String,
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read'], 
    default: 'sent' 
  },
  created_at: { type: Date, default: Date.now },
});

export default models.Message || model('Message', MessageSchema); 