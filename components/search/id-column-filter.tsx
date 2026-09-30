import numeral from 'numeral';
import React, { useState } from "react";
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Icon } from "../util/icon";
import { collectionLabels, getCollectionLabel, SHOW_PUBLICATIONS } from "./search-data";

// Link types a record can have to outside data. Keys match LINK_QUERIES in
// pages/api/opensearch.ts; add new ones (e.g. IGSN) in both places.
export const LINK_OPTIONS: { key: string; label: string }[] = [
  { key: 'r2r', label: 'R2R' },
  ...(SHOW_PUBLICATIONS ? [{ key: 'publication', label: 'Publication' }] : []),
];

export const getLinkLabel = (key: string): string =>
  LINK_OPTIONS.find(o => o.key === key)?.label || key;

// Counts per link type for the current search, with every other filter applied.
export const useLinkCounts = (search: any) => useQuery({
  queryKey: ['linkCounts', search.types, search.searchString, search.filters, search.filterLogic, search.hasCoordinates],
  queryFn: async (): Promise<{ [key: string]: number }> => {
    const res = await fetch('/api/opensearch?linkCounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        types: search.types,
        searchString: search.searchString || '',
        filters: search.filters,
        filterLogic: search.filterLogic,
        hasCoordinates: search.hasCoordinates
      }),
    });
    return res.ok ? res.json() : {};
  },
  staleTime: 5 * 60 * 1000,
  placeholderData: keepPreviousData,
  gcTime: 30 * 60 * 1000,
});

export const setLinkSelected = (search: any, setSearch: (search: any) => void, key: string, checked: boolean) => {
  const selected: string[] = search.filters?.links || [];
  setSearch({
    ...search,
    filters: {
      ...search.filters,
      links: checked ? Array.from(new Set([...selected, key])) : selected.filter(l => l !== key)
    }
  });
};

// Checkbox list shared by the column dropdown and the left filter panel.
export const LinksFilterOptions: React.FC<{
  search: any;
  setSearch: (search: any) => void;
}> = ({ search, setSearch }) => {
  const selected: string[] = search.filters?.links || [];
  const { data: counts, isLoading } = useLinkCounts(search);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
        <span className="ml-2 text-sm">Loading links...</span>
      </div>
    );
  }
  return (
    <>
      {LINK_OPTIONS.map(({ key, label }) => {
        const count = counts?.[key] || 0;
        const isSelected = selected.includes(key);
        const hasResults = count > 0;
        return (
          <div key={key} className="form-control">
            <label className={`label cursor-pointer justify-start gap-2 py-1 ${!hasResults && !isSelected ? 'opacity-60' : ''}`}>
              <input
                type="checkbox"
                className="checkbox checkbox-sm flex-shrink-0"
                checked={isSelected}
                onChange={(e) => setLinkSelected(search, setSearch, key, e.target.checked)}
              />
              <span className="label-text text-sm flex-1 break-words whitespace-normal">{label}</span>
              <span className={`badge badge-sm flex-shrink-0 ${hasResults ? 'badge-outline' : 'badge-ghost'}`}>
                {numeral(count).format('0,0')}
              </span>
            </label>
          </div>
        );
      })}
    </>
  );
};

export const LinksLogicToggle: React.FC<{
  search: any;
  setSearch: (search: any) => void;
}> = ({ search, setSearch }) => {
  const logic = search.filterLogic?.links || 'OR';
  const setLogic = (next: string) => setSearch({
    ...search,
    filterLogic: { ...search.filterLogic, links: next }
  });
  return (
    <div className="flex items-center gap-2">
      <div className="join leading-none">
        <button className={`btn btn-xs join-item ${logic === 'OR' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setLogic('OR')}>
          OR
        </button>
        <button className={`btn btn-xs ml-2 join-item ${logic === 'AND' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setLogic('AND')}>
          AND
        </button>
      </div>
      <span className="text-xs text-gray-500">
        {logic === 'OR' ? 'Match ANY selected link' : 'Match ALL selected links'}
      </span>
    </div>
  );
};

// Counts per collection code for the current search, with every other filter applied.
export const useCollectionCounts = (search: any) => useQuery({
  queryKey: ['collectionCounts', search.types, search.searchString, search.filters, search.filterLogic, search.hasCoordinates],
  queryFn: async (): Promise<{ [code: string]: number }> => {
    const res = await fetch('/api/opensearch?collectionCounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        types: search.types,
        searchString: search.searchString || '',
        filters: search.filters,
        filterLogic: search.filterLogic,
        hasCoordinates: search.hasCoordinates
      }),
    });
    return res.ok ? res.json() : {};
  },
  staleTime: 5 * 60 * 1000,
  placeholderData: keepPreviousData,
  gcTime: 30 * 60 * 1000,
});

