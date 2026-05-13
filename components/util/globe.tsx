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
  coordinates?: Array<{ lat: number; lon: number; name?: string }>;
}

export const Globe: React.FC<GlobeProps> = ({
  latitude,
  longitude,
  latitudeStart,
  latitudeEnd,
  longitudeStart,
  longitudeEnd,
  coordinates,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Prepare data points
    const points: any[] = [];

    // If we have an array of coordinates, use that
    if (coordinates && coordinates.length > 0) {
      coordinates.forEach((coord, index) => {
        points.push({
          name: coord.name || `Point ${index + 1}`,
          value: [coord.lon, coord.lat, -0.05],
          itemStyle: {
            color: '#ff6600' // Orange primary color
          }
        });
      });
    } else {
      // Legacy single/range coordinate handling
      // Add start point if available
      if (latitudeStart != null && longitudeStart != null) {
        points.push({
          name: 'Start',
          value: [Number(longitudeStart), Number(latitudeStart), -0.05],
          itemStyle: {
            color: '#ff6600'
          }
        });
      }

      // Add end point if available and different from start
      if (latitudeEnd != null && longitudeEnd != null &&
          (latitudeEnd !== latitudeStart || longitudeEnd !== longitudeStart)) {
        points.push({
          name: 'End',
          value: [Number(longitudeEnd), Number(latitudeEnd), -0.05],
          itemStyle: {
            color: '#ff6600'
          }
        });
      }

      // If only one point using single lat/lon, add it
      if (points.length === 0 && latitude != null && longitude != null) {
        points.push({
          name: 'Location',
          value: [Number(longitude), Number(latitude), -0.05],
          itemStyle: {
            color: '#ff6600'
          }
        });
      }
    }

    if (points.length === 0) return;

    // Calculate center point for camera
    let centerLat: number;
    let centerLon: number;

    if (points.length === 1) {
      centerLat = points[0].value[1];
      centerLon = points[0].value[0];
    } else {
      // Calculate average position
      const sumLat = points.reduce((sum, p) => sum + p.value[1], 0);
      const sumLon = points.reduce((sum, p) => sum + p.value[0], 0);
      centerLat = sumLat / points.length;
      centerLon = sumLon / points.length;
    }

    console.log('Globe Debug:', {
      pointsCount: points.length,
      centerLat,
      centerLon,
      points
    });

    // Initialize chart
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;

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
          targetCoord: [centerLon, centerLat]
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
  }, [latitude, longitude, latitudeStart, latitudeEnd, longitudeStart, longitudeEnd, coordinates]);

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
