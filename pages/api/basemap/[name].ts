import { NextApiRequest, NextApiResponse } from 'next';
import { THUMBNAIL_IMAGES } from '../../../components/search/basemap';

// The result thumbnails' basemap images (THUMBNAIL_IMAGES), fetched from Esri
// and cached by the CDN, so Esri is only asked when its copy expires.
//   /api/basemap/world    the whole world
//   /api/basemap/arctic   the Arctic band past Web Mercator's limit
export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const url = THUMBNAIL_IMAGES[req.query.name as string];
  if (!url) return res.status(404).json({ message: 'Unknown image' });
  try {
    const response = await fetch(url);
    const type = response.headers.get('content-type') || '';
    // ArcGIS errors come back as JSON or HTML with a 200.
    if (!response.ok || !type.startsWith('image/')) throw new Error(`${response.status} ${type}`);
    res.setHeader('Content-Type', type);
    // A day in browsers, 30 days on the CDN: the basemap rarely changes.
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800');
    res.status(200).send(Buffer.from(await response.arrayBuffer()));
  } catch (e: any) {
    console.error('Basemap image failed:', req.query.name, e.message);
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ message: 'Basemap image unavailable' });
  }
};
