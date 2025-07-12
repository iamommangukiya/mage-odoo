import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Swap from '@/lib/models/Swap';
import User from '@/lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  // Get user email from Authorization header or query parameter
  const userEmail = req.headers.authorization?.replace('Bearer ', '') || req.query.email as string;
  
  if (!userEmail) {
    return res.status(401).json({ error: 'User email is required' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Find current user
    const currentUser = await User.findOne({ email: userEmail });
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find all accepted swaps where current user is involved
    const acceptedSwaps = await Swap.find({
      $or: [
        { from_user_id: currentUser._id },
        { to_user_id: currentUser._id }
      ],
      status: 'accepted'
    }).populate('from_user_id', 'name email photo_url')
      .populate('to_user_id', 'name email photo_url');

    // Transform data to get the other user for each swap
    const chatUsers = acceptedSwaps.map(swap => {
      let otherUser, skillOffered, skillWanted;
      if (swap.from_user_id._id.toString() === currentUser._id.toString()) {
        otherUser = swap.to_user_id;
        skillOffered = swap.offered_skill;
        skillWanted = swap.wanted_skill;
      } else {
        otherUser = swap.from_user_id;
        skillOffered = swap.wanted_skill;
        skillWanted = swap.offered_skill;
      }
      // Debug log
      // console.log('Returning other user:', otherUser.name, otherUser.email);
      return {
        swapId: swap._id,
        user: {
          id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          avatar: otherUser.photo_url || '/placeholder-user.jpg',
          skillOffered,
          skillWanted,
        },
        swap: {
          offered_skill: swap.offered_skill,
          wanted_skill: swap.wanted_skill,
          created_at: swap.created_at,
        }
      };
    });

    return res.status(200).json(chatUsers);
  } catch (error) {
    console.error('Error fetching accepted swap users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 