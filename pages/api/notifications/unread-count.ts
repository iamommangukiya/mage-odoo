import type { NextApiRequest, NextApiResponse } from 'next';
import { NotificationService } from '@/lib/services/notificationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const count = await NotificationService.getUnreadCount(user_id as string);
      
      return res.status(200).json({ count });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 