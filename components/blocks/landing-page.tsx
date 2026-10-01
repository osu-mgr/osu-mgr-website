import _ from 'lodash';
import { useRouter } from 'next/router';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-hook-inview';
import { DataIssueBadges, DataIssuesPanel, SHOW_DATA_ISSUES, getDataIssues } from '../search/data-issues';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import numeral from 'numeral';
import dynamic from 'next/dynamic';
import { Section } from "../util/section";
import { Container } from "../util/container";
import { ItemsCount } from '../util/items-count';
import { CollectionFileButton } from '../util/collection-file-button';
import { CollectionMapThumbnail } from '../util/collection-map-thumbnail';
import { DateTimeCell } from '../search/date-time-cell';
import { MapPoint, TrackInfo, TrackStop, pointKey, stationLine, toMapPoint } from '../search/map-points';
import { DetailFilterButton, OnDetailFilter } from '../search/detail-filter-button';
import { Icon } from "../util/icon";
import { getDiveMethodLabel, formatDate, formatTime, formatField, getFileTypeLabel, isPlaceholder, isVisibleFileType, shown, SHOW_PUBLICATIONS } from "../search/search-data";

const MapLibreMap = dynamic(() => import("../search/maplibre-map"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-base-200">Loading map...</div>,
});

const isVisibleFile = (file: any) => isVisibleFileType(file?.type?.toLowerCase());
const hasVisibleFiles = (doc: any) =>
  (doc?._files || []).some(isVisibleFile) || (doc?._moratorium_files || []).some(isVisibleFile);

// Child-record lookup shared by the tab counts and the panels. Both call it with
// the same key, so react-query dedupes the fetch. Capped at 100 hits; the tab
// badge uses hits.total so it stays right past the cap.
// Paged like the search results: PAGE_SIZE rows per request, the next page
// fetched as the list is scrolled. hits.total on the first page drives the tab
// badge, so the count is right before the rest has loaded.
const PAGE_SIZE = 10;
const useChildDocs = (key: string, types: string[], termField: string, uuid?: string) =>
  useInfiniteQuery<any>({
    queryKey: [key, uuid],
    enabled: !!uuid,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      if (!uuid) return null;
      const from = (pageParam as number) * PAGE_SIZE;
      const payload = { types, terms: { [termField]: [uuid] }, sortOrder: 'ids asc', from, size: PAGE_SIZE };
      const res = await fetch('/api/opensearch?search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || `Failed to fetch ${types.join(', ')}`);
      }
      return res.json();
    },
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      const fetched = allPages.reduce((n, p) => n + (p?.hits?.hits?.length || 0), 0);
      const total = hitsTotal(lastPage) ?? 0;
      return fetched < total ? allPages.length : undefined;
    },
  });

const hitsTotal = (results: any): number | undefined => {
  const t = results?.hits?.total;
  if (t == null) return undefined;
  return typeof t === 'number' ? t : t.value;
};

// External links are labelled "Site: Title", e.g. "R2R: EW0408".
const r2rPageTitle = (link: string) => `R2R: ${link.split('/').pop()}`;

// Citations come from Crossref and may carry inline markup such as
// "TEX<sub>86</sub>"; keep only harmless inline tags (no attributes).
const citationHtml = (citation: string) =>
  String(citation).replace(/<(?!\/?(?:sub|sup|i|em|b|strong)>)[^>]*>/gi, '');

const r2rCruiseLinks: { [key: string]: string[] } = {
  'OSU-AT0003': ['https://www.rvdata.us/search/cruise/AT3-49'],
  'OSU-BENTHIC3': ['https://www.rvdata.us/search/cruise/BNTH03MV'],
  'OSU-EW0104': ['https://www.rvdata.us/search/cruise/EW0104'],
  'OSU-EW0408': ['https://www.rvdata.us/search/cruise/EW0408'],
  'OSU-EW9504': ['https://www.rvdata.us/search/cruise/EW9504'],
  'OSU-EW9505': ['https://www.rvdata.us/search/cruise/EW9505'],
  'OSU-EW9709': ['https://www.rvdata.us/search/cruise/EW9709'],
  'OSU-FD7503': ['https://www.rvdata.us/search/cruise/FDRK03MV'],
  'OSU-HE0002': ['https://www.rvdata.us/search/cruise/HLY0001'],
  'OSU-INMD01': ['https://www.rvdata.us/search/cruise/INMD01MV'],
  'OSU-KM0419': ['https://www.rvdata.us/search/cruise/KM0419'],
  'OSU-M8011': ['https://www.rvdata.us/search/cruise/VLCN03MV','https://www.rvdata.us/search/cruise/VLCN04MV'],
  'OSU-M9907': ['https://www.rvdata.us/search/cruise/AVON09MV'],
  'OSU-ME0005A': ['https://www.rvdata.us/search/cruise/NEMO03MV'],
  'OSU-MV0209': ['https://www.rvdata.us/search/cruise/VANC02MV'],
  'OSU-MV0502': ['https://www.rvdata.us/search/cruise/TUIM03MV'],
  'OSU-MV0508': ['https://www.rvdata.us/search/cruise/TUIM13MV'],
  'OSU-MV0811': ['https://www.rvdata.us/search/cruise/BOLT02MV'],
  'OSU-MV1014': ['https://www.rvdata.us/search/cruise/MV1014'],
  'OSU-PE2111': ['https://www.rvdata.us/search/cruise/PE21-11'],
  'OSU-PLDS2': ['https://www.rvdata.us/search/cruise/PLDS02MV'],
  'OSU-PLUME02': ['https://www.rvdata.us/search/cruise/PLUM02WT'],
  'OSU-PLUTO3': ['https://www.rvdata.us/search/cruise/PLTO03MV'],
  'OSU-RAMA1': ['https://www.rvdata.us/search/cruise/RAMA01WT'],
  'OSU-RR0207': ['https://www.rvdata.us/search/cruise/LPRS02RR'],
  'OSU-RR0503': ['https://www.rvdata.us/search/cruise/ZHNG03RR'],
  'OSU-RR0603': ['https://www.rvdata.us/search/cruise/AMAT03RR'],
  'OSU-RR1310': ['https://www.rvdata.us/search/cruise/RR1310'],
  'OSU-RR1807': ['https://www.rvdata.us/search/cruise/RR1807'],
  'OSU-RR2208': ['https://www.rvdata.us/search/vessel/Revelle'],
  'OSU-RR9702A': ['https://www.rvdata.us/search/cruise/GENE03RR'],
  'OSU-SH1710': ['https://www.rvdata.us/search/cruise/HRS1710JH'],
  'OSU-SKQ1603': ['https://www.rvdata.us/search/cruise/SKQ201602S'],
  'OSU-SKQ1903': ['https://www.rvdata.us/search/cruise/SKQ201905S'],
  'OSU-SP1716': ['https://www.rvdata.us/search/cruise/SP1716'],
  'OSU-SR1801': ['https://www.rvdata.us/search/cruise/SR1801'],
  'OSU-SR2113': ['https://www.rvdata.us/search/cruise/SR2113'],
  'OSU-TN037': ['https://www.rvdata.us/search/cruise/TN037'],
  'OSU-TN0909': ['https://www.rvdata.us/search/cruise/TN240'],
  'OSU-TN314': ['https://www.rvdata.us/search/cruise/TN314'],
  'OSU-TT1811': ['https://www.rvdata.us/search/cruise/TN362'],
  'OSU-TT1909': ['https://www.rvdata.us/search/cruise/TN372'],
  'OSU-OC2109A': ['https://www.rvdata.us/search/cruise/OC2109A'],
  'OSU-OC1706B': ['https://www.rvdata.us/search/cruise/OC1706B'],
  'OSU-OC1804C': ['https://www.rvdata.us/search/cruise/OC1804C'],
  'OSU-OC1906A': ['https://www.rvdata.us/search/cruise/OC1906A'],
  'OSU-OC1908B': ['https://www.rvdata.us/search/cruise/OC1908B'],
  'OSU-OC2006A': ['https://www.rvdata.us/search/cruise/OC2006A'],
  'OSU-SKQ202309T': ['https://www.rvdata.us/search/cruise/SKQ202309T'],
  'OSU-SKQ202311S': ['https://www.rvdata.us/search/cruise/SKQ202311S'],
  'OSU-SKQ202404S': ['https://www.rvdata.us/search/cruise/SKQ202404S'],
  'OSU-SKQ202410S': ['https://www.rvdata.us/search/cruise/SKQ202410S'],
  'OSU-SKQ2012': ['https://www.rvdata.us/search/cruise/SKQ202016S'],
  'OSU-SKQ2211': ['https://www.rvdata.us/search/cruise/SKQ202215S'],
  'OSU-SKQ2303': ['https://www.rvdata.us/search/cruise/SKQ202305S'],
  'OSU-SKQ202206S': ['https://www.rvdata.us/search/cruise/SKQ202206S'],
  'OSU-SP2323': ['https://www.rvdata.us/search/cruise/SP2323'],
  'OSU-SR2510': ['https://www.rvdata.us/search/cruise/SR2510'],
  'OSU-W0903B': ['https://www.rvdata.us/search/cruise/W0903B'],
  'OSU-W0906A': ['https://www.rvdata.us/search/cruise/W0906A'],
  'OSU-W0906C': ['https://www.rvdata.us/search/cruise/W0906C'],
  'OSU-W0910B': ['https://www.rvdata.us/search/cruise/W0910B']
};

