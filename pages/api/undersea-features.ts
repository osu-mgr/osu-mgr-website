import { NextApiRequest, NextApiResponse } from 'next';

// The maps' undersea feature names: the IHO-IOC GEBCO Gazetteer of Undersea
// Feature Names, from its feature service (hosted by NOAA NCEI), as one
// GeoJSON collection cached by the CDN. Each feature has a name (with its
// generic type, e.g. "Gorda Ridge") and a kind: point (seamounts, knolls, …)
// and line (ridges, trenches, …) features keep their geometry; areas (basins,
// plains, …) are the middle of their outline, as a point.
const SERVICE = 'https://services2.arcgis.com/C8EMgrsFcRFL6LrL/arcgis/rest/services/Undersea_Features/FeatureServer';
const LAYERS: [number, 'point' | 'line' | 'area'][] = [[0, 'point'], [1, 'line'], [2, 'area']];
const PAGE = 2000;

const query = async (layer: number) => {
  const features: any[] = [];
  for (let offset = 0; ; offset += PAGE) {
    // Simplified to ~1 km, which is finer than labels need.
    const url = `${SERVICE}/${layer}/query?where=1%3D1&outFields=NAME,TYPE&returnGeometry=true&geometryPrecision=3&maxAllowableOffset=0.01&resultOffset=${offset}&resultRecordCount=${PAGE}&f=geojson`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} for layer ${layer}`);
    const body = await response.json();
    if (!Array.isArray(body.features)) throw new Error(`No features for layer ${layer}`);
    features.push(...body.features);
    if (body.features.length < PAGE) return features;
  }
};

// "Gorda" + "Ridge" → "Gorda Ridge", unless the name already says it.
const labelOf = (name: string, type: string) =>
  !type || name.toLowerCase().includes(type.toLowerCase()) ? name : `${name} ${type}`;

// The mean of an area's outer ring(s), with longitudes taken near the first
// one so that it can straddle the antimeridian.
const middleOf = (geometry: any): [number, number] | null => {
  const rings: number[][][] = geometry?.type === 'Polygon' ? [geometry.coordinates[0]]
    : geometry?.type === 'MultiPolygon' ? geometry.coordinates.map((polygon: number[][][]) => polygon[0]) : [];
  const points = rings.flat();
  if (!points.length) return null;
  const lon0 = points[0][0];
  const near = (lon: number) => lon + 360 * Math.round((lon0 - lon) / 360);
  const lon = points.reduce((sum, [lon]) => sum + near(lon), 0) / points.length;
  const lat = points.reduce((sum, [, lat]) => sum + lat, 0) / points.length;
  return [((lon + 540) % 360) - 180, lat];
};

export default async (_req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    const layers = await Promise.all(LAYERS.map(([layer]) => query(layer)));
    const features = LAYERS.flatMap(([, kind], i) => layers[i].flatMap((feature: any) => {
      const { NAME, TYPE } = feature.properties || {};
      if (!NAME || !feature.geometry) return [];
      const properties = { name: labelOf(String(NAME).trim(), String(TYPE || '').trim()), kind };
      if (kind !== 'area') return [{ type: 'Feature', properties, geometry: feature.geometry }];
      const middle = middleOf(feature.geometry);
      return middle ? [{ type: 'Feature', properties, geometry: { type: 'Point', coordinates: middle } }] : [];
    }));
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800');
    res.status(200).json({ type: 'FeatureCollection', features });
  } catch (e: any) {
    console.error('Undersea features failed:', e.message);
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ message: 'Undersea features unavailable' });
  }
};
