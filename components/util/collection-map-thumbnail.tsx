import React, { useEffect, useRef, useState } from "react";
import { geoOrthographic, geoPath, geoGraticule } from "d3-geo";
import { select } from "d3-selection";
import { feature } from "topojson-client";

type LocationPoint = {
  latitudeStart?: number | null;
  latitudeEnd?: number | null;
  longitudeStart?: number | null;
  longitudeEnd?: number | null;
};

export const CollectionMapThumbnail: React.FC<{
  lat?: number;
  lon?: number;
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

  // Single-point rendering (original behavior, for cores/samples)
  useEffect(() => {
    if (!svgRef.current || !worldData || lat === undefined || lon === undefined) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 80;
    const height = 80;
    const radius = 35;

    const projection = geoOrthographic()
      .scale(radius)
      .translate([width / 2, height / 2])
      .rotate([-lon, -lat]);

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

    const markerCoords = projection([lon, lat]);
    if (markerCoords) {
      svg.append("circle")
        .attr("cx", markerCoords[0])
        .attr("cy", markerCoords[1])
        .attr("r", 3)
        .attr("fill", "#D73F09")
        .attr("stroke", "white")
        .attr("stroke-width", 1);
    }

    svg.append("path")
      .datum({type: "Sphere"})
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("stroke-width", 1);

  }, [lat, lon, worldData]);

  // Multi-point rendering (for cruises/dives with _locations array)
  useEffect(() => {
    if (!svgRef.current || !worldData || !locations || locations.length === 0) return;

    const points: [number, number][] = locations
      .map(loc => {
        const laRaw = loc.latitudeStart ?? loc.latitudeEnd;
        const loRaw = loc.longitudeStart ?? loc.longitudeEnd;
        if (laRaw == null || loRaw == null) return null;
        const la = parseFloat(laRaw as any);
        const lo = parseFloat(loRaw as any);
        return !isNaN(la) && !isNaN(lo) ? [lo, la] as [number, number] : null;
      })
      .filter((p): p is [number, number] => p !== null);

    if (points.length === 0) return;

    const centerLon = points.reduce((s, p) => s + p[0], 0) / points.length;
    const centerLat = points.reduce((s, p) => s + p[1], 0) / points.length;

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

    points.forEach(([pLon, pLat]) => {
      const coords = projection([pLon, pLat]);
      if (coords) {
        svg.append("circle")
          .attr("cx", coords[0])
          .attr("cy", coords[1])
          .attr("r", 3)
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

  }, [locations, worldData]);

  if (lat === undefined && lon === undefined && (!locations || locations.length === 0)) {
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
