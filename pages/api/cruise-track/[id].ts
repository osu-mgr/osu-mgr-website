import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@opensearch-project/opensearch';
import { r2rCruiseLinks } from '../../../components/search/search-data';
import { MapPoint, toMapPoint } from '../../../components/search/map-points';

// A cruise's ship track, drawn behind its records in their modals' maps:
//   /api/cruise-track/OSU-RR1310 → { source, id, geometry } (or 404)
// From R2R's navigation tracks (the modern US academic fleet), else NOAA
// NCEI's marine trackline surveys (back to the 1960s). A track found by
// anything less certain than the site's own R2R link must pass near the
// cruise's stations. The geometry is a MultiLineString, simplified to ~500 m,
// with longitudes kept continuous along each line; cached by the CDN.
const client: Client = new Client({ node: process.env.OS_NODE });
const isProd = process.env.NEXT_PUBLIC_TINA_BRANCH === 'prod';
const index = 'osu-mgr-ldeo-test1';

const R2R_TRACKS = 'https://service.rvdata.us/api/nav_tracks/?cruise_id=';
const NCEI_TRACKLINES = 'https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer/0/query';
// NCEI survey IDs are often a cruise's code with a two-letter ship suffix.
const SHIP_SUFFIXES = ['', 'MV', 'RR', 'TN', 'EW', 'KM'];
const SIMPLIFY_DEGREES = 0.005;
// A track passes near a cruise when this share of its stations is within
// NEAR_KM of it.
const NEAR_KM = 25;
const NEAR_SHARE = 0.5;
const TIMEOUT_MS = 20000;

type Line = [number, number][];

