import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(user);
  }

  if (req.method === 'PUT') {
    const update = req.body;
    
    // Handle field name mapping for backward compatibility
    const mappedUpdate = { ...update };
    if (update.swaps !== undefined) {
      mappedUpdate.total_swaps = update.swaps;
      delete mappedUpdate.swaps;
    }
    
    const user = await User.findOneAndUpdate(
      { email: update.email },
      mappedUpdate,
      { new: true, upsert: true }
    );
    console.log(`✅ User upserted in MongoDB: ${update.email}`);
    return res.status(200).json(user);
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 