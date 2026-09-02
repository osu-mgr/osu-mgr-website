import React, { useEffect, useRef, useState } from "react";
import { geoOrthographic, geoPath, geoGraticule } from "d3-geo";
import { select } from "d3-selection";
import { feature } from "topojson-client";

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

/**
 * Small orthographic globe for result rows. Pass `lat`/`lon` for a single
 * record (cores, dives, rocks) or `locations` for a cruise, whose stations
 * are all plotted with the globe rotated to their centroid.
 */
export const CollectionMapThumbnail: React.FC<{
  lat?: number | string;
  lon?: number | string;
  locations?: LocationPoint[];
}> = ({ lat, lon, locations }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [worldData, setWorldData] = useState(null);

  // Load world atlas data
  useEffect(() => {
    const loadWorldData = async () => {
      try {
        const world = await import('world-atlas/countries-110m.json');
        setWorldData(world.default);
      } catch (error) {
        console.error('Failed to load world data:', error);
      }
    };
    loadWorldData();
  }, []);

  const points: [number, number][] = (locations && locations.length > 0
    ? locations.map(loc => toPoint(loc.latitudeStart ?? loc.latitudeEnd, loc.longitudeStart ?? loc.longitudeEnd))
    : [toPoint(lat, lon)]
  ).filter((p): p is [number, number] => p !== null);
  const pointsKey = JSON.stringify(points);

  useEffect(() => {
    if (!svgRef.current || !worldData || points.length === 0) return;

    const [centerLon, centerLat] = sphericalCentroid(points);

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 80;
    const height = 80;
    const radius = 35;

    const projection = geoOrthographic()
      .scale(radius)
      .translate([width / 2, height / 2])
      .rotate([-centerLon, -centerLat]);

    const path = geoPath().projection(projection);
    const graticule = geoGraticule();

    svg.append("path")
      .datum({type: "Sphere"})
      .attr("d", path)
      .attr("fill", "#4a90e2")
      .attr("stroke", "none");

    svg.append("path")
      .datum(graticule())
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-width", 0.5);

    const countries = feature(worldData, worldData.objects.countries) as any;

    const getCountryColor = (d) => {
      const countryName = d.properties?.NAME || d.properties?.name || '';
      if (countryName.includes('Antarctica') || countryName.includes('Greenland') || countryName.includes('Iceland')) return '#f0f8ff';
      if (countryName.includes('Algeria') || countryName.includes('Libya') || countryName.includes('Egypt') ||
          countryName.includes('Saudi Arabia') || countryName.includes('Chad') || countryName.includes('Niger') ||
          countryName.includes('Mali') || countryName.includes('Mauritania') || countryName.includes('Sudan') ||
          countryName.includes('Mongolia') || countryName.includes('Kazakhstan')) return '#deb887';
      if (countryName.includes('Brazil') || countryName.includes('Congo') || countryName.includes('Indonesia') ||
          countryName.includes('Malaysia') || countryName.includes('Colombia') || countryName.includes('Venezuela') ||
          countryName.includes('Peru') || countryName.includes('Ecuador') || countryName.includes('Gabon') ||
          countryName.includes('Cameroon')) return '#228B22';
      return '#6B8E23';
    };

    svg.selectAll(".country")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", getCountryColor)
      .attr("stroke", "rgba(255,255,255,0.15)")
      .attr("stroke-width", 0.2);

    // Slightly smaller markers when a cruise has many stations so they don't
    // merge into a single blob at thumbnail scale.
    const markerRadius = points.length > 20 ? 2 : 3;
    points.forEach(([pLon, pLat]) => {
      // Skip stations on the far hemisphere rather than drawing them through the globe.
      const angle = Math.acos(
        Math.sin(pLat * Math.PI / 180) * Math.sin(centerLat * Math.PI / 180) +
        Math.cos(pLat * Math.PI / 180) * Math.cos(centerLat * Math.PI / 180) * Math.cos((pLon - centerLon) * Math.PI / 180)
      );
      if (angle > Math.PI / 2) return;
      const coords = projection([pLon, pLat]);
      if (coords) {
        svg.append("circle")
          .attr("cx", coords[0])
          .attr("cy", coords[1])
          .attr("r", markerRadius)
          .attr("fill", "#D73F09")
          .attr("stroke", "white")
          .attr("stroke-width", 1);
      }
    });

    svg.append("path")
      .datum({type: "Sphere"})
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("stroke-width", 1);

  }, [pointsKey, worldData]);

  if (points.length === 0) {
    return null;
  }

  return (
    <div className="avatar">
      <div className="w-20 h-20 rounded bg-gray-900 overflow-hidden">
        <svg ref={svgRef} width="80" height="80" viewBox="0 0 80 80" />
      </div>
    </div>
  );
};
