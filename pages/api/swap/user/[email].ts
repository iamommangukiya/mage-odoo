import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Swap from '@/lib/models/Swap';
import User from '@/lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get all swaps where user is either sender or receiver
      const swaps = await Swap.find({
        $or: [
          { from_user_id: user._id },
          { to_user_id: user._id }
        ]
      }).populate('from_user_id', 'name photo_url email')
        .populate('to_user_id', 'name photo_url email')
        .sort({ created_at: -1 });

      // Transform the data for frontend consumption
      const transformedSwaps = swaps.map(swap => {
        const isFromUser = swap.from_user_id._id.toString() === user._id.toString();
        
        return {
          id: swap._id,
          status: swap.status,
          offered_skill: swap.offered_skill,
          wanted_skill: swap.wanted_skill,
          message: swap.message,
          created_at: swap.created_at,
          updated_at: swap.updated_at || swap.created_at,
          // For sent requests
          targetUser: isFromUser ? {
            name: swap.to_user_id.name,
            email: swap.to_user_id.email,
            avatar: swap.to_user_id.photo_url
          } : null,
          // For received requests
          fromUser: !isFromUser ? {
            name: swap.from_user_id.name,
            email: swap.from_user_id.email,
            avatar: swap.from_user_id.photo_url
          } : null,
          // Skills
          mySkill: isFromUser ? swap.offered_skill : swap.wanted_skill,
          theirSkill: !isFromUser ? swap.offered_skill : swap.wanted_skill,
          wantedSkill: isFromUser ? swap.wanted_skill : swap.offered_skill,
          // Type
          type: isFromUser ? 'sent' : 'received'
        };
      });

      return res.status(200).json(transformedSwaps);
    } catch (error) {
      console.error('Error fetching swaps:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 