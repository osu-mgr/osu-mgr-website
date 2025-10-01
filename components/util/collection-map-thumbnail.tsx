import React, { useEffect, useRef, useState } from "react";
import { geoOrthographic, geoPath, geoGraticule } from "d3-geo";
import { select } from "d3-selection";
import { feature } from "topojson-client";

export const CollectionMapThumbnail: React.FC<{ lat: number, lon: number }> = ({
  lat,
  lon
}) => {
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

  useEffect(() => {
    if (!svgRef.current || !worldData || lat === undefined || lon === undefined) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 80;
    const height = 80;
    const radius = 35;

    // Create orthographic projection centered on the target location
    const projection = geoOrthographic()
      .scale(radius)
      .translate([width / 2, height / 2])
      .rotate([-lon, -lat]);

    const path = geoPath().projection(projection);

    // Create graticule (grid lines)
    const graticule = geoGraticule();

    // Add sphere (ocean)
    svg.append("path")
      .datum({type: "Sphere"})
      .attr("d", path)
      .attr("fill", "#4a90e2")
      .attr("stroke", "none");

    // Add graticule lines
    svg.append("path")
      .datum(graticule())
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-width", 0.5);

    // Add high-resolution countries/land masses with realistic colors
    const countries = feature(worldData, worldData.objects.countries);
    
    // Function to determine color based on country properties
    const getCountryColor = (d) => {
      // Check if country name exists in properties
      const countryName = d.properties?.NAME || d.properties?.name || '';
      
      // Polar regions - white/ice blue
      if (countryName.includes('Antarctica') || 
          countryName.includes('Greenland') ||
          countryName.includes('Iceland')) {
        return '#f0f8ff'; // Alice blue for ice
      }
      
      // Desert regions - tan/beige
      if (countryName.includes('Algeria') ||
          countryName.includes('Libya') ||
          countryName.includes('Egypt') ||
          countryName.includes('Saudi Arabia') ||
          countryName.includes('Chad') ||
          countryName.includes('Niger') ||
          countryName.includes('Mali') ||
          countryName.includes('Mauritania') ||
          countryName.includes('Sudan') ||
          countryName.includes('Mongolia') ||
          countryName.includes('Kazakhstan')) {
        return '#deb887'; // Burlywood for desert
      }
      
      // Tropical/forest regions - darker green
      if (countryName.includes('Brazil') ||
          countryName.includes('Congo') ||
          countryName.includes('Indonesia') ||
          countryName.includes('Malaysia') ||
          countryName.includes('Colombia') ||
          countryName.includes('Venezuela') ||
          countryName.includes('Peru') ||
          countryName.includes('Ecuador') ||
          countryName.includes('Gabon') ||
          countryName.includes('Cameroon')) {
        return '#228B22'; // Forest green
      }
      
      // Default temperate land - olive green
      return '#6B8E23'; // Olive drab
    };
    
    // Render each country with appropriate coloring
    svg.selectAll(".country")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", getCountryColor)
      .attr("stroke", "rgba(255,255,255,0.15)")
      .attr("stroke-width", 0.2);

    // Add the marker at the target location
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

    // Add subtle sphere outline
    svg.append("path")
      .datum({type: "Sphere"})
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("stroke-width", 1);

  }, [lat, lon, worldData]);

  if (lat === undefined || lon === undefined) {
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