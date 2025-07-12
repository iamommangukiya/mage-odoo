import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    const { id } = req.query;
    const { reviewer_id, reviewer_name, reviewer_avatar, rating, comment, skill_taught } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) is required' });
    }

    try {
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Try to find reviewer's profile image from MongoDB
      let reviewerAvatar = reviewer_avatar;
      let reviewerMongoId = null;
      if (reviewer_id) {
        // Look for reviewer by email
        const reviewer = await User.findOne({ email: reviewer_id });
        if (reviewer) {
          reviewerMongoId = reviewer._id.toString();
          if (reviewer.photo_url) {
            reviewerAvatar = reviewer.photo_url;
          }
        }
      }

      // Create new review
      const newReview = {
        reviewer_id: reviewerMongoId || reviewer_id, // Store MongoDB ID if found, otherwise email
        reviewer_name,
        reviewer_avatar: reviewerAvatar,
        rating,
        comment,
        skill_taught,
        date: new Date()
      };

      // Add review to user
      user.reviews.push(newReview);

      // Calculate new average rating
      const totalRating = user.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
      user.rating = totalRating / user.reviews.length;

      await user.save();

      // Create notification for the reviewed user
      try {
        const { NotificationService } = await import('@/lib/services/notificationService');
        await NotificationService.createReviewNotification(
          newReview.reviewer_id,
          user._id.toString(),
          newReview._id.toString()
        );
      } catch (error) {
        console.error('Error creating notification:', error);
        // Don't fail the review creation if notification fails
      }

      return res.status(201).json({ 
        message: 'Review added successfully',
        newRating: user.rating 
      });
    } catch (error) {
      console.error('Error adding review:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 