const fetchJson = async (url: string) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${response.status} from ${new URL(url).host}`);
  return response.json();
};

const linesOf = (geometry: any): Line[] =>
  geometry?.type === 'LineString' ? [geometry.coordinates]
    : geometry?.type === 'MultiLineString' ? geometry.coordinates : [];

// Douglas-Peucker, in degrees.
const simplify = (line: Line): Line => {
  if (line.length < 3) return line;
  const keep = new Uint8Array(line.length);
  keep[0] = keep[line.length - 1] = 1;
  const stack: [number, number][] = [[0, line.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop()!;
    const [[x0, y0], [x1, y1]] = [line[first], line[last]];
    const [dx, dy] = [x1 - x0, y1 - y0];
    const length = Math.hypot(dx, dy) || 1e-12;
    let [furthest, distance] = [-1, SIMPLIFY_DEGREES];
    for (let i = first + 1; i < last; i++) {
      const d = Math.abs(dy * line[i][0] - dx * line[i][1] + x1 * y0 - y1 * x0) / length;
      if (d > distance) [furthest, distance] = [i, d];
    }
    if (furthest >= 0) {
      keep[furthest] = 1;
      stack.push([first, furthest], [furthest, last]);
    }
  }
  return line.filter((_, i) => keep[i]);
};

// Each vertex's longitude as the copy nearest the one before it, so that a
// line crossing the antimeridian doesn't wrap round the globe.
const unwrap = (line: Line): Line => {
  let previous = line[0]?.[0] ?? 0;
  return line.map(([lon, lat]) => {
    previous = lon + 360 * Math.round((previous - lon) / 360);
    return [previous, lat];
  });
};

// The share of stations within NEAR_KM of the track (on a local flat
// approximation, fine at that distance).
const nearShare = (lines: Line[], stations: MapPoint[]) => {
  const near = stations.filter(({ lat, lon }) => {
    const kmPerLon = 111.32 * Math.cos(lat * Math.PI / 180);
    return lines.some(line => line.some(([lon0, lat0], i) => {
      const [lon1, lat1] = line[i + 1] ?? line[i];
      const toKm = (x: number, y: number): [number, number] => [(x + 360 * Math.round((lon - x) / 360) - lon) * kmPerLon, (y - lat) * 110.57];
      const [a, b] = [toKm(lon0, lat0), toKm(lon1, lat1)];
      const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
      const t = dx || dy ? Math.min(Math.max(-(a[0] * dx + a[1] * dy) / (dx * dx + dy * dy), 0), 1) : 0;
      return Math.hypot(a[0] + t * dx, a[1] + t * dy) <= NEAR_KM;
    }));
  });
  return near.length / stations.length;
};

const r2rTrack = async (id: string) => linesOf((await fetchJson(R2R_TRACKS + encodeURIComponent(id)))?.data?.[0]?.gis_geom);

const nceiQuery = (params: Record<string, string>) =>
  fetchJson(`${NCEI_TRACKLINES}?${new URLSearchParams({ f: 'json', returnGeometry: 'false', ...params })}`);
const nceiTrack = async (surveyId: string) => {
  const body = await fetchJson(`${NCEI_TRACKLINES}?${new URLSearchParams({
    where: `SURVEY_ID='${surveyId.replace(/'/g, "''")}'`,
    outFields: 'SURVEY_ID',
    returnGeometry: 'true',
    outSR: '4326',
    maxAllowableOffset: String(SIMPLIFY_DEGREES),
    f: 'geojson',
  })}`);
  // Its layers can hold a survey more than once; the most detailed wins.
  return (body.features || []).map((feature: any) => linesOf(feature.geometry))
    .sort((a: Line[], b: Line[]) => b.flat().length - a.flat().length)[0] || [];
};
// NCEI surveys that may be the cruise: by ID (its code, with or without a
// ship suffix), then on the same ship within a year with its cruise number.
const nceiCandidates = async (codes: string[], rvName: string, year: number) => {
  const ids = [...new Set(codes.flatMap(code => SHIP_SUFFIXES.map(suffix => code + suffix)))]
    .filter(id => /^[A-Z0-9-]+$/.test(id));
  const byId: string[] = ids.length
    ? ((await nceiQuery({ where: `UPPER(SURVEY_ID) IN (${ids.map(id => `'${id}'`).join(',')})`, outFields: 'SURVEY_ID' })).features || [])
      .map((f: any) => f.attributes.SURVEY_ID)
    : [];
  const ship = rvName.replace(/[^A-Za-z ]/g, '').trim();
  const numbers = codes.map(code => code.replace(/\D/g, '')).filter(digits => digits.length >= 3);
  const byShip: string[] = ship && year && numbers.length
    ? ((await nceiQuery({
      where: `UPPER(PLATFORM) LIKE UPPER('%${ship}%') AND START_YR >= ${year - 1} AND START_YR <= ${year + 1}`,
      outFields: 'SURVEY_ID',
      returnDistinctValues: 'true',
    })).features || [])
      .map((f: any) => f.attributes.SURVEY_ID as string)
      .filter(id => numbers.some(digits => (id || '').replace(/\D/g, '').includes(digits)))
    : [];
  return { byId: [...new Set(byId)], byShip: [...new Set(byShip)].filter(id => !byId.includes(id)) };
};

const findTrack = async (cruise: any) => {
  const osuid: string = cruise._osuid;
  const code = osuid.replace(/^LDCR-/, '').toUpperCase();
  const codes = [...new Set([code, String(cruise.cruise || '').toUpperCase()].filter(Boolean))];
  const stations = ((cruise._locations || []) as any[]).map(loc => toMapPoint(loc, 'core')).filter((p): p is MapPoint => p !== null);
  const passes = (lines: Line[], required: boolean) =>
    lines.length > 0 && (stations.length ? nearShare(lines, stations) >= NEAR_SHARE : !required);
  // R2R: the site's links to it are the cruise's own; its code may not be.
  const linked = (r2rCruiseLinks[osuid] || []).map(url => url.match(/cruise\/([^/?#]+)/)?.[1]).filter(Boolean) as string[];
  for (const id of linked) {
    const lines = await r2rTrack(id);
    if (passes(lines, false)) return { source: 'r2r', id, lines };
  }
  for (const id of codes.filter(c => !linked.includes(c))) {
    const lines = await r2rTrack(id);
    if (passes(lines, false)) return { source: 'r2r', id, lines };
  }
  const year = Number(String(cruise.startDate || '').slice(0, 4)) || 0;
  const { byId, byShip } = await nceiCandidates(codes, String(cruise.rvName || ''), year);
  for (const [ids, required] of [[byId, false], [byShip, true]] as [string[], boolean][]) {
    for (const id of ids) {
      const lines = await nceiTrack(id);
      if (passes(lines, required)) return { source: 'ncei', id, lines };
    }
  }
  return null;
};

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const osuid = String(req.query.id || '');
  try {
    const found = await client.search({ index, body: {
      size: 1,
      _source: ['_osuid', 'cruise', 'rvName', 'startDate', '_locations'],
      query: { bool: {
        filter: [{ term: { '_osuid.keyword': osuid } }, { term: { '_docType.keyword': 'cruise' } }],
        // As pages/api/opensearch.ts: records with data errors are hidden on prod.
        ...(isProd && { must_not: [{ exists: { field: '_errors' } }] }),
      } },
    } } as any);
    const cruise = (found.body.hits.hits as any[])[0]?._source;
    const track = cruise && await findTrack(cruise);
    if (!track) {
      // Sources gain cruises, so a miss is kept for a day.
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      return res.status(404).json({ message: 'No track for this cruise' });
    }
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800');
    res.status(200).json({
      source: track.source,
      id: track.id,
      geometry: { type: 'MultiLineString', coordinates: track.lines.map(line => unwrap(simplify(line))).filter(line => line.length > 1) },
    });
  } catch (e: any) {
    console.error('Cruise track failed:', osuid, e.message);
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ message: 'Cruise track unavailable' });
  }
};
