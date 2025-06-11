import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (!req.body) return res.status(500).send('Missing body');
  if (req.query.fileExists !== undefined) {
    const fileExists = (await fetch(`${process.env.COLLECTION}${req.body.url}`, {
      mode: 'no-cors',
      method: 'HEAD'
    })).ok;
    res.status(fileExists && 200 || 204).send('');
  } else {
    res.status(500).send('Missing query parameters');
  }
};