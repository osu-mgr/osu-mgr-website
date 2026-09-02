import numeral from 'numeral';
import React, { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { Icon } from "../util/icon";

// The search-result types offered as tabs, in tab order. Each becomes a
// worksheet in the exported workbook.
const ROW_TYPES: { type: string; label: string }[] = [
  { type: 'cruise', label: 'Cruises' },
  { type: 'core', label: 'Cores' },
  { type: 'section', label: 'Sections' },
  { type: 'sectionHalf', label: 'Section Halves' },
  { type: 'dive', label: 'Dredges/Dives' },
  { type: 'diveSample', label: 'Rocks' },
];

// OpenSearch refuses from+size beyond its result window, so cap the export.
const MAX_ROWS = 10000;
const PAGE_SIZE = 100;

const joinList = (v: any) => (Array.isArray(v) ? v.join('; ') : v);

// Excel worksheet names may not contain : \ / ? * [ ] and are capped at 31
// characters, so "Dredges/Dives" becomes "Dredges-Dives".
const sheetName = (label: string) => label.replace(/[:\\/?*[\]]/g, '-').slice(0, 31);

// Columns in metadata-sheet order, headed the way the curators' metadata
// sheets are (so an export can be edited and fed back through the pipeline).
// Columns with no values on a given worksheet are dropped, so each type's
// tab only shows the fields it actually carries.
const COLUMNS: { header: string; value: (doc: any) => any }[] = [
  { header: 'OSU ID', value: d => d._osuid },
  { header: 'Parent OSU ID', value: d => d._parentOSUID },
  { header: 'CORE NAME', value: d => d._docType === 'core' && d._osuid ? String(d._osuid).replace(/^OSU-/, '') : d.core },
  { header: 'SECTION NAME', value: d => (d._docType === 'section' || d._docType === 'sectionHalf') && d._osuid ? String(d._osuid).replace(/^OSU-/, '') : undefined },
  { header: 'SECTION or MC #', value: d => d.section },
  { header: 'Working/Archive', value: d => d._docType === 'sectionHalf' ? d.type : undefined },
  { header: 'Alternate Section Name', value: d => d.alternateName },
  { header: 'Deployment or Dive', value: d => d.dive },
  { header: 'Sample Name', value: d => d.sample ?? d.name },
  { header: 'Cruise Name or Program Name', value: d => d.cruise },
  { header: 'RV Name', value: d => d.rvName },
  { header: 'ROV Name', value: d => d.rovName },
  { header: 'Contact PI', value: d => d.pi },
  { header: 'Contact PI email', value: d => d.piEmail },
  { header: 'PI Institution', value: d => d.piInstitution },
  { header: 'Date Collected', value: d => d.startDate },
  { header: 'Time Collected', value: d => d.startTime },
  { header: 'End Date Collected', value: d => d.endDate },
  { header: 'End Time Collected', value: d => d.endTime },
  { header: 'Latitude', value: d => d.latitudeStart },
  { header: 'Longitude', value: d => d.longitudeStart },
  { header: 'Water Depth', value: d => d.waterDepthStart },
  { header: 'End Latitude', value: d => d.latitudeEnd },
  { header: 'End Longitude', value: d => d.longitudeEnd },
  { header: 'End Water Depth', value: d => d.waterDepthEnd },
  { header: 'Area', value: d => d.area },
  { header: 'Recovery Method', value: d => d.method ?? joinList(d.methods) },
  { header: 'Material', value: d => d.material ?? joinList(d.materials) },
  { header: 'Abbreviated Core Type', value: d => d._docType === 'core' ? d.type : undefined },
  { header: 'Parent Core Length', value: d => d._docType === 'core' ? d.length : undefined },
  { header: 'Core Diameter', value: d => d.diameter },
  { header: 'Number of Parent Core Sections', value: d => d.nSections },
  { header: 'DEPTH TOP (cm)', value: d => d.depthTop },
  { header: 'DEPTH BOTTOM (cm)', value: d => d.depthBottom },
  { header: 'SECTION LENGTH (cm)', value: d => d._docType !== 'core' ? d.length : undefined },
  { header: 'Principal Texture', value: d => d.texture },
  { header: 'Sample Weight (kg)', value: d => d.weight },
  { header: 'IGSN', value: d => d.igsn },
  { header: 'Storage Location', value: d => d.storageLocation },
  { header: 'Collection', value: d => d.collection },
  { header: 'Notes', value: d => d.notes },
  { header: 'Cores', value: d => d._coreOSUIDs?.length || undefined },
  { header: 'Dredges/Dives', value: d => d._diveOSUIDs?.length || undefined },
  { header: 'Moratorium', value: d => (d._moratorium ? 'Yes' : undefined) },
  { header: 'Errors', value: d => joinList(d._errors) || undefined },
  { header: 'Warnings', value: d => joinList(d._warnings) || undefined },
];

const isBlank = (v: any) => v === undefined || v === null || v === '';

const buildSheet = (docs: any[]) => {
  const columns = COLUMNS.filter(col => docs.some(doc => !isBlank(col.value(doc))));
  const rows = docs.map(doc => columns.map(col => {
    const v = col.value(doc);
    return isBlank(v) ? '' : v;
  }));
  const sheet = XLSX.utils.aoa_to_sheet([columns.map(c => c.header), ...rows]);
  sheet['!cols'] = columns.map((col, i) => {
    let widest = Math.max(col.header.length, 8);
    for (const r of rows) widest = Math.max(widest, String(r[i]).length);
    return { wch: Math.min(60, widest + 2) };
  });
  return sheet;
};

// Page through every match of one type. The search endpoint returns full
// _source, which is what the sheet columns read from.
const fetchAllRows = async (search: any, type: string, onPage: (n: number) => void) => {
  const docs: any[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    const res = await fetch('/api/opensearch?search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...search, types: [type], from, size: PAGE_SIZE }),
    });
    if (!res.ok) break;
    const data = await res.json();
    const hits = data.hits?.hits || [];
    if (hits.length === 0) break;
    docs.push(...hits.map((h: any) => h._source));
    onPage(hits.length);
    const total = data.hits?.total?.value ?? data.hits?.total ?? 0;
    if (from + hits.length >= total) break;
  }
  return docs;
};

