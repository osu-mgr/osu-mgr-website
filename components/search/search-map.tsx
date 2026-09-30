import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import useLocalStorage from '../hooks/useLocalStorage';
import { Icon } from '../util/icon';
import { ItemsCount } from '../util/items-count';
import { Area, LAYERS, MapPoint, Mode, WHOLE_GLOBE, areaAround, toMapPoint } from './map-points';

// Points per request (OpenSearch's default max_result_window); larger layers
// are paged with search_after.
const PAGE_SIZE = 10000;

// Every plottable record of one type matching a search, paged.
const fetchMapPoints = async (type: string, searchString: string, filters: any, filterLogic: any) => {
  const points: MapPoint[] = [];
  let searchAfter: unknown[] | undefined;
  for (;;) {
    const res = await fetch('/api/opensearch?search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        types: [type],
        searchString,
        filters,
        filterLogic,
        sortOrder: 'alpha asc',
        size: PAGE_SIZE,
        search_after: searchAfter,
        _source: ['_osuid', 'latitudeStart', 'latitudeEnd', 'longitudeStart', 'longitudeEnd'],
      }),
    });
    if (!res.ok) throw new Error('Failed to fetch map points');
    const body = await res.json();
    const hits: any[] = body?.hits?.hits || [];
    hits.forEach(h => {
      const point = toMapPoint(h._source, type);
      if (point) points.push(point);
    });
    if (hits.length < PAGE_SIZE) return { points };
    searchAfter = hits[hits.length - 1].sort;
  }
};

// zoomTo: also zoom to an area around the search's records.
export type AreaRequest = { mode?: Mode; zoomTo?: boolean };
// A search with no text or filters (other than an area).
const isUnfiltered = (search: any) => !search.searchString?.trim()
  && !Object.entries(search.filters || {}).some(([key, value]) => key !== 'area' && Array.isArray(value) && value.length > 0);

const MODES: [Mode, string][] = [['globe', 'Globe'], ['flat', 'Mercator'], ['north', 'North Pole'], ['south', 'South Pole']];
// MapLibre needs the browser.
const MapLibreMap = dynamic(() => import('./maplibre-map'), { ssr: false });

/**
 * Maps tab: every core and dredge/dive matching the current search and
 * filters, on a globe, a Mercator map or a globe over either pole. Clicking a
 * record opens its landing page modal.
 */
