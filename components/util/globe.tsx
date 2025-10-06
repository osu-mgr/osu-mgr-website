import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import 'echarts-gl';

interface GlobeProps {
  latitude?: number;
  longitude?: number;
  latitudeStart?: number;
  latitudeEnd?: number;
  longitudeStart?: number;
  longitudeEnd?: number;
}

export const Globe: React.FC<GlobeProps> = ({
  latitude,
  longitude,
  latitudeStart,
  latitudeEnd,
  longitudeStart,
  longitudeEnd,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Determine coordinates to display - use center point if range exists
    let lat: number | undefined;
    let lon: number | undefined;

    if (latitudeStart != null && latitudeEnd != null && longitudeStart != null && longitudeEnd != null) {
      // Calculate center point when we have a range
      lat = (Number(latitudeStart) + Number(latitudeEnd)) / 2;
      lon = (Number(longitudeStart) + Number(longitudeEnd)) / 2;
    } else {
      // Use single point
      const rawLat = latitude ?? latitudeStart ?? latitudeEnd;
      const rawLon = longitude ?? longitudeStart ?? longitudeEnd;
      lat = rawLat != null ? Number(rawLat) : undefined;
      lon = rawLon != null ? Number(rawLon) : undefined;
    }

    if (lat == null || lon == null) return;

    console.log('Globe Debug:', {
      latitude,
      longitude,
      latitudeStart,
      latitudeEnd,
      longitudeStart,
      longitudeEnd,
      calculatedLat: lat,
      calculatedLon: lon,
      targetCoord: [lon, lat]
    });

    // Initialize chart
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;

    // Prepare data points
    const points: any[] = [];

    // Add start point if available
    if (latitudeStart != null && longitudeStart != null) {
      points.push({
        name: 'Start',
        value: [Number(longitudeStart), Number(latitudeStart), 0],
        itemStyle: {
          color: '#ff6600' // Orange primary color
        }
      });
    }

    // Add end point if available and different from start
    if (latitudeEnd != null && longitudeEnd != null &&
        (latitudeEnd !== latitudeStart || longitudeEnd !== longitudeStart)) {
      points.push({
        name: 'End',
        value: [Number(longitudeEnd), Number(latitudeEnd), 0],
        itemStyle: {
          color: '#ff6600' // Orange primary color
        }
      });
    }

    // If only one point, add it
    if (points.length === 0 && lat != null && lon != null) {
      points.push({
        name: 'Location',
        value: [lon, lat, 0],
        itemStyle: {
          color: '#ff6600' // Orange primary color
        }
      });
    }

    console.log('Globe Points:', points);

    const option = {
      backgroundColor: '#000000',
      globe: {
        baseTexture: '/Equirectangular-projection-topographic-world.jpg',
        shading: 'color',
        atmosphere: {
          show: false
        },
        viewControl: {
          autoRotate: false,
          distance: 60,
          minDistance: 10,
          maxDistance: 400,
          center: [0, 0, 0],
          alpha: 0,
          beta: 0,
          targetCoord: [lon, lat]
        },
        itemStyle: {
          color: '#1e3a8a',
          opacity: 1,
          borderWidth: 0.5,
          borderColor: '#64748b'
        },
        silent: false
      },
      series: [
        {
          type: 'scatter3D',
          coordinateSystem: 'globe',
          symbolSize: 8,
          itemStyle: {
            opacity: 1
          },
          label: {
            show: false
          },
          data: points
        }
      ]
    };

    chart.setOption(option);

    // Handle resize
    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [latitude, longitude, latitudeStart, latitudeEnd, longitudeStart, longitudeEnd]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={chartRef}
      className="w-full h-full min-h-[300px]"
      style={{ minHeight: '300px' }}
    />
  );
};
