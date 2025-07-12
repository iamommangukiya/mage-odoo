import mongoose, { Schema, models, model } from 'mongoose';

const NotificationSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['swap_request', 'swap_accepted', 'swap_rejected', 'new_review', 'message'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: {
    swap_id: { type: Schema.Types.ObjectId, ref: 'Swap' },
    from_user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    to_user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    review_id: { type: Schema.Types.ObjectId },
    message_id: { type: Schema.Types.ObjectId }
  },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

export default models.Notification || model('Notification', NotificationSchema); 