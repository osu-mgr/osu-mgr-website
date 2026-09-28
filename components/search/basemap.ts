// The maps' basemap: Esri Ocean, whose Web Mercator tiles stop at ±85.05°.
// Past that, polar-caps.ts draws the polar caps (POLAR_CAPS).
export const BASEMAP_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';
// Open-ocean tiles stop at zoom 10 (deeper levels are "Map data not yet
// available"); past it, tiles are over-zoomed.
export const BASEMAP_MAXZOOM = 10;
export const BASEMAP_ATTRIBUTION = 'Esri, GEBCO, NOAA, National Geographic, DeLorme, HERE, Geonames.org, and other contributors';
// Labels over it, which the maps can turn off (open data rather than Esri's):
// - places, water bodies and boundaries: OpenStreetMap's, from OpenFreeMap's
//   vector tiles, drawn with its Positron style's layers;
// - undersea features: the IHO-IOC GEBCO Gazetteer of Undersea Feature Names,
//   served from this site (pages/api/undersea-features) so the CDN caches it.
export const PLACE_LABEL_STYLE = 'https://tiles.openfreemap.org/styles/positron';
export const UNDERSEA_FEATURES = '/api/undersea-features';
export const UNDERSEA_ATTRIBUTION = 'IHO-IOC GEBCO Gazetteer of Undersea Feature Names';

export const MERCATOR_LAT = 85.0511287798;
export type Pole = 'north' | 'south';

// A cache of 256-pixel tiles ({z}/{y}/{x}) in an ellipsoidal polar
// stereographic projection with scale factor k0 at the pole, in the ArcGIS
// layout: level 0 is one tile whose top-left corner is origin, and each level
// halves the resolution (metres per pixel). Levels below minLevel are too
// coarse to be worth drawing. generalise is for basemaps whose own tiles
// smooth out relief when zoomed out: the cap is blended (by weight) with a
// blurred copy of itself (a mipmap bias), fully below pixelsPerDegree[0] at
// its edge and not at all past pixelsPerDegree[1].
export type PolarTiles = {
  url: string;
  lon0: number;
  k0: number;
  falseEasting: number;
  falseNorthing: number;
  origin: [number, number];
  resolution: number;
  minLevel: number;
  maxLevel: number;
  generalise?: { bias: number; weight: number; pixelsPerDegree: [number, number] };
};
// colors: [map zoom, colour] steps, each from its zoom until the next's.
export type PolarCap = { tiles: PolarTiles } | { colors: [number, string][] };

export const POLAR_CAPS: Partial<Record<Pole, PolarCap>> = {
  // The same basemap in Esri's Arctic polar stereographic (EPSG:5936), whose
  // tiles also stop at level 10 (~230 m). Level 6 is the four tiles around
  // the pole, ~300 pixels across the cap.
  north: {
    tiles: {
      url: 'https://services.arcgisonline.com/arcgis/rest/services/Polar/Arctic_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
      lon0: -150,
      k0: 0.994,
      falseEasting: 2000000,
      falseNorthing: 2000000,
      origin: [-28567784.109255, 32567784.109255],
      resolution: 238810.813354,
      minLevel: 6,
      maxLevel: 10,
      // Zoomed out, the Arctic tiles still draw ridges that the Mercator
      // ones have smoothed away.
      generalise: { bias: 4, weight: 0.9, pixelsPerDegree: [15, 60] },
    },
  },
  // Esri has no Antarctic ocean basemap, but this one is one off-white south
  // of ~78°S, which its tiles change at zooms 1 and 5 (map zooms 0 and 4,
  // with 256-pixel tiles).
  south: { colors: [[-Infinity, '#f6f5f0'], [0, '#e9e8e4'], [4, '#f1f0eb']] },
};

// The basemap as low-resolution plate carrée images for the result
// thumbnails (components/util/collection-map-thumbnail.tsx): Esri's export of
// the whole world, which is blank past Web Mercator's limit, and of its Arctic
// version over the POLAR_ROWS at the top. They're served from this site
// (pages/api/basemap) so the CDN caches them.
export const THUMBNAIL_WIDTH = 1024;
export const THUMBNAIL_HEIGHT = 512;
export const THUMBNAIL_POLAR_ROWS = Math.ceil((90 - MERCATOR_LAT) / 180 * THUMBNAIL_HEIGHT);
const POLAR_DEGREES = THUMBNAIL_POLAR_ROWS * 180 / THUMBNAIL_HEIGHT;
const ESRI = 'https://services.arcgisonline.com/arcgis/rest/services';
export const THUMBNAIL_IMAGES: Record<string, string> = {
  world: `${ESRI}/Ocean/World_Ocean_Base/MapServer/export?bbox=-180,-90,180,90&bboxSR=4326&imageSR=4326&size=${THUMBNAIL_WIDTH},${THUMBNAIL_HEIGHT}&format=jpg&f=image`,
  arctic: `${ESRI}/Polar/Arctic_Ocean_Base/MapServer/export?bbox=-180,${90 - POLAR_DEGREES},180,90&bboxSR=4326&imageSR=4326&size=${THUMBNAIL_WIDTH},${THUMBNAIL_POLAR_ROWS}&format=jpg&f=image`,
};
