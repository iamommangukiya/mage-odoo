import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Don't return email for security reasons
      const userData = {
        _id: user._id,
        name: user.name,
        photo_url: user.photo_url,
        location: user.location,
        skills_offered: user.skills_offered,
        bio: user.bio,
        skills_wanted: user.skills_wanted,
        availability: user.availability,
        is_public: user.is_public,
        rating: user.rating,
        total_swaps: user.total_swaps,
        completed_swaps: user.completed_swaps,
        joined_date: user.joined_date,
        reviews: user.reviews
      };

      return res.status(200).json(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 