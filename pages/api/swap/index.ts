import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Swap from '@/lib/models/Swap';
import User from '@/lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    const { from_user_email, to_user_email, offered_skill, wanted_skill, message } = req.body;
    // Look up user IDs by email
    const fromUser = await User.findOne({ email: from_user_email });
    const toUser = await User.findOne({ email: to_user_email });
    if (!fromUser || !toUser) {
      return res.status(400).json({ error: 'User not found' });
    }
    const swap = await Swap.create({
      from_user_id: fromUser._id,
      to_user_id: toUser._id,
      offered_skill,
      wanted_skill,
      message,
      status: 'pending',
    });

    // Create notification for the recipient
    try {
      const { NotificationService } = await import('@/lib/services/notificationService');
      await NotificationService.createSwapRequestNotification(
        swap._id.toString(),
        fromUser._id.toString(),
        toUser._id.toString()
      );
    } catch (error) {
      console.error('Error creating notification:', error);
      // Don't fail the swap creation if notification fails
    }

    return res.status(201).json(swap);
  }

  if (req.method === 'GET') {
    const { user_id } = req.query;
    const swaps = await Swap.find({ $or: [{ from_user_id: user_id }, { to_user_id: user_id }] });
    return res.status(200).json(swaps);
  }

  res.setHeader('Allow', ['POST', 'GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 