export const CollectionsFilterOptions: React.FC<{
  search: any;
  setSearch: (search: any) => void;
}> = ({ search, setSearch }) => {
  const selected: string[] = search.filters?.collections || [];
  const { data: counts, isLoading } = useCollectionCounts(search);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
        <span className="ml-2 text-sm">Loading collections...</span>
      </div>
    );
  }
  // Known collections in policy-page order, then any other codes the index has.
  const codes = Array.from(new Set([...Object.keys(collectionLabels), ...Object.keys(counts || {}), ...selected]));
  return (
    <>
      {codes.map(code => {
        const count = counts?.[code] || 0;
        const isSelected = selected.includes(code);
        const hasResults = count > 0;
        return (
          <div key={code} className="form-control">
            <label className={`label cursor-pointer justify-start gap-2 py-1 ${!hasResults && !isSelected ? 'opacity-60' : ''}`}>
              <input
                type="checkbox"
                className="checkbox checkbox-sm flex-shrink-0"
                checked={isSelected}
                onChange={(e) => setSearch({
                  ...search,
                  filters: {
                    ...search.filters,
                    collections: e.target.checked
                      ? Array.from(new Set([...selected, code]))
                      : selected.filter(c => c !== code)
                  }
                })}
              />
              <span className="label-text text-sm flex-1 break-words whitespace-normal">{getCollectionLabel(code)}</span>
              <span className={`badge badge-sm flex-shrink-0 ${hasResults ? 'badge-outline' : 'badge-ghost'}`}>
                {numeral(count).format('0,0')}
              </span>
            </label>
          </div>
        );
      })}
    </>
  );
};

export const clearCollections = (search: any, setSearch: (search: any) => void) =>
  setSearch({ ...search, filters: { ...search.filters, collections: [] } });

export const clearLinks = (search: any, setSearch: (search: any) => void) =>
  setSearch({ ...search, filters: { ...search.filters, links: [] } });

// ID column filter dropdown (first column header): Collection and Links.
export const IdColumnFilterDropdown: React.FC<{
  search: any;
  setSearch: (search: any) => void;
}> = ({ search, setSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCount = (search.filters?.links || []).length + (search.filters?.collections || []).length;

  return (
    <span className="relative inline ml-1">
      <button
        className="flex items-center gap-1 hover:bg-base-200 px-2 py-1 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon name="LuFilter" size="xxs" />
        {selectedCount > 0 && (
          <span className="badge badge-primary badge-sm">{selectedCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-80 bg-base-100 rounded-box shadow-lg border z-20 font-normal normal-case">
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">Collection</span>
                <button className="btn btn-xs btn-outline" onClick={() => clearCollections(search, setSearch)}>
                  Clear
                </button>
              </div>
            </div>
            <div className="p-2 border-b">
              <CollectionsFilterOptions search={search} setSearch={setSearch} />
            </div>

            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">Links</span>
                <button className="btn btn-xs btn-outline" onClick={() => clearLinks(search, setSearch)}>
                  Clear
                </button>
              </div>
              <div className="mt-2">
                <LinksLogicToggle search={search} setSearch={setSearch} />
              </div>
            </div>
            <div className="p-2">
              <LinksFilterOptions search={search} setSearch={setSearch} />
            </div>
          </div>

          <div className="p-2 border-t">
            <button className="btn btn-sm btn-block" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </span>
  );
};
