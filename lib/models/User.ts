import mongoose, { Schema, models, model } from 'mongoose';

const ReviewSchema = new Schema({
  reviewer_id: String, // Changed to String to store Firebase UID
  reviewer_name: String,
  reviewer_avatar: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  skill_taught: String,
  date: { type: Date, default: Date.now }
});

const UserSchema = new Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  photo_url: String,
  location: String,
  skills_offered: [String],
  bio: String,
  skills_wanted: [String],
  availability: String,
  is_public: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  total_swaps: { type: Number, default: 0 },
  completed_swaps: { type: Number, default: 0 },
  joined_date: { type: Date, default: Date.now },
  reviews: [ReviewSchema],
});

export default models.User || model('User', UserSchema); 