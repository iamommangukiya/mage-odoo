import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Swap from '@/lib/models/Swap';
import User from '@/lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'PUT') {
    const { id } = req.query;
    const { status, user_email } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Swap ID is required' });
    }

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid status (accepted/rejected) is required' });
    }

    if (!user_email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    try {
      // Find the swap
      const swap = await Swap.findById(id);
      if (!swap) {
        return res.status(404).json({ error: 'Swap not found' });
      }

      // Find the user
      const user = await User.findOne({ email: user_email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user is the receiver of this swap
      if (swap.to_user_id.toString() !== user._id.toString()) {
        return res.status(403).json({ error: 'You can only accept/reject swaps sent to you' });
      }

      // Update swap status
      swap.status = status;
      swap.updated_at = new Date();
      await swap.save();

      // If accepted, update user stats
      if (status === 'accepted') {
        // Update both users' completed_swaps count
        await User.findByIdAndUpdate(swap.from_user_id, {
          $inc: { completed_swaps: 1 }
        });
        await User.findByIdAndUpdate(swap.to_user_id, {
          $inc: { completed_swaps: 1 }
        });
      }

      // Create notification for the sender
      try {
        const { NotificationService } = await import('@/lib/services/notificationService');
        if (status === 'accepted') {
          await NotificationService.createSwapAcceptedNotification(
            swap._id.toString(),
            swap.from_user_id.toString(),
            swap.to_user_id.toString()
          );
        } else if (status === 'rejected') {
          await NotificationService.createSwapRejectedNotification(
            swap._id.toString(),
            swap.from_user_id.toString(),
            swap.to_user_id.toString()
          );
        }
      } catch (error) {
        console.error('Error creating notification:', error);
        // Don't fail the status update if notification fails
      }

      return res.status(200).json({ 
        message: `Swap ${status} successfully`,
        swap 
      });
    } catch (error) {
      console.error('Error updating swap status:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 