export const DownloadRowsButton: React.FC<{
  search: any;
  searchString: string;
}> = ({ search }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // One count per result type, under the current search text and filters.
  const { data: typeCounts, isLoading: countsLoading } = useQuery({
    queryKey: ['rowTypeCounts', search.searchString, search.filters, search.filterLogic],
    queryFn: async () => {
      const counts: { [type: string]: number } = {};
      await Promise.all(ROW_TYPES.map(async ({ type }) => {
        const res = await fetch('/api/opensearch?count', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            types: [type],
            searchString: search.searchString,
            filters: search.filters,
            filterLogic: search.filterLogic,
          }),
        });
        counts[type] = res.ok ? (await res.json()).count || 0 : 0;
      }));
      return counts;
    },
    staleTime: 5 * 60 * 1000,
  });

  const availableTypes = ROW_TYPES.filter(({ type }) => (typeCounts?.[type] || 0) > 0);

  // Start with every non-empty type selected whenever the counts change.
  useEffect(() => {
    if (availableTypes.length > 0) {
      setSelectedTypes(new Set(availableTypes.map(t => t.type)));
    } else {
      setIsOpen(false);
    }
  }, [availableTypes.map(t => `${t.type}:${typeCounts?.[t.type]}`).join(',')]);

  const totalRows = availableTypes
    .filter(({ type }) => selectedTypes.has(type))
    .reduce((sum, { type }) => sum + (typeCounts?.[type] || 0), 0);
  const tooManyRows = totalRows > MAX_ROWS;

  const handleDownload = async () => {
    if (tooManyRows || totalRows === 0) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      const workbook = XLSX.utils.book_new();
      let fetched = 0;
      for (const { type, label } of ROW_TYPES) {
        if (!selectedTypes.has(type) || !(typeCounts?.[type] > 0)) continue;
        const docs = await fetchAllRows(search, type, n => {
          fetched += n;
          setDownloadProgress(Math.min(100, (fetched / totalRows) * 100));
        });
        XLSX.utils.book_append_sheet(workbook, buildSheet(docs), sheetName(label));
      }
      XLSX.writeFile(workbook, `osu-mgr-search-${new Date().toISOString().split('T')[0]}.xlsx`);
      setIsOpen(false);
    } catch (error) {
      console.error('Row export failed:', error);
      alert(`Failed to export rows: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const toggleType = (type: string) => {
    const next = new Set(selectedTypes);
    if (next.has(type)) next.delete(type); else next.add(type);
    setSelectedTypes(next);
  };

  const allSelected = availableTypes.length > 0 && availableTypes.every(({ type }) => selectedTypes.has(type));
  const toggleAll = () => {
    setSelectedTypes(allSelected ? new Set() : new Set(availableTypes.map(t => t.type)));
  };

  return (
    <div className="relative ml-2">
      <div>
        <button
          className="btn btn-primary"
          onClick={() => setIsOpen(!isOpen)}
          disabled={!countsLoading && availableTypes.length === 0}
        >
          Download Rows
          <Icon name={isOpen ? "LuChevronUp" : "LuChevronDown"} size="xxs" className="ml-1" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-base-100 rounded-box shadow-lg border z-30 font-normal normal-case">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="label-text font-semibold pl-0 bg-transparent">Select Result Types</span>
              <button className="btn btn-xs btn-outline" onClick={toggleAll}>
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="text-xs text-gray-500">
              One worksheet per type, with metadata-sheet column headings.
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {countsLoading ? (
              <div className="flex justify-center items-center py-4">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
              </div>
            ) : availableTypes.length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No matching rows
              </div>
            ) : (
              availableTypes.map(({ type, label }) => (
                <div key={type} className="form-control">
                  <label className="label cursor-pointer justify-start gap-2 py-1">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedTypes.has(type)}
                      onChange={() => toggleType(type)}
                    />
                    <span className="label-text text-sm bg-transparent flex-1">{label}</span>
                    <span className="badge badge-sm badge-outline">
                      {numeral(typeCounts?.[type] || 0).format('0,0')}
                    </span>
                  </label>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t">
            {tooManyRows ? (
              <div className="alert alert-primary mb-2 py-2 text-xs">
                Too many rows selected ({numeral(totalRows).format('0,0')}). Please narrow the search or select fewer types (limit {numeral(MAX_ROWS).format('0,0')}).
              </div>
            ) : (
              <button
                className="btn btn-primary btn-sm btn-block relative overflow-hidden"
                disabled={totalRows === 0 || isDownloading}
                onClick={handleDownload}
              >
                {isDownloading && (
                  <div
                    className="absolute inset-0 bg-primary-focus transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                )}
                <span className="relative z-10 bg-transparent">
                  {isDownloading ? (
                    <span className="text-black bg-transparent">
                      <Icon name="TbLoader2" size="small" className="animate-spin inline-block mr-1" />
                      Exporting... {Math.round(downloadProgress)}%
                    </span>
                  ) : (
                    <>Download {numeral(totalRows).format('0,0')} Row{totalRows !== 1 ? 's' : ''}</>
                  )}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
