import { NextApiRequest, NextApiResponse } from 'next';
import xlsx from 'xlsx';

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (!req.body) return res.status(500).send('Missing body');
  if (req.query.fileExists !== undefined) {
    const fileExists = (await fetch(`${process.env.COLLECTION}${req.body.url}`, {
      mode: 'no-cors',
      method: 'HEAD'
    })).ok;
    res.status(fileExists && 200 || 204).send('');
  } else if (req.query.moratoriums !== undefined) {
    const moratoriums = await fetch(`${process.env.COLLECTION}moratorium.xlsx`, {
      mode: 'no-cors',
      method: 'HEAD'
    });
    if (moratoriums.ok) {
      const workbook = xlsx.read(moratoriums.body, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const moratoriumData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
      res.status(200).json(moratoriumData);
    } else {
      res.status(404).send('Moratoriums file not found');
    }
  } else {
    res.status(500).send('Missing query parameters');
  }
};