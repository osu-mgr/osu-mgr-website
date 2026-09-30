import numeral from 'numeral';
import { MERCATOR_LAT } from './basemap';

// Records plotted on the maps, and their tooltips. Record types that carry
// their own coordinates: sections sit at their core's position, rocks at
// their dredge/dive's, and cruises are the sum of their stations.
export const LAYERS = [
  { type: 'core', label: 'Cores', color: '#D73F09' },
  { type: 'dive', label: 'Dredges/Dives', color: '#2563eb' },
];
export const LAYER_BY_TYPE = Object.fromEntries(LAYERS.map(l => [l.type, l]));
export const layerFor = (type: string) => LAYER_BY_TYPE[type] || LAYERS[0];

export type Mode = 'globe' | 'flat' | 'north' | 'south';
// bounds: [west, south, east, north] of a record's start and end positions,
// with east past 180 when the box crosses the antimeridian; lat/lon is then
// the box's centre.
// muted: drawn in grey under the others and not labelled (see labelPoints),
// for records shown around the one of interest, like the rest of its cruise's
// stations. Its tooltip still shows on hover.
export type MapPoint = { name: string; type: string; lat: number; lon: number; bounds?: [number, number, number, number]; muted?: boolean };

const toNumber = (v: unknown): number => (v == null || v === '' ? NaN : parseFloat(v as string));
const toLat = (v: unknown) => {
  const lat = toNumber(v);
  return Math.abs(lat) <= 90 ? lat : NaN;
};
const toLon = (v: unknown) => {
  let lon = toNumber(v);
  if (lon > 180) lon -= 360;
  return Math.abs(lon) <= 180 ? lon : NaN;
};

// A record's position from its latitude/longitude Start and End fields.
export const toMapPoint = (source: any, type: string): MapPoint | null => {
  const name = source._osuid;
  const [latStart, latEnd] = [toLat(source.latitudeStart), toLat(source.latitudeEnd)];
  const [lonStart, lonEnd] = [toLon(source.longitudeStart), toLon(source.longitudeEnd)];
  if (![latStart, latEnd, lonStart, lonEnd].some(isNaN) && (latStart !== latEnd || lonStart !== lonEnd)) {
    const [south, north] = [Math.min(latStart, latEnd), Math.max(latStart, latEnd)];
    let [west, east] = [Math.min(lonStart, lonEnd), Math.max(lonStart, lonEnd)];
    if (east - west > 180) [west, east] = [east, west + 360];
    // MapLibre can't draw areas past Web Mercator's limit. Boxes of any other
    // size are drawn, so that a typo in a coordinate shows as a huge box.
    if (Math.max(-south, north) < MERCATOR_LAT) {
      const lon = (west + east) / 2;
      return { name, type, lat: (south + north) / 2, lon: lon > 180 ? lon - 360 : lon, bounds: [west, south, east, north] };
    }
  }
  const lat = isNaN(latStart) ? latEnd : latStart;
  const lon = isNaN(lonStart) ? lonEnd : lonStart;
  return isNaN(lat) || isNaN(lon) ? null : { name, type, lat, lon };
};

// Spherical mean of the points (average of their unit vectors), so a cruise
// straddling the antimeridian centres on its stations rather than the far
// side of the globe. Returns [lon, lat], or null for no points.
export const sphericalCentroid = (points: MapPoint[]): [number, number] | null => {
  if (!points.length) return null;
  const rad = Math.PI / 180;
  let [x, y, z] = [0, 0, 0];
  points.forEach(p => {
    x += Math.cos(p.lat * rad) * Math.cos(p.lon * rad);
    y += Math.cos(p.lat * rad) * Math.sin(p.lon * rad);
    z += Math.sin(p.lat * rad);
  });
  return [Math.atan2(y, x) / rad, Math.atan2(z, Math.hypot(x, y)) / rad];
};

// Records of one type at one spot (to ~10 m), which share a marker.
export const pointKey = (p: MapPoint) => `${p.muted ? 'muted|' : ''}${p.type}|${p.lat.toFixed(4)}|${p.lon.toFixed(4)}`;
export const colocatedIndex = (points: MapPoint[]) => {
  const index = new Map<string, MapPoint[]>();
  points.forEach(p => {
    const key = pointKey(p);
    const group = index.get(key);
    if (group) group.push(p);
    else index.set(key, [p]);
  });
  return index;
};

const MAX_TOOLTIP_IDS = 12;
const escapeHtml = (text: string) => text.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

// Field names in the tooltips, lighter than their values.
const TOOLTIP_LABEL_STYLE = 'color:#6b7280';

// Tooltip HTML for the records at one spot (their type is the marker's
// colour). With several, their IDs are links (data-osuid) that the map opens
// on click.
export const markerTooltip = (members: MapPoint[]) => {
  if (members.length === 1) return escapeHtml(members[0].name);
  const link = (m: MapPoint) =>
    `<a data-osuid="${escapeHtml(m.name)}" style="cursor:pointer;color:#D73F09;text-decoration:underline">${escapeHtml(m.name)}</a>`;
  const more = members.length > MAX_TOOLTIP_IDS ? `<br/>and ${members.length - MAX_TOOLTIP_IDS} more` : '';
  return `<span style="${TOOLTIP_LABEL_STYLE}">${numeral(members.length).format('0,0')} at one location:</span><br/>${members.slice(0, MAX_TOOLTIP_IDS).map(link).join('<br/>')}${more}`;
};

