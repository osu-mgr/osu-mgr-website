import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const body = JSON.parse(req.body);
  if (!body) return res.status(500).send('Missing body');
  if (req.query.fileExists !== undefined) {
    const fileExists = (await fetch(body.url, { mode: 'no-cors', method: 'HEAD' })).ok;
    res.status(fileExists && 200 || 204).send('');
  } else {
    res.status(500).send('Missing query parameters');
  }
};

