import React, { useEffect, useRef, useState } from "react";
import { geoOrthographic } from "d3-geo";
import { THUMBNAIL_HEIGHT as HEIGHT, THUMBNAIL_POLAR_ROWS as POLAR_ROWS, THUMBNAIL_WIDTH as WIDTH } from "../search/basemap";

type LocationPoint = {
  latitudeStart?: number | string | null;
  latitudeEnd?: number | string | null;
  longitudeStart?: number | string | null;
  longitudeEnd?: number | string | null;
};

const toPoint = (latRaw: unknown, lonRaw: unknown): [number, number] | null => {
  if (latRaw == null || lonRaw == null) return null;
  const lat = parseFloat(latRaw as string);
  const lon = parseFloat(lonRaw as string);
  return !isNaN(lat) && !isNaN(lon) ? [lon, lat] : null;
};

/**
 * Spherical mean of the points (average of their unit vectors), so a cruise
 * that straddles the antimeridian centres on its stations instead of on the
 * far side of the globe. Returns [lon, lat].
 */
const sphericalCentroid = (points: [number, number][]): [number, number] => {
  if (points.length === 1) return points[0];
  const rad = Math.PI / 180;
  let x = 0, y = 0, z = 0;
  points.forEach(([lon, lat]) => {
    const cosLat = Math.cos(lat * rad);
    x += cosLat * Math.cos(lon * rad);
    y += cosLat * Math.sin(lon * rad);
    z += Math.sin(lat * rad);
  });
  return [
    Math.atan2(y, x) / rad,
    Math.atan2(z, Math.sqrt(x * x + y * y)) / rad,
  ];
};

// The maps' Esri Ocean basemap as one low-resolution world image, shared by
// every thumbnail on the page (see THUMBNAIL_IMAGES), from this site's CDN.
// It stops at Web Mercator's limit, so past that the north comes from Esri's
// Arctic version of it and the south is its plain Antarctic ice (as on the
// maps).
const WORLD_URL = '/api/basemap/world';
const ARCTIC_URL = '/api/basemap/arctic';
const ANTARCTIC_COLOR = '#f1f0eb';
// Without the image (Esri unreachable), the globe is plain ocean.
const OCEAN_COLOR = '#8db3e2';

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});
let basemap: Promise<ImageData | null> | null = null;
const loadBasemap = () => basemap ||= Promise.all([loadImage(WORLD_URL), loadImage(ARCTIC_URL).catch(() => null)])
  .then(([world, arctic]) => {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const context = canvas.getContext('2d')!;
    context.drawImage(world, 0, 0);
    if (arctic) context.drawImage(arctic, 0, 0);
    context.fillStyle = ANTARCTIC_COLOR;
    context.fillRect(0, HEIGHT - POLAR_ROWS, WIDTH, POLAR_ROWS);
    return context.getImageData(0, 0, WIDTH, HEIGHT);
  })
  .catch(() => null);

const SIZE = 80;
const RADIUS = 35;

// The globe centred on the points, drawn pixel by pixel from the basemap,
// with the points on top.
const drawThumbnail = (canvas: HTMLCanvasElement, points: [number, number][], image: ImageData | null) => {
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  const size = Math.round(SIZE * scale);
  const radius = RADIUS * scale;
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d')!;
  const [centerLon, centerLat] = sphericalCentroid(points);
  const projection = geoOrthographic()
    .scale(radius)
    .translate([size / 2, size / 2])
    .rotate([-centerLon, -centerLat]);

  if (image) {
    const out = context.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const [dx, dy] = [x + 0.5 - size / 2, y + 0.5 - size / 2];
        if (dx * dx + dy * dy > radius * radius) continue;
        const lonLat = projection.invert!([x + 0.5, y + 0.5]);
        if (!lonLat) continue;
        const column = ((Math.floor((lonLat[0] + 180) / 360 * WIDTH) % WIDTH) + WIDTH) % WIDTH;
        const row = Math.min(Math.max(Math.floor((90 - lonLat[1]) / 180 * HEIGHT), 0), HEIGHT - 1);
        const from = (row * WIDTH + column) * 4;
        const to = (y * size + x) * 4;
        out.data[to] = image.data[from];
        out.data[to + 1] = image.data[from + 1];
        out.data[to + 2] = image.data[from + 2];
        out.data[to + 3] = 255;
      }
    }
    context.putImageData(out, 0, 0);
  } else {
    context.beginPath();
    context.arc(size / 2, size / 2, radius, 0, 2 * Math.PI);
    context.fillStyle = OCEAN_COLOR;
    context.fill();
  }

  // Slightly smaller markers when a cruise has many stations so they don't
  // merge into a single blob at thumbnail scale.
  const markerRadius = (points.length > 20 ? 2 : 3) * scale;
  context.fillStyle = '#1D4F91';
  context.strokeStyle = '#ffffff';
  context.lineWidth = scale;
  const rad = Math.PI / 180;
  points.forEach(([lon, lat]) => {
    // Skip stations on the far hemisphere rather than drawing them through the globe.
    const cosAngle = Math.sin(lat * rad) * Math.sin(centerLat * rad)
      + Math.cos(lat * rad) * Math.cos(centerLat * rad) * Math.cos((lon - centerLon) * rad);
    if (cosAngle < 0) return;
    const at = projection([lon, lat]);
    if (!at) return;
    context.beginPath();
    context.arc(at[0], at[1], markerRadius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
  });

  // Softens the globe's pixel edge.
  context.beginPath();
  context.arc(size / 2, size / 2, radius, 0, 2 * Math.PI);
  context.strokeStyle = 'rgba(255,255,255,0.3)';
  context.lineWidth = scale;
  context.stroke();
};

/**
 * Small orthographic globe of the Esri Ocean basemap for result rows. Pass
 * `lat`/`lon` for a single record (cores, dives, rocks) or `locations` for a
 * cruise, whose stations are all plotted with the globe rotated to their
 * centroid.
 */
export const CollectionMapThumbnail: React.FC<{
  lat?: number | string;
  lon?: number | string;
  locations?: LocationPoint[];
}> = ({ lat, lon, locations }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<ImageData | null | undefined>(undefined);

  useEffect(() => {
    let current = true;
    loadBasemap().then(loaded => { if (current) setImage(loaded); });
    return () => { current = false; };
  }, []);

  const points: [number, number][] = (locations && locations.length > 0
    ? locations.map(loc => toPoint(loc.latitudeStart ?? loc.latitudeEnd, loc.longitudeStart ?? loc.longitudeEnd))
    : [toPoint(lat, lon)]
  ).filter((p): p is [number, number] => p !== null);
  const pointsKey = JSON.stringify(points);

  useEffect(() => {
    if (!canvasRef.current || image === undefined || points.length === 0) return;
    drawThumbnail(canvasRef.current, points, image);
  }, [pointsKey, image]);

  if (points.length === 0) {
    return null;
  }

  return (
    <div className="avatar">
      <div className="w-20 h-20 rounded bg-gray-900 overflow-hidden">
        <canvas ref={canvasRef} style={{ width: SIZE, height: SIZE }} />
      </div>
    </div>
  );
};