// A cruise's track, for its tooltips: the cruise's ID, R/V and PI, and its
// stations (the cores and dredges/dives along it) with their R/V, PI and
// start and end dates as shown, and time (ms) to put them in order.
export type TrackStop = { lon: number; lat: number; rv?: string; pi?: string; start?: string; end?: string; time?: number };
export type TrackInfo = { name?: string; rv?: string; pi?: string; stops?: TrackStop[] };
const INFERRED_BADGE = '<span style="margin-left:6px;padding:0 4px;border-radius:3px;border:1px solid #d1d5db;background:#f3f4f6;'
  + 'color:#6b7280;font-size:9px;font-weight:600;letter-spacing:0.04em;vertical-align:1px">INFERRED</span>';

// Tooltip HTML for the stretch of track between two stations (either missing
// before the first or after the last): the cruise, the stations' R/V and PI
// (else the cruise's), and the dates from leaving one to reaching the other.
// Inferred tracks (the stations joined in order) are badged.
export const trackTooltip = (info: TrackInfo, approximate: boolean, a?: TrackStop, b?: TrackStop) => {
  const [first, second] = a?.time != null && b?.time != null && a.time > b.time ? [b, a] : [a, b];
  const values = (key: 'rv' | 'pi', fallback?: string) => {
    const found = [...new Set([first?.[key], second?.[key]].filter((v): v is string => Boolean(v)))];
    return found.length ? found.join(', ') : fallback;
  };
  const from = first ? first.end || first.start : undefined;
  const to = second ? second.start || second.end : undefined;
  const dates = from && to && from !== to ? `${from} – ${to}` : from || to;
  const rows = ([['R/V', values('rv', info.rv)], ['PI', values('pi', info.pi)], ['Date', dates]] as const)
    .filter(([, value]) => value)
    .map(([label, value]) => `<br/><span style="${TOOLTIP_LABEL_STYLE}">${label}:</span> ${escapeHtml(value!)}`);
  return `${escapeHtml(info.name || 'Cruise track')}${approximate ? INFERRED_BADGE : ''}${rows.join('')}`;
};

// Geospatial filter area: [west, south, east, north] in degrees, with east
// past 180 when it crosses the antimeridian (as MapPoint bounds).
export type Area = [number, number, number, number];
const formatLat = (lat: number) => `${Math.abs(lat).toFixed(2)}°${lat < 0 ? 'S' : 'N'}`;
const formatLon = (lon: number) => {
  const wrapped = ((lon + 540) % 360) - 180;
  return Math.abs(wrapped) === 180 ? '180.00°' : `${Math.abs(wrapped).toFixed(2)}°${wrapped < 0 ? 'W' : 'E'}`;
};
export const formatArea = ([west, south, east, north]: Area) => ({
  latitude: `${formatLat(south)} to ${formatLat(north)}`,
  // As added over a pole view, an area can go all the way round.
  longitude: east - west >= 360 ? 'All longitudes' : `${formatLon(west)} to ${formatLon(east)}`,
});

export const WHOLE_GLOBE: Area = [-180, -90, 180, 90];
// Margin around areaAround's points, as a share of the area's size (with a
// minimum), so the outermost points aren't on its edge.
const AREA_MARGIN = 0.02;
const AREA_MIN_MARGIN = 0.1;
// The smallest area around the points (boxes included), with a margin. Its
// longitudes leave out the widest gap between the points' longitudes, so
// points either side of the antimeridian get an area across it.
export const areaAround = (points: MapPoint[]): Area | null => {
  const corners = points.flatMap(p => (p.bounds ? [[p.bounds[0], p.bounds[1]], [p.bounds[2], p.bounds[3]]] : [[p.lon, p.lat]]));
  if (!corners.length) return null;
  const lats = corners.map(([, lat]) => lat);
  const lons = [...new Set(corners.map(([lon]) => ((lon + 540) % 360) - 180))].sort((a, b) => a - b);
  // The gap after each longitude, the last one wrapping round to the first.
  let [widest, after] = [-1, 0];
  lons.forEach((lon, i) => {
    const gap = (i + 1 < lons.length ? lons[i + 1] : lons[0] + 360) - lon;
    if (gap > widest) [widest, after] = [gap, i];
  });
  let [west, east] = after === lons.length - 1 ? [lons[0], lons[after]] : [lons[after + 1], lons[after] + 360];
  let [south, north] = [Math.min(...lats), Math.max(...lats)];
  const lonMargin = Math.max((east - west) * AREA_MARGIN, AREA_MIN_MARGIN);
  const latMargin = Math.max((north - south) * AREA_MARGIN, AREA_MIN_MARGIN);
  [west, east] = east - west + 2 * lonMargin >= 360 ? [-180, 180] : [west - lonMargin, east + lonMargin];
  [south, north] = [Math.max(south - latMargin, -90), Math.min(north + latMargin, 90)];
  return [west, south, east, north];
};

// A cruise's stations joined in order, for when its real track isn't known:
// by ID in natural order (D2 before D10), without repeats of one spot, and
// with each longitude near the one before so it doesn't wrap round the globe.
const naturalCompare = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
export const stationLine = (points: MapPoint[]): GeoJSON.LineString | null => {
  const coordinates: [number, number][] = [];
  [...points].sort((a, b) => naturalCompare(a.name, b.name)).forEach(({ lon, lat }) => {
    const previous = coordinates[coordinates.length - 1];
    const near = previous ? lon + 360 * Math.round((previous[0] - lon) / 360) : lon;
    if (!previous || previous[0] !== near || previous[1] !== lat) coordinates.push([near, lat]);
  });
  return coordinates.length > 1 ? { type: 'LineString', coordinates } : null;
};
