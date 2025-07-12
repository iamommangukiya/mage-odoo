import type { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from 'cloudinary';
import { IncomingForm } from 'formidable';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('✅ Cloudinary configured');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const data = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const form = new IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Form parse error:', err);
          return reject({ error: 'Form parse error' });
        }
        console.log('FILES:', files);
        const fileArray = Array.isArray(files.file) ? files.file : [files.file];
        const file = fileArray[0];
        try {
          const result = await cloudinary.v2.uploader.upload(file.filepath);
          resolve({ secure_url: result.secure_url });
        } catch (error) {
          console.error('Cloudinary upload failed:', error);
          reject({ error: 'Cloudinary upload failed' });
        }
      });
    });
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json(error);
  }
} 