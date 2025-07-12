import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Message from '@/lib/models/Message';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { swap_id } = req.query;
  
  if (req.method === 'GET') {
    try {
      const messages = await Message.find({ swap_id })
        .populate('from_user_id', 'name email photo_url')
        .sort({ created_at: 1 });

      // Transform messages to include sender info
      const transformedMessages = messages.map(msg => ({
        id: msg._id,
        swap_id: msg.swap_id,
        from_user_id: msg.from_user_id._id,
        to_user_id: msg.to_user_id,
        message: msg.message,
        status: msg.status,
        created_at: msg.created_at,
        sender: {
          name: msg.from_user_id.name,
          email: msg.from_user_id.email,
          avatar: msg.from_user_id.photo_url || '/placeholder-user.jpg'
        }
      }));

      return res.status(200).json(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 