export const SearchMap: React.FC<{
  search: any;
  onSelect: (osuid: string) => void;
  // Reports the record types currently plotted, so the filter panel can count them.
  onLayersChange?: (types: string[]) => void;
  // The geospatial filter (search.filters.area): set or cleared here, or
  // asked for (areaRequest), in the given map type, for this to add.
  onAreaChange: (area: Area | null) => void;
  areaRequest: AreaRequest | null;
  onRequestArea: () => void;
}> = ({ search, onSelect, onLayersChange, onAreaChange, areaRequest, onRequestArea }) => {
  const area: Area | null = search.filters?.area || null;
  // An area the map zooms to (see AreaRequest).
  const [zoomTo, setZoomTo] = useState<Area | null>(null);
  const [settings, setSettings] = useLocalStorage('search-map', {
    mode: 'globe' as Mode,
    layers: ['core', 'dive'],
  });
  const { layers } = settings;
  // Settings saved before the pole views were split out used 'polar' + pole.
  const mode: Mode = settings.mode === 'polar' ? (settings.pole === 'north' ? 'north' : 'south') : settings.mode;

  useEffect(() => { onLayersChange?.(layers); }, [layers.join(',')]);

  const layerQueries = useQueries({
    queries: LAYERS.map(layer => ({
      queryKey: ['mapPoints', layer.type, search.searchString, search.filters, search.filterLogic],
      queryFn: () => fetchMapPoints(layer.type, search.searchString, search.filters, search.filterLogic),
      enabled: layers.includes(layer.type),
      staleTime: 60 * 1000,
      placeholderData: (previous: any) => previous,
    })),
  });

  const isLoading = LAYERS.some((layer, i) => layers.includes(layer.type) && layerQueries[i].isFetching);
  const livePoints = useMemo(
    () => LAYERS.flatMap((layer, i) => (layers.includes(layer.type) ? layerQueries[i].data?.points || [] : [])),
    [layers, ...layerQueries.map(q => q.data)],
  );
  // useQueries gives each new query key a fresh observer, so placeholderData
  // has no previous data on a cache miss: hold the last settled points
  // while fetching so the map doesn't blank out between searches.
  const settledPoints = useRef<MapPoint[]>([]);
  if (!isLoading) settledPoints.current = livePoints;
  const points = isLoading ? settledPoints.current : livePoints;
  // With an area filter, the records it leaves out are shown in grey for
  // context: the same search without the area, which doesn't change as the
  // area is edited (and is the unfiltered search's own query).
  const contextFilters = { ...search.filters, area: undefined };
  const contextQueries = useQueries({
    queries: LAYERS.map(layer => ({
      queryKey: ['mapPoints', layer.type, search.searchString, contextFilters, search.filterLogic],
      queryFn: () => fetchMapPoints(layer.type, search.searchString, contextFilters, search.filterLogic),
      enabled: Boolean(area) && layers.includes(layer.type),
      staleTime: 60 * 1000,
      placeholderData: (previous: any) => previous,
    })),
  });
  const context = useMemo(() => {
    if (!area) return [];
    const inArea = new Set(points.map(p => `${p.type}|${p.name}`));
    return LAYERS.flatMap((layer, i) => (layers.includes(layer.type) ? contextQueries[i].data?.points || [] : []))
      .filter(p => !inArea.has(`${p.type}|${p.name}`));
  }, [area?.join(), points, layers, ...contextQueries.map(q => q.data)]);
  // Only show the loading overlay when a refresh is slow.
  const [showLoading, setShowLoading] = useState(false);
  useEffect(() => {
    if (!isLoading) return setShowLoading(false);
    const timer = setTimeout(() => setShowLoading(true), 500);
    return () => clearTimeout(timer);
  }, [isLoading]);
  // An area asked for, in the map type asked for, once all the cores and
  // dredges/dives the search matches have loaded (both layers switched on):
  // around them, or, for an unfiltered search, over the middle of the view
  // (requestViewArea), which leaves the map where it is.
  const areaPending = Boolean(areaRequest) && !area;
  const modeReady = !areaRequest?.mode || mode === areaRequest.mode;
  const layersReady = LAYERS.every(layer => layers.includes(layer.type));
  useEffect(() => {
    if (!areaPending) return;
    if (!modeReady) return setSettings((prev: any) => ({ ...prev, mode: areaRequest!.mode }));
    if (!layersReady) return setSettings((prev: any) => ({ ...prev, layers: LAYERS.map(layer => layer.type) }));
    if (isLoading || isUnfiltered(search)) return;
    const next = areaAround(points) ?? WHOLE_GLOBE;
    if (areaRequest?.zoomTo) setZoomTo(next);
    onAreaChange(next);
  }, [areaPending, modeReady, layersReady, isLoading, points]);
  const requestViewArea = areaPending && modeReady && layersReady && !isLoading && isUnfiltered(search);
  // The map re-centres on the points for a new search, but not for an area edit.
  const focusKey = JSON.stringify([search.searchString, { ...search.filters, area: undefined }, search.filterLogic, layers]);
  const toggleLayer = (type: string) => setSettings((prev: any) => ({
    ...prev,
    layers: prev.layers.includes(type) ? prev.layers.filter((t: string) => t !== type) : [...prev.layers, type],
  }));

  return (
    <div className="flex flex-col h-full gap-2 not-prose">
      {/* pl-px: the scrolling results pane clips the first button's left border. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pl-px">
        <div className="btn-group">
          {MODES.map(([value, label]) => (
            <button
              key={value}
              className={`btn btn-xs ${mode === value ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSettings((prev: any) => ({ ...prev, mode: value }))}
            >
              {label}
            </button>
          ))}
        </div>
        {area ? (
          <button className="btn btn-xs btn-outline gap-1" onClick={() => onAreaChange(null)} title="Stop filtering by the area on the map">
            <Icon name="LuX" size="xxs" />
            Remove area
          </button>
        ) : (
          <button className="btn btn-xs btn-outline gap-1" onClick={onRequestArea} title="Filter to an area you can move and resize on the map">
            <Icon name="LuBoxSelect" size="xxs" />
            Filter by area
          </button>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {LAYERS.map(layer => (
            <label key={layer.type} className="flex items-center gap-1.5 cursor-pointer text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-xs"
                checked={layers.includes(layer.type)}
                onChange={() => toggleLayer(layer.type)}
              />
              <span className="inline-block w-2.5 h-2.5 rounded-full border border-white shadow" style={{ backgroundColor: layer.color }} />
              {layer.label}
              <span className="badge badge-sm badge-outline">
                <ItemsCount
                  searchString={search.searchString}
                  types={[layer.type]}
                  filters={search.filters}
                  filterLogic={search.filterLogic}
                  hasCoordinates
                  singularLabel=""
                  pluralLabel=""
                />
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="relative flex-1 min-h-[300px] rounded overflow-hidden border border-base-300">
        <MapLibreMap
          mode={mode}
          points={points}
          onSelect={onSelect}
          area={area}
          onAreaChange={onAreaChange}
          requestViewArea={requestViewArea}
          zoomTo={zoomTo}
          focusKey={focusKey}
          context={context}
        />
        {showLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-base-100/40 pointer-events-none">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded bg-base-100/90 shadow text-sm">
              <Icon name="TbLoader2" className="w-5 h-5 text-primary animate-spin" />
              Loading…
            </span>
          </div>
        ) : !isLoading && points.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1.5 rounded bg-base-100/90 shadow text-sm text-gray-500">
              No mapped locations match this search
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