const TypeTab: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  type: string;
  terms?: any;
}> = ({ label, isActive, onClick, type, terms }) => {
  return (
    <div
      className={`tab tab-lg tab-bordered ${isActive ? 'tab-active text-primary' : ''}`}
      onClick={onClick}
    >
      <b>{label}</b>
      <span className={`badge badge-md mx-2 ${isActive ? 'badge-primary' : 'badge-outline'}`}>
        <ItemsCount
          types={[type]}
          terms={terms}
          singularLabel=""
          pluralLabel=""
        />
      </span>
    </div>
  );
}

const Cruise: React.FC<{ cruiseDoc: any }> = ({ cruiseDoc }) => {
  const {
    data: results,
    isLoading: isLoadingQuery,
  } = useQuery({
    queryKey: ['osuID', cruiseDoc._osuid],
    queryFn: async () => { 
      const payload = {
        types: ['cruise', 'core', 'dive'],
        terms: {
          "_osuid.keyword": [cruiseDoc._osuid.toUpperCase()],
        },
      };
      const res = await fetch('/api/opensearch?search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorresults = await res.json();
        throw new Error(errorresults.message || 'Failed to fetch search results');
      }
      return res.json();
    },
  });

  const doc = results?.hits?.total ? results.hits.hits[0]._source : {};
  
  return (
    <>
      <div className="tabs mt-2 min-w-full">
        <div className="tab tab-lg tab-bordered tab-active text-primary"><b>{doc._osuid}</b></div>
        <TypeTab
          label="Cores"
          isActive={false}
          onClick={() => { }}
          type="core"
          terms={{ "_cruiseUUID.keyword": [doc._cruiseUUID] }}
        />
        <TypeTab
          label="Sections"
          isActive={false}
          onClick={() => { }}
          type="section"
          terms={{ "_cruiseUUID.keyword": [doc._cruiseUUID] }}
        />
        <TypeTab
          label="Rocks"
          isActive={false}
          onClick={() => { }}
          type="dive"
          terms={{ "_cruiseUUID.keyword": [doc._cruiseUUID] }}
        />
        <div className="tab tab-lg tab-bordered flex-grow"></div> 
      </div>
    </>
  );
}

// Descendant tabs per record type. Each one lists the records that carry this
// record's UUID (so a cruise gets grandchildren like Sections and Core Samples,
// not just its direct children). Subsamples carry no ancestor UUIDs in the
// index, so they are found by parent OSU ID instead.
type DescendantTab = { key: string; label: string; types: string[]; termField: string; uuidField: string };

const DESCENDANT_TABS: { [docType: string]: DescendantTab[] } = {
  cruise: [
    { key: 'cores', label: 'Cores', types: ['core'], termField: '_cruiseUUID.keyword', uuidField: '_uuid' },
    { key: 'sections', label: 'Sections', types: ['section'], termField: '_cruiseUUID.keyword', uuidField: '_uuid' },
    { key: 'coreSamples', label: 'Core Samples', types: ['coreSample'], termField: '_cruiseUUID.keyword', uuidField: '_uuid' },
    { key: 'dives', label: 'Dredges/Dives', types: ['dive'], termField: '_cruiseUUID.keyword', uuidField: '_uuid' },
    { key: 'rocks', label: 'Rocks', types: ['diveSample'], termField: '_cruiseUUID.keyword', uuidField: '_uuid' },
  ],
  core: [
    { key: 'sections', label: 'Sections', types: ['section'], termField: '_coreUUID.keyword', uuidField: '_uuid' },
    { key: 'coreSamples', label: 'Core Samples', types: ['coreSample'], termField: '_coreUUID.keyword', uuidField: '_uuid' },
  ],
  section: [
    { key: 'coreSamples', label: 'Core Samples', types: ['coreSample'], termField: '_sectionUUID.keyword', uuidField: '_uuid' },
  ],
  sectionHalf: [
    { key: 'coreSamples', label: 'Core Samples', types: ['coreSample'], termField: '_sectionHalfUUID.keyword', uuidField: '_sectionHalfUUID' },
  ],
  dive: [
    { key: 'rockSamples', label: 'Rock Samples', types: ['diveSample'], termField: '_diveUUID.keyword', uuidField: '_diveUUID' },
  ],
  diveSample: [
    { key: 'subsamples', label: 'Subsamples', types: ['diveSubsample'], termField: '_parentOSUID', uuidField: '_osuid' },
  ],
};
// Tabs left out of the modal for now; the definitions stay above so they can be
// switched back on.
const HIDDEN_DESCENDANT_TABS = ['coreSamples', 'rockSamples'];
// Hooks must run the same number of times on every render, so the descendant
// queries use a fixed number of slots regardless of record type.
const MAX_DESCENDANT_TABS = 5;

// Same loading indicator as the search results list.
const LoadingRows: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => (
  <div className="flex justify-center items-center min-h-[200px] p-4">
    <Icon name="TbLoader2" className="w-8 h-8 text-primary animate-spin" />
    <span className="ml-2">{label}</span>
  </div>
);

// Tabs with hundreds of rows (each with a map thumbnail or image) take a moment
// to render even when their data is already cached, and the click would appear
// to do nothing until React finished. This paints the loading indicator first
// and mounts the heavy content on the next frame.
const Deferred: React.FC<{ label?: string; children: React.ReactNode }> = ({ label, children }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const frame = requestAnimationFrame(() => { timer = setTimeout(() => setReady(true), 0); });
    return () => { cancelAnimationFrame(frame); if (timer) clearTimeout(timer); };
  }, []);
  return ready ? <>{children}</> : <LoadingRows label={label} />;
};

// Parent and child records render as tables laid out like the search results
// tables for the same record type, minus the Files / Related Files columns.
type Column = { header: string; render: (d: any) => React.ReactNode };

