import type { NextApiRequest, NextApiResponse } from 'next';
import { NotificationService } from '@/lib/services/notificationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { user_id, limit = '20' } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const notifications = await NotificationService.getUserNotifications(
        user_id as string, 
        parseInt(limit as string)
      );
      
      return res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 