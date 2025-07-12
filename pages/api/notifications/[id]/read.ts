import type { NextApiRequest, NextApiResponse } from 'next';
import { NotificationService } from '@/lib/services/notificationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id } = req.query;
    const { user_id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Notification ID is required' });
    }

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const notification = await NotificationService.markAsRead(id as string, user_id);
      
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      
      return res.status(200).json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 