const idCell = (d: any) => (
  <>
    <b>{d._osuid}</b>
    {d._docType === 'cruise' && d._coreOSUIDs?.length > 0 && <><br/><b>Cores:</b> {numeral(d._coreOSUIDs.length).format(0)}</>}
    {d._docType === 'cruise' && d._diveOSUIDs?.length > 0 && <><br/><b>Dredges/Dives:</b> {numeral(d._diveOSUIDs.length).format(0)}</>}
    {['core', 'section', 'sectionHalf'].includes(d._docType) && d.nSections != null && <><br/><b>Sections:</b> {numeral(d.nSections).format(0)}</>}
    {SHOW_PUBLICATIONS && Array.isArray(d._publications) && d._publications.length > 0 && <><br/><b>Publications:</b> {numeral(d._publications.length).format(0)}</>}
    {d._moratorium && <div><span className="badge btn-primary badge-tag">Moratorium</span></div>}
    <DataIssueBadges doc={d} />
  </>
);

const collectionCell = (d: any) => (
  <>
    {!isPlaceholder(d.method) && <><b>Method:</b><br/>{d.method}<br/></>}
    {!isPlaceholder(d.material) && <><b>Material:</b><br/>{d.material}<br/></>}
  </>
);

const waterDepthCell = (d: any) => {
  const ws = d.waterDepthStart;
  const we = d.waterDepthEnd;
  if (ws == null && we == null) return <span className="text-gray-500">—</span>;
  const left = ws != null ? formatField('waterDepthStart', ws) : '';
  const right = we != null && ws !== we ? formatField('waterDepthEnd', we) : '';
  return <span>{left}{(ws != null && we != null && ws !== we) ? ' to ' : ''}{right} m</span>;
};

const locationCell = (d: any) => (
  <CollectionMapThumbnail
    locations={d._locations}
    lat={d.latitudeStart || d.latitudeEnd}
    lon={d.longitudeStart || d.longitudeEnd}
  />
);

const dateTimeColumn: Column = { header: 'Date Time', render: () => null }; // rendered via DateTimeCell

const TABLE_COLUMNS: { [docType: string]: Column[] } = {
  cruise: [
    { header: 'Cruise', render: idCell },
    { header: 'RV Name', render: (d) => (
      <>
        {shown(d.rvName)}
        {r2rCruiseLinks[d._osuid] && (
          <div className="mt-1 flex flex-row flex-wrap gap-1">
            {r2rCruiseLinks[d._osuid].map((link: string, idx: number) => (
              <a key={idx} href={link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                className="badge badge-ghost badge-tag hover:badge-ghost no-underline flex items-center gap-1">
                R2R<Icon name="BiLinkExternal" size="xxs" /><span className="font-normal">{link.split('/').pop()}</span>
              </a>
            ))}
          </div>
        )}
      </>
    ) },
    { header: 'Cruise PI', render: (d) => (
      <>
        {!isPlaceholder(d.pi) && <><b>{d.pi}</b><br/></>}
        {!isPlaceholder(d.piInstitution) && <>{d.piInstitution}<br/></>}
      </>
    ) },
    { header: 'Location', render: locationCell },
  ],
  core: [
    { header: 'Core', render: idCell },
    { header: 'Size', render: (d) => (
      <>
        {d.length != null && <><b>Length:</b><br/>{formatField('length', d.length)} cm<br /></>}
        {d.diameter != null && <><b>Diameter:</b><br/>{formatField('diameter', d.diameter)} cm<br /></>}
      </>
    ) },
    { header: 'Depth', render: (d) => (d.waterDepthStart != null || d.waterDepthEnd != null) ? <><b>Water Depth:</b><br />{waterDepthCell(d)}</> : null },
    { header: 'Collection', render: collectionCell },
    dateTimeColumn,
    { header: 'Location', render: locationCell },
  ],
  section: [
    { header: 'Section', render: idCell },
    { header: 'Size', render: (d) => d.depthTop != null && d.depthBottom != null
      ? <><b>Length:</b><br />{formatField('length', parseFloat(d.depthBottom) - parseFloat(d.depthTop))} cm<br /></> : null },
    { header: 'Depth', render: (d) => (d.depthTop != null || d.depthBottom != null)
      ? <><b>Core Depth:</b><br />{d.depthTop != null ? formatField('depthTop', d.depthTop) : ''}{d.depthTop != null && d.depthBottom != null ? ' - ' : ''}{d.depthBottom != null ? formatField('depthBottom', d.depthBottom) : ''} cm<br /></> : null },
    { header: 'Location', render: locationCell },
  ],
  sectionHalf: [
    { header: 'Section Half', render: idCell },
    { header: 'Half', render: (d) => shown(d.halfType) || <span className="text-gray-500">—</span> },
    { header: 'Depth', render: (d) => (d.depthTop != null || d.depthBottom != null)
      ? <>{d.depthTop != null ? formatField('depthTop', d.depthTop) : ''}{d.depthTop != null && d.depthBottom != null ? ' - ' : ''}{d.depthBottom != null ? formatField('depthBottom', d.depthBottom) : ''} cm</> : null },
  ],
  dive: [
    { header: 'Rock', render: idCell },
    { header: 'Collection', render: collectionCell },
    { header: 'Location', render: locationCell },
  ],
  diveSample: [
    { header: 'Rock Sample', render: idCell },
    dateTimeColumn,
    { header: 'Water Depth', render: waterDepthCell },
    { header: 'Texture', render: (d) => shown(d.texture) || <span className="text-gray-500">—</span> },
    { header: 'Location', render: locationCell },
  ],
  diveSubsample: [
    { header: 'Subsample', render: idCell },
    { header: 'Collection', render: collectionCell },
    { header: 'Weight', render: (d) => d.weight != null && d.weight !== '' ? <>{formatField('weight', d.weight)} kg</> : <span className="text-gray-500">—</span> },
    { header: 'Location', render: locationCell },
  ],
  coreSample: [
    { header: 'Core Sample', render: idCell },
    { header: 'Collection', render: collectionCell },
    { header: 'Depth', render: (d) => (d.depthTop != null || d.depthBottom != null)
      ? <>{d.depthTop != null ? formatField('depthTop', d.depthTop) : ''}{d.depthTop != null && d.depthBottom != null ? ' - ' : ''}{d.depthBottom != null ? formatField('depthBottom', d.depthBottom) : ''} cm</> : <span className="text-gray-500">—</span> },
    { header: 'Location', render: locationCell },
  ],
};
const DEFAULT_COLUMNS: Column[] = [
  { header: 'Record', render: idCell },
  { header: 'Collection', render: collectionCell },
  { header: 'Location', render: locationCell },
];

const RecordTable: React.FC<{ rows: any[]; docType: string; onNavigate?: (osuid: string) => void }> = ({ rows, docType, onNavigate }) => {
  const cols = TABLE_COLUMNS[docType] || DEFAULT_COLUMNS;
  return (
    <div className="overflow-x-auto w-full">
      <table className="table table-compact w-full min-w-full mt-0">
        <thead className="sticky top-0 z-10 bg-base-100">
          <tr>{cols.map((c) => <th key={c.header} className="rounded-none">{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d._osuid} className="hover cursor-pointer" onClick={() => onNavigate?.(d._osuid)}>
              {cols.map((c, i) => c === dateTimeColumn
                ? <DateTimeCell key={c.header} source={d} />
                : <td key={c.header} className={`align-top ${i === 0 ? '!whitespace-nowrap w-px' : ''}`}>{c.render(d)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// "Loading more" spinner at the end of a list, as on the search page.
const LoadingMore: React.FC = () => (
  <div className="flex justify-center items-center py-4">
    <Icon name="TbLoader2" className="w-6 h-6 text-primary animate-spin" />
    <span className="ml-2">Loading more...</span>
  </div>
);

// End-of-list trigger. Only the first page loads on its own; the next page is
// fetched when this scrolls INTO view (it must have been out of view first, so
// a short first page never auto-fills the pane). A "Load more" button covers
// the case where the list is too short to scroll at all.
const LoadMore: React.FC<{ onMore: () => void }> = ({ onMore }) => {
  const [ref, isVisible] = useInView({ threshold: 0 });
  const callback = useRef(onMore);
  callback.current = onMore;
  const wasHidden = useRef(false);
  useEffect(() => {
    if (!isVisible) { wasHidden.current = true; return; }
    if (wasHidden.current) { wasHidden.current = false; callback.current(); }
  }, [isVisible]);
  return (
    <div ref={ref} className="flex justify-center py-2">
      <button type="button" className="btn btn-sm btn-ghost" onClick={() => callback.current()}>Load more</button>
    </div>
  );
};

const DescendantsPanel: React.FC<{ tab: DescendantTab; query: any; onNavigate?: (osuid: string) => void }> = ({ tab, query, onNavigate }) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const hits = (data?.pages || []).flatMap((p: any) => p?.hits?.hits || []);
  const loadMore = () => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); };
  return (
    <div>
      {isLoading && <LoadingRows label={`Loading ${tab.label.toLowerCase()}...`} />}
      {!isLoading && hits.length === 0 && <p className="text-gray-500 p-4">No {tab.label.toLowerCase()} found for this record.</p>}
      {!isLoading && hits.length > 0 && (
        <Deferred label={`Loading ${tab.label.toLowerCase()}...`}>
          <RecordTable rows={hits.map((h: any) => h._source)} docType={tab.types[0]} onNavigate={onNavigate} />
          {isFetchingNextPage && <LoadingMore />}
          {hasNextPage && !isFetchingNextPage && <LoadMore onMore={loadMore} />}
        </Deferred>
      )}
    </div>
  );
};

const ANCESTOR_TYPES = ['cruise', 'core', 'dive', 'section', 'sectionHalf', 'diveSample', 'diveSubsample', 'coreSample'];

const getAncestorTypeLabel = (docType: string, method?: string) => {
  switch (docType) {
    case 'cruise': return 'Cruise';
    case 'core': return 'Core';
    case 'section': return 'Section';
    case 'sectionHalf': return 'Section Half';
    case 'dive': return getDiveMethodLabel(method);
    case 'diveSample': return 'Rock Sample';
    case 'diveSubsample': return 'Rock Subsample';
    case 'coreSample': return 'Core Sample';
    default: return docType ? docType.charAt(0).toUpperCase() + docType.slice(1) : 'Item';
  }
};

// Walk up the _parentOSUID chain, fetching each real ancestor document (immediate
// parent first, then reversed to top-down: cruise → ... → immediate parent).
const useAncestors = (doc: any) => {
  return useQuery({
    queryKey: ['ancestors', doc?._osuid],
    enabled: !!doc?._parentOSUID,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const chain: any[] = [];
      const seen = new Set<string>();
      let parentOSUID: string | undefined = doc?._parentOSUID;
      while (parentOSUID && !seen.has(parentOSUID)) {
        seen.add(parentOSUID);
        const res = await fetch('/api/opensearch?search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ types: ANCESTOR_TYPES, terms: { '_osuid.keyword': [parentOSUID] } }),
        });
        if (!res.ok) break;
        const results = await res.json();
        const src = results?.hits?.hits?.[0]?._source;
        if (!src) break;
        chain.push(src);
        parentOSUID = src._parentOSUID;
      }
      return chain.reverse();
    },
  });
};

// ---------------------------------------------------------------------------
// Tabbed modal layout
// ---------------------------------------------------------------------------

type ModalTab = { key: string; label: string; count?: number; isLoading?: boolean };

// Count badge in the same style as the search results tabs (SearchTab in search.tsx).
const TabCount: React.FC<{ count?: number; isLoading?: boolean; active: boolean; size?: 'md' | 'sm' }> = ({ count, isLoading, active, size = 'md' }) => (
  <span className={`badge ${size === 'sm' ? 'badge-sm' : 'badge-md'} ${active ? 'badge-primary' : 'badge-outline'}`}>
    {isLoading
      ? <Icon name="TbLoader2" size="1rem" className="animate-spin" />
      : <b>{numeral(count ?? 0).format('0,0')}</b>}
  </span>
);

const hasCount = (t: ModalTab) => t.count !== undefined || t.isLoading;

// Left-hand vertical tab list on large screens; on smaller screens it collapses
// into the current-tab button + dropdown used by the search results tabs.
const SectionTabs: React.FC<{ tabs: ModalTab[]; active: string; onSelect: (key: string) => void }> = ({ tabs, active, onSelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const current = tabs.find(t => t.key === active) || tabs[0];
  if (!current) return null;
  return (
    <>
      {/* Desktop: vertical tabs */}
      <nav className="hidden lg:flex flex-col w-max shrink-0 grow-0 self-stretch overflow-y-auto gap-1 py-4 pr-4 border-r border-base-300 not-prose">
        {tabs.map(t => {
          const isActive = t.key === current.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onSelect(t.key)}
              className={`flex items-center justify-between gap-3 px-3 py-2 rounded-r-lg text-left border-l-4 whitespace-nowrap transition-colors ${
                isActive ? 'border-primary bg-primary/10 text-primary' : 'border-transparent hover:bg-base-200'
              }`}
            >
              <b>{t.label}</b>
              {hasCount(t) && <TabCount count={t.count} isLoading={t.isLoading} active={isActive} />}
            </button>
          );
        })}
      </nav>

      {/* Mobile: current tab + menu, pinned above the scrolling panel. The menu
          opens in normal flow (not as an overlay) so the panel below can't clip it. */}
      <div className="lg:hidden shrink-0 px-4 pt-4 not-prose">
        <div className="tabs flex-nowrap min-w-full px-0">
          <button
            type="button"
            className="tab tab-lg tab-bordered tab-active text-primary justify-between no-animation px-0 min-w-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="flex items-center gap-2 mr-2 min-w-0">
              <b className="truncate">{current.label}</b>
              {hasCount(current) && <TabCount count={current.count} isLoading={current.isLoading} active />}
            </div>
            <Icon name={isMenuOpen ? 'LuChevronUp' : 'LuChevronDown'} size="xxs" />
          </button>
          <div className="tab tab-lg tab-bordered flex-grow" onClick={() => setIsMenuOpen(!isMenuOpen)}></div>
        </div>

        {isMenuOpen && (
          <ul className="menu flex-nowrap max-h-[50vh] overflow-y-auto bg-base-100 rounded-box w-full p-1 shadow border mt-2 list-none m-0">
            {tabs.map(t => (
              <li key={t.key}>
                <div
                  onClick={() => { onSelect(t.key); setIsMenuOpen(false); }}
                  className={`flex items-center justify-between ${t.key === current.key ? 'active' : ''}`}
                >
                  <span>{t.label}</span>
                  {hasCount(t) && <TabCount count={t.count} isLoading={t.isLoading} active={false} size="sm" />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

// The OSU ID a file belongs to is embedded in its file name (the same pattern
// the pipeline uses to attach files to records). Falls back to the file name.
const FILE_OSUID_RE = /LDCR-([^/~]+?)(?:-(?:coredescription|coringdatasheet|cruisereport|dredgelog|image|itraximage|itraxxray|xray|field\d*|field\.wr|ts\.(?:ppl|xpl)(?:\.foi)?|wr(?:\.foi)?|mst|ptmag|xrfdata|igsnsheet|ctscan|publications|imlgsfile))/i;
const fileOsuId = (path: string): string => {
  const m = FILE_OSUID_RE.exec(path || '');
  if (m) return `LDCR-${m[1].toUpperCase()}`;
  const name = (path || '').split('/').pop() || 'File';
  return name.replace(/\.[^.]+$/, '');
};

// Tab label for a file type: "Core Description" -> "Core Descriptions",
// "CT Density" -> "CT Densities", "XRF Data" stays. Labels that end in an
// adjective ("Thin Section Cross-Polarized") get "Images"/"Files" appended.
const pluralizeLabel = (label: string, fileType: string) => {
  if (/(data|s)$/i.test(label)) return label;
  if (/y$/i.test(label)) return label.replace(/y$/i, 'ies');
  if (/(image|description|sheet|report|log|foi|file)$/i.test(label)) return `${label}s`;
  return `${label} ${fileType.includes('image') ? 'Images' : 'Files'}`;
};

// One tab per file type. A record's own files come first ("Core Descriptions");
// files the pipeline inherited from ancestors (_parentFiles, e.g. the cruise
// report) or adopted from descendants (_childFiles, e.g. every section image
// under a core) are merged into "Related …" tabs after them.
type FileTab = ModalTab & { fileType: string; files: any[]; moratoriumFiles: any[]; related: boolean };

const buildFileTabs = (doc: any): FileTab[] => {
  const groups: { [key: string]: FileTab } = {};
  const add = (list: any[], related: boolean, moratorium: boolean) => {
    (list || []).filter(isVisibleFile).forEach((f: any) => {
      const fileType = f?.type || 'file';
      const key = `${related ? 'related' : 'files'}:${fileType}`;
      if (!groups[key]) {
        groups[key] = {
          key,
          label: `${related ? 'Related ' : ''}${pluralizeLabel(getFileTypeLabel(fileType), fileType)}`,
          count: 0,
          fileType,
          files: [],
          moratoriumFiles: [],
          related,
        };
      }
      (moratorium ? groups[key].moratoriumFiles : groups[key].files).push(f);
      groups[key].count = (groups[key].count || 0) + 1;
    });
  };
  add(doc?._files, false, false);
  add(doc?._moratorium_files, false, true);
  add(doc?._parentFiles, true, false);
  add(doc?._parentMoratoriumFiles, true, true);
  add(doc?._childFiles, true, false);
  add(doc?._childMoratoriumFiles, true, true);
  return Object.values(groups).sort((x, y) =>
    x.related === y.related ? x.label.localeCompare(y.label) : (x.related ? 1 : -1));
};

// Image file types that are long strips scanned top-to-bottom; they are shown
// rotated -90° (top of the strip on the left) so they read across the row.
const ROTATED_IMAGE_TYPES = ['core-image'];

// A core-image strip shown the long way across the row. Once the natural size
// is known: a tall image (height > width) is rotated -90° inside a box with the
// inverse aspect ratio, so it becomes wide without dead space; an image that is
// already wide is rotated 180° (its box is unchanged).
const RotatedImage: React.FC<{ src: string; alt: string; onLoaded?: (w: number, h: number) => void }> = ({ src, alt, onLoaded }) => {
  const [ratio, setRatio] = useState<number | null>(null); // naturalWidth / naturalHeight
  const tall = ratio != null && ratio < 1;
  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setRatio(img.naturalWidth / img.naturalHeight);
      onLoaded?.(img.naturalWidth, img.naturalHeight);
    }
  };
  if (ratio != null && !tall) {
    return <img src={src} alt={alt} onLoad={onLoad} className="block w-full h-auto m-0" style={{ transform: 'rotate(180deg)' }} />;
  }
  return (
    <div
      className="relative w-full overflow-hidden bg-base-200"
      style={ratio ? { aspectRatio: `${1 / ratio}` } : { minHeight: '4rem' }}
    >
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        className={`absolute left-1/2 top-1/2 max-w-none m-0 ${ratio ? '' : 'opacity-0'}`}
        style={{
          width: ratio ? `${ratio * 100}%` : 'auto',
          height: 'auto',
          transform: 'translate(-50%, -50%) rotate(-90deg)',
        }}
      />
    </div>
  );
};

// Icon for a non-image file, by file type or extension.
const fileIconName = (type: string, path: string) => {
  const t = (type || '').toLowerCase();
  const ext = (path || '').split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf' || t.includes('description') || t.includes('report') || t.includes('log') || t.includes('sheet')) return 'TbFileText';
  if (['xlsx', 'xls', 'csv', 'tsv', 'txt'].includes(ext) || t.includes('data')) return 'TbFileSpreadsheet';
  if (['jpg', 'jpeg', 'png', 'gif', 'tif', 'tiff', 'bmp', 'webp'].includes(ext) || t.includes('image')) return 'TbPhoto';
  if (['doc', 'docx'].includes(ext)) return 'TbFileDescription';
  return 'TbFile';
};

const isImagePath = (path: string) =>
  ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes((path || '').split('.').pop()?.toLowerCase() || '');

// File size from a HEAD request to the file proxy (the index stores no sizes).
const useFileSize = (path: string) =>
  useQuery({
    queryKey: ['fileSize', path],
    enabled: !!path,
    staleTime: Infinity,
    retry: false,
    queryFn: async () => {
      const res = await fetch(`/api/file/${path}`, { method: 'HEAD' });
      if (!res.ok) return null;
      const len = res.headers.get('content-length');
      return len ? parseInt(len, 10) : null;
    },
  });

const FileRow: React.FC<{ file: any; moratorium: boolean; rotate: boolean }> = ({ file, moratorium, rotate }) => {
  const id = fileOsuId(file.path);
  const url = `/api/file/${file.path}`;
  const ext = ((file.path || '').split('.').pop() || 'file').toUpperCase();
  const image = !moratorium && isImagePath(file.path);
  const { data: size } = useFileSize(moratorium ? '' : file.path);
  const [dims, setDims] = useState<string | null>(null);
  const onLoaded = (w: number, h: number) => setDims(`${w} × ${h}`);
  return (
    <tr>
      <td className="align-top !whitespace-nowrap w-px">
        <b>{id}</b>
        <div className="flex flex-col items-start gap-1 mt-1">
          {moratorium && <span className="badge badge-warning badge-tag">Moratorium</span>}
          <span className="badge badge-ghost badge-tag">{ext}</span>
          {size != null && <span className="badge badge-ghost badge-tag">{numeral(size).format('0.0 b')}</span>}
          {dims && <span className="badge badge-ghost badge-tag">{dims} px</span>}
        </div>
      </td>
      <td className="align-top w-full">
        {moratorium ? (
          <span className="btn btn-outline no-animation h-auto min-h-0 py-3 px-4 gap-3 opacity-60 cursor-not-allowed">
            <Icon name="TbLock" className="w-6 h-6 text-warning" />{ext}
          </span>
        ) : image ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="block w-full no-underline">
            {rotate
              ? <RotatedImage src={url} alt={id} onLoaded={onLoaded} />
              : <img src={url} alt={id} className="block w-full h-auto m-0" loading="lazy"
                  onLoad={(e) => onLoaded(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)} />}
          </a>
        ) : (
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-outline h-auto min-h-0 py-3 px-4 gap-3 no-underline hover:bg-primary hover:text-white">
            <Icon name={fileIconName(file.type, file.path)} className="w-6 h-6" />{ext}
          </a>
        )}
      </td>
    </tr>
  );
};

// Every file tab is a two-column grid: record ID (with file size and, for
// images, pixel dimensions underneath), then the file. Image files show the
// image itself (core images rotated); anything else, or an image type stored in
// a format the browser can't show, gets a button with a PDF / data / image /
// document icon and the file extension. Same table markup as the record tables
// so headers match; the ID column is pinned to its content width (1px + nowrap)
// and the file column takes all remaining width.
const FileTable: React.FC<{ tab: FileTab }> = ({ tab }) => {
  const rotate = ROTATED_IMAGE_TYPES.includes(tab.fileType);
  const rows = [
    ...tab.files.map((f: any) => ({ file: f, moratorium: false })),
    ...tab.moratoriumFiles.map((f: any) => ({ file: f, moratorium: true })),
  ];
  const anyImages = rows.some(({ file }) => isImagePath(file.path));
  // Files are already in memory, but each row loads an image or a HEAD request,
  // so rows are revealed a page at a time as the list is scrolled.
  const [limit, setLimit] = useState(PAGE_SIZE);
  const showMore = () => setLimit((n) => Math.min(n + PAGE_SIZE, rows.length));
  return (
    <div className="overflow-x-auto w-full">
      <table className="table table-compact w-full min-w-full mt-0">
        <thead className="sticky top-0 z-10 bg-base-100">
          <tr>
            <th className="rounded-none w-px whitespace-nowrap">ID</th>
            <th className="rounded-none">{anyImages ? 'Image' : 'File'}</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, limit).map(({ file, moratorium }, index) => (
            <FileRow key={`${moratorium ? 'm' : 'f'}-${index}`} file={file} moratorium={moratorium} rotate={rotate} />
          ))}
        </tbody>
      </table>
      {limit < rows.length && <LoadMore onMore={showMore} />}
    </div>
  );
};

const FileTypePanel: React.FC<{ tab: FileTab }> = ({ tab }) => (
  <Deferred label={`Loading ${tab.label.toLowerCase()}...`}>
    <FileTable tab={tab} />
  </Deferred>
);

// Each ancestor gets its own tab (Cruise, Core, Section, …), keyed by OSU ID.
const parentTabKey = (ancestor: any) => `parent:${ancestor._osuid}`;

// Set by the search modal: values that are also search filters get a filter
// icon (filterBy names the key in search.filters) that runs that search.
const DetailFilterContext = React.createContext<{ onFilter?: OnDetailFilter; docType: string }>({ docType: '' });

const DetailRow: React.FC<{ label: string; value: any; field?: string; suffix?: string; className?: string; filterBy?: string }> = ({ label, value, field = '', suffix = '', className = '', filterBy }) => {
  const { onFilter, docType } = React.useContext(DetailFilterContext);
  if (isPlaceholder(value) || value === false) return null;
  return (
    <p className={`m-0 ${className}`}>
      <strong>{label}:</strong> {formatField(field, value)}{suffix}
      {filterBy && onFilter && typeof value === 'string' && (
        <DetailFilterButton filter={{ key: filterBy, value, label }} docType={docType} onFilter={onFilter} />
      )}
    </p>
  );
};

// Map at the top of the Details tab: a cruise's stations, or the record's own
// position among the rest of its cruise's stations (muted: grey, labelled only
// in their tooltips). Sections normally carry coordinates inherited from their
// core; the rare one that doesn't falls back to the core from the parent chain
// the modal already fetched. Rocks are plotted as their dredge/dive.
const mapType = (docType: string) => (['dive', 'diveSample', 'diveSubsample'].includes(docType) ? 'dive' : 'core');
// A cruise's cores and dredges/dives as stations along its track, with the
// R/V, PI and dates its tooltips show (the cruise's _locations carry only
// positions).
const STOP_FIELDS = ['_osuid', '_docType', 'latitudeStart', 'longitudeStart', 'latitudeEnd', 'longitudeEnd',
  'startDate', 'startTime', 'endDate', 'endTime', 'date', 'time', 'rvName', 'pi'];
const joinDateTime = (date: string | null, time: string | null) => [date, time].filter(Boolean).join(' ') || undefined;
const toTrackStop = (d: any): TrackStop | null => {
  const point = toMapPoint(d, mapType(d._docType));
  if (!point) return null;
  const startDate = formatDate(d.startDate) || formatDate(d.date);
  const endDate = formatDate(d.endDate);
  const endTime = formatTime(d.endTime);
  const time = Date.parse(d.startDate || d.date);
  return {
    lon: point.lon,
    lat: point.lat,
    rv: shown(d.rvName) || undefined,
    pi: shown(d.pi) || undefined,
    start: joinDateTime(startDate, formatTime(d.startTime) || formatTime(d.time)),
    end: endDate || endTime ? joinDateTime(endDate || startDate, endTime) : undefined,
    time: isNaN(time) ? undefined : time,
  };
};
const useTrackStops = (cruiseUUID?: string) => useQuery({
  queryKey: ['trackStops', cruiseUUID],
  enabled: Boolean(cruiseUUID),
  staleTime: 5 * 60 * 1000,
  queryFn: async (): Promise<TrackStop[]> => {
    const res = await fetch('/api/opensearch?search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ types: ['core', 'dive'], terms: { '_cruiseUUID.keyword': [cruiseUUID] }, sortOrder: 'ids asc', size: 5000, _source: STOP_FIELDS }),
    });
    if (!res.ok) return [];
    const results = await res.json();
    return ((results?.hits?.hits || []) as any[]).map(h => toTrackStop(h._source)).filter((s): s is TrackStop => s !== null);
  },
});

const DetailsGlobe: React.FC<{ doc: any; ancestors?: any[]; onNavigate?: (osuid: string) => void }> = ({ doc, ancestors, onNavigate }) => {
  // The cruise's stations: the record itself for a cruise, else its cruise
  // from the parent chain.
  const cruise = doc._docType === 'cruise' ? doc : (ancestors || []).find((a: any) => a._docType === 'cruise');
  const stations = useMemo((): MapPoint[] => ((cruise?._locations || []) as any[])
    .map(loc => toMapPoint(loc, mapType(loc._docType)))
    .filter((p): p is MapPoint => p !== null), [cruise]);
  // Memoised: the map re-centres whenever its points change.
  const points = useMemo((): MapPoint[] => {
    if (doc._docType === 'cruise') return stations;
    const hasCoords = (d: any) => d && (d.latitudeStart != null || d.latitudeEnd != null || d.longitudeStart != null || d.longitudeEnd != null);
    const src = hasCoords(doc)
      ? doc
      : (doc._docType === 'section' ? (ancestors || []).find((a: any) => a._docType === 'core' && hasCoords(a)) : null);
    const point = src && toMapPoint({ ...src, _osuid: doc._osuid }, mapType(doc._docType));
    if (!point) return [];
    // The record's own station (a section's or rock's is its core's or
    // dredge/dive's) is left out of the muted ones.
    const others = stations
      .filter(p => p.name !== point.name && pointKey(p) !== pointKey(point))
      .map(p => ({ ...p, muted: true }));
    return [...others, point];
  }, [doc, ancestors, stations]);
  // The cruise's ship track behind the markers (see pages/api/cruise-track),
  // for a cruise or any record from one, for context. Without it, the
  // cruise's stations are joined in order instead, dashed.
  const cruiseOsuid: string | undefined = cruise?._osuid;
  const { data: cruiseTrack, isFetched: trackFetched } = useQuery({
    queryKey: ['cruiseTrack', cruiseOsuid],
    queryFn: async () => {
      const response = await fetch(`/api/cruise-track/${encodeURIComponent(cruiseOsuid!)}`);
      return response.ok ? response.json() : null;
    },
    enabled: Boolean(cruiseOsuid),
    staleTime: Infinity,
  });
  // Hovering the track shows the cruise's R/V, PI and the dates between the
  // stations either side.
  const { data: stops } = useTrackStops(cruise?._uuid);
  const track = useMemo(() => {
    const info: TrackInfo = { name: cruise?._osuid, rv: shown(cruise?.rvName) || undefined, pi: shown(cruise?.pi) || undefined, stops };
    if (cruiseTrack?.geometry) return { geometry: cruiseTrack.geometry, approximate: false, info };
    const line = trackFetched ? stationLine(stations) : null;
    return line ? { geometry: line, approximate: true, info } : null;
  }, [cruiseTrack, trackFetched, stations, cruise, stops]);
  if (!points.length) return null;
  return (
    <div className="relative border border-base-300 rounded-lg overflow-hidden mb-4 h-[300px]">
      <MapLibreMap mode="globe" points={points} onSelect={onNavigate} fit labelPoints track={track} />
    </div>
  );
};

// Start/end pairs collapse to one value when only one side exists or both are
// the same: "Water Depth: 312 – 939 m", "Water Depth: 312 m", "Date: 1994-01-05".
const present = (v: any) => !isPlaceholder(v);
const rangeText = (a: any, b: any): string | null => {
  const hasA = present(a), hasB = present(b);
  if (hasA && hasB && String(a) !== String(b)) return `${a} – ${b}`;
  if (hasA) return String(a);
  if (hasB) return String(b);
  return null;
};
const latLonText = (lat: any, lon: any): string | null =>
  present(lat) && present(lon) ? `${lat}°, ${lon}°` : null;

// Rows for the location, depth and date/time pairs of a record.
const PairedRows: React.FC<{ doc: any }> = ({ doc }) => {
  const start = latLonText(formatField('latitudeStart', doc.latitudeStart), formatField('longitudeStart', doc.longitudeStart));
  const end = latLonText(formatField('latitudeEnd', doc.latitudeEnd), formatField('longitudeEnd', doc.longitudeEnd));
  const depth = rangeText(formatField('waterDepthStart', doc.waterDepthStart), formatField('waterDepthEnd', doc.waterDepthEnd));
  const date = rangeText(formatDate(doc.startDate) || formatDate(doc.date), formatDate(doc.endDate));
  const time = rangeText(formatTime(doc.startTime) || formatTime(doc.time), formatTime(doc.endTime));
  return (
    <>
      {date && <DetailRow label="Date" value={date} />}
      {time && <DetailRow label="Time" value={time} />}
      {start && end && start !== end ? (
        <>
          <DetailRow label="Lat/Lon Start" value={start} />
          <DetailRow label="Lat/Lon End" value={end} />
        </>
      ) : (
        <>
          {(start || end) && <DetailRow label="Lat/Lon" value={start || end} />}
          {/* A lone latitude or longitude without its partner, shown on its own. */}
          {!start && !end && present(doc.latitudeStart) && <DetailRow label="Latitude" value={formatField('latitudeStart', doc.latitudeStart)} suffix="°" />}
          {!start && !end && present(doc.longitudeStart) && <DetailRow label="Longitude" value={formatField('longitudeStart', doc.longitudeStart)} suffix="°" />}
        </>
      )}
      {depth && <DetailRow label="Water Depth" value={depth} suffix=" m" />}
    </>
  );
};

const DetailsPanel: React.FC<{ doc: any; ancestors?: any[]; onNavigate?: (osuid: string) => void; onFilter?: OnDetailFilter }> = ({ doc, ancestors, onNavigate, onFilter }) => {
  const t = doc._docType;
  const idLabel =
    t === 'cruise' ? 'Cruise ID' :
    t === 'core' ? 'Core ID' :
    t === 'section' ? 'Section ID' :
    t === 'sectionHalf' ? 'Section Half ID' :
    t === 'dive' ? `${getDiveMethodLabel(doc.method)} ID` :
    t === 'diveSample' ? 'Sample ID' :
    t === 'diveSubsample' ? 'Subsample ID' :
    t === 'coreSample' ? 'Sample ID' : 'ID';
  const isRock = ['diveSample', 'diveSubsample', 'coreSample'].includes(t);
  return (
    <DetailFilterContext.Provider value={{ onFilter, docType: t }}>
    <div className="p-4">
      <DetailsGlobe doc={doc} ancestors={ancestors} onNavigate={onNavigate} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        <DetailRow label={idLabel} value={doc.id} />
        {(t === 'dive' || t === 'diveSample' || t === 'diveSubsample') && <DetailRow label="Title" field="title" value={doc.title} />}
        {t === 'sectionHalf' && <DetailRow label="Half Type" field="halfType" value={doc.halfType} />}
        {(t === 'cruise' || t === 'core' || t === 'dive') && <DetailRow label="Research Vessel" field="rvName" value={doc.rvName} filterBy="rvNames" />}
        {(t === 'cruise' || t === 'core' || t === 'dive') && <DetailRow label="PI" field="pi" value={doc.pi} filterBy="institutions" />}
        {t === 'cruise' && <DetailRow label="PI Institution" field="piInstitution" value={doc.piInstitution} />}
        {t !== 'cruise' && <DetailRow label="Material" field="material" value={doc.material} filterBy="materialTypes" />}
        {(t === 'core' || t === 'dive' || isRock) && <DetailRow label="Method" field="method" value={doc.method} filterBy="methods" />}
        {isRock && doc.weight != null && <DetailRow label="Weight" value={formatField('weight', doc.weight)} suffix=" kg" />}
        {(t === 'core' || t === 'section' || t === 'sectionHalf') && <DetailRow label="Diameter" value={formatField('diameter', doc.diameter)} suffix=" cm" />}
        {(t === 'section' || t === 'sectionHalf' || t === 'coreSample') && doc.depthTop != null && doc.depthBottom != null && (
          <p className="m-0"><strong>Depth Range:</strong> {formatField('depthTop', doc.depthTop)} - {formatField('depthBottom', doc.depthBottom)} cm</p>
        )}
        {(t === 'core' || t === 'section' || t === 'sectionHalf') && <DetailRow label="Length" value={formatField('length', doc.length)} suffix=" cm" />}
        {t === 'sectionHalf' && <DetailRow label="Thickness" value={formatField('thickness', doc.thickness)} suffix=" cm" />}
        {(t === 'section' || t === 'sectionHalf' || isRock) && <DetailRow label="Texture" field="texture" value={doc.texture} filterBy="textures" />}
        {(t === 'sectionHalf' || isRock) && <DetailRow label="Color" field="color" value={doc.color} />}
        {t === 'core' && <DetailRow label="Sections" field="nSections" value={doc.nSections} />}
        {t === 'dive' && doc.nSections != null && <DetailRow label="Samples" field="nSections" value={doc.nSections} />}
        {t !== 'section' && t !== 'sectionHalf' && <DetailRow label="Area" field="area" value={doc.area} />}
        <PairedRows doc={doc} />
        {t === 'cruise' && r2rCruiseLinks[doc._osuid] && (
          <div className="md:col-span-2 mt-2">
            <strong>External Links:</strong>
            <ul className="m-0 mt-1 pl-5 text-sm">
              {r2rCruiseLinks[doc._osuid].map((link: string, idx: number) => (
                <li key={idx} className="m-0">
                  <a href={link} target="_blank" rel="noopener noreferrer" className="no-underline font-normal hover:underline">
                    {r2rPageTitle(link)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {SHOW_PUBLICATIONS && Array.isArray(doc._publications) && doc._publications.length > 0 && (
          <div className="md:col-span-2 mt-2">
            <strong>Publications:</strong>
            <ul className="m-0 mt-1 pl-5 text-sm">
              {doc._publications.map((pub: any, idx: number) => (
                <li key={idx} className="m-0">
                  {/* The whole citation is the link so it is easy to hit; the DOI itself sits in the tooltip. */}
                  <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                    title={`doi:${pub.doi}`} className="no-underline font-normal hover:underline"
                    dangerouslySetInnerHTML={{ __html: isPlaceholder(pub.citation) ? `doi:${pub.doi}` : citationHtml(pub.citation) }} />
                  {pub.confidence && pub.confidence !== 'high' && (
                    <span className="badge badge-ghost badge-xs ml-1 align-middle" title="Link inferred from cruise folder, dataset metadata, or free text rather than a direct citation of this ID">inferred</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {!isPlaceholder(doc.description) && <p className="text-sm mt-4">{doc.description}</p>}
    </div>
    </DetailFilterContext.Provider>
  );
};

// `compact` drops the page gutters/margins for use inside the search modal.
export const LandingPage: React.FC<{ data: any; osuId?: string; compact?: boolean; onDocumentLoaded?: (doc: any) => void; onNavigateToChild?: (osuid: string) => void; onFilter?: OnDetailFilter }> = ({
    data,
    osuId,
    compact = false,
    onDocumentLoaded,
    onNavigateToChild,
    onFilter
}) => {
  const { asPath } = useRouter();
  
  // Use passed osuId prop or extract from URL
  const osuID = osuId || asPath.substring(1); // Remove leading slash from path if no osuId provided
	
  const viewRawData = false;  //!process.env.VERCEL;

  const {
    data: results,
    isLoading: isLoadingQuery,
  } = useQuery({
    queryKey: ['osuID', osuID],
    queryFn: async () => { 
      const payload = {
        types: ['cruise', 'core', 'dive', 'section', 'sectionHalf', 'diveSample', 'diveSubsample', 'coreSample'],
        terms: {
          "_osuid.keyword": [osuID.toUpperCase()],
        },
      };
      const res = await fetch('/api/opensearch?search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorresults = await res.json();
        throw new Error(errorresults.message || 'Failed to fetch search results');
      }
      return res.json();
    },
  });

  const doc = (results?.hits?.total?.value > 0 || results?.hits?.total > 0) && results?.hits?.hits?.[0]?._source 
    ? results.hits.hits[0]._source 
    : {};

  // Section halves and core samples are not shown as records: a link to one
  // (e.g. OSU-CASCADES-82-1DC-5R) opens its parent instead. A core sample's
  // parent is usually a section half, which redirects again to its section.
  // Done from the loaded record's type rather than by ID pattern, because
  // cores, sections and rock samples can also have IDs ending in a digit plus
  // a letter.
  const redirectTo = ['sectionHalf', 'coreSample'].includes(doc._docType) && doc._parentOSUID ? doc._parentOSUID : null;
  useEffect(() => {
    if (redirectTo && onNavigateToChild) onNavigateToChild(redirectTo);
  }, [redirectTo, onNavigateToChild]);

  // Notify parent component when document is loaded
  useEffect(() => {
    if (onDocumentLoaded && doc._osuid && !redirectTo) {
      onDocumentLoaded(doc);
    }
  }, [doc, onDocumentLoaded, redirectTo]);

  // Active tab; back to Details whenever the modal navigates to another record.
  const [activeTab, setActiveTab] = useState('details');
  useEffect(() => { setActiveTab('details'); }, [osuID]);

  // Counts for the tab badges. These share query keys with the panels, so the
  // panel render never triggers a second fetch.
  const { data: ancestors, isLoading: isAncestorsLoading } = useAncestors(doc);
  const descendantTabs: DescendantTab[] = (DESCENDANT_TABS[doc._docType] || [])
    .filter(t => !!doc[t.uuidField] && !HIDDEN_DESCENDANT_TABS.includes(t.key));
  const slot = (i: number) => {
    const t = descendantTabs[i];
    return useChildDocs(t ? `${doc._docType}:${t.key}` : 'unused', t?.types || [], t?.termField || '', t ? doc[t.uuidField] : undefined);
  };
  const descendantResults = [slot(0), slot(1), slot(2), slot(3), slot(4)];

  const fileTabs = buildFileTabs(doc);
  const issues = getDataIssues(doc);
  const issueCount = issues.errors.length + issues.warnings.length;

  // Tabs with nothing in them are hidden; a tab whose count is still loading
  // stays visible with a spinner until the count is known.
  const tabs: ModalTab[] = [];
  const pushIfAny = (tab: ModalTab) => {
    if (tab.isLoading || (tab.count ?? 0) > 0) tabs.push(tab);
  };
  if (doc._docType) {
    tabs.push({ key: 'details', label: 'Details' });
    // Parents first (Cruise, Core, …), then descendants, then file types.
    if (doc._parentOSUID) {
      if (isAncestorsLoading) {
        tabs.push({ key: 'parents-loading', label: 'Parents', isLoading: true });
      } else {
        (ancestors || []).forEach((a: any) => {
          tabs.push({ key: parentTabKey(a), label: getAncestorTypeLabel(a._docType, a.method) });
        });
      }
    }
    descendantTabs.slice(0, MAX_DESCENDANT_TABS).forEach((t, i) => {
      pushIfAny({ key: t.key, label: t.label, count: hitsTotal(descendantResults[i].data?.pages?.[0]), isLoading: descendantResults[i].isLoading });
    });
    fileTabs.forEach(t => pushIfAny(t));
    if (SHOW_DATA_ISSUES && issueCount > 0) {
      tabs.push({ key: 'issues', label: 'Data Issues', count: issueCount });
    }
  }
  const current = tabs.some(t => t.key === activeTab) ? activeTab : 'details';

  return (
    <Section className={compact ? 'flex flex-col min-h-0' : ''}>
      {/* Inside the modal the Section is a flex column, so the Container's mx-auto
          would shrink-wrap it; w-full keeps it spanning the modal. */}
      <Container className={`prose max-w-none ${compact ? '!px-0 my-0 w-full flex-1 min-h-0 flex flex-col' : 'my-4'}`} width="custom">
      {(isLoadingQuery || redirectTo) &&
        <div className="flex justify-center items-center min-h-[200px] p-4">
          <Icon name="TbLoader2" className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      }
      {!isLoadingQuery && !doc._osuid &&
        <div className="text-red-500 p-4">No data found for {osuID}.</div>
      }
      {doc._docType && !redirectTo && (
        <div className={`w-full ${compact ? 'flex flex-col lg:flex-row flex-1 min-h-0 lg:items-stretch' : 'lg:flex lg:gap-6 lg:items-start'}`}>
          <SectionTabs tabs={tabs} active={current} onSelect={setActiveTab} />
          <div className={`flex-1 min-w-0 w-full ${compact ? 'min-h-0 overflow-y-auto' : 'lg:pl-0'}`}>
            {current === 'details' && <DetailsPanel doc={doc} ancestors={ancestors} onNavigate={onNavigateToChild} onFilter={onFilter} />}
            {descendantTabs.slice(0, MAX_DESCENDANT_TABS).map((t, i) => t.key === current && (
              <DescendantsPanel key={t.key} tab={t} query={descendantResults[i]} onNavigate={onNavigateToChild} />
            ))}
            {fileTabs.filter(t => t.key === current).map(t => <FileTypePanel key={t.key} tab={t} />)}
            {current === 'parents-loading' && <LoadingRows label="Loading parents..." />}
            {(ancestors || []).filter((a: any) => parentTabKey(a) === current).map((a: any) => (
              <RecordTable key={a._osuid} rows={[a]} docType={a._docType} onNavigate={onNavigateToChild} />
            ))}
            {current === 'issues' && <div className="p-4"><DataIssuesPanel doc={doc} /></div>}
          </div>
        </div>
      )}
      {viewRawData && (
        <pre><code className="flex flex-col gap-2">
          {JSON.stringify(doc, null, 2)}
        </code></pre>
      )}
    </Container>
  </Section>
  )
	
};


export const landingPageBlockSchema = {
  name: "landingPage",
  label: "Collection Landing Page",
  fields: [
    {
      type: "string",
      label: "HTML Source",
      name: "source",
    },
    {
      type: "number",
      label: "Height in Pixels",
      name: "height",
    }
  ],
};