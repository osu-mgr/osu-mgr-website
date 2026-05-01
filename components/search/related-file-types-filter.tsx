import numeral from 'numeral';
import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Icon } from "../util/icon";
import { fileTypes, getFileTypeLabel } from './search-data';

export const RelatedFileTypesFilterDropdown: React.FC<{
  search: any;
  setSearch: (search: any) => void;
}> = ({ search, setSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedRelatedFileTypes = search.filters?.relatedFileTypes || [];

  const toggleFilterLogic = () => {
    const current = search.filterLogic?.relatedFileTypes || 'OR';
    setSearch({
      ...search,
      filterLogic: { ...search.filterLogic, relatedFileTypes: current === 'OR' ? 'AND' : 'OR' }
    });
  };

  const { data: relatedFileTypeCounts, isLoading: countsLoading } = useQuery({
    queryKey: ['relatedFileTypeCounts', search.types, search.searchString, search.filters?.relatedFileTypes, search.filterLogic?.relatedFileTypes, search.filters?.fileTypes, search.filters?.methods, search.filters?.materialTypes, search.filters?.rvNames, search.filters?.institutions, search.filters?.areas, search.filters?.textures],
    queryFn: async () => {
      const res = await fetch('/api/opensearch?relatedFileTypeCounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          types: search.types,
          searchString: search.searchString || '',
          filters: search.filters,
          filterLogic: search.filterLogic,
        }),
      });
      return res.ok ? res.json() : {};
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const handleChange = (fileType: string, checked: boolean) => {
    const current = search.filters?.relatedFileTypes || [];
    setSearch({
      ...search,
      filters: {
        ...search.filters,
        relatedFileTypes: checked ? [...current, fileType] : current.filter((t: string) => t !== fileType),
      }
    });
  };

  const availableFileTypes = relatedFileTypeCounts
    ? fileTypes.filter(ft => (relatedFileTypeCounts[ft] || 0) > 0 || selectedRelatedFileTypes.includes(ft))
        .sort((a, b) => {
          const aS = selectedRelatedFileTypes.includes(a);
          const bS = selectedRelatedFileTypes.includes(b);
          if (aS && !bS) return -1;
          if (!aS && bS) return 1;
          return 0;
        })
    : fileTypes;

  const toggleAll = () => {
    const withResults = availableFileTypes.filter(ft => (relatedFileTypeCounts?.[ft] || 0) > 0);
    const allSelected = withResults.every(ft => selectedRelatedFileTypes.includes(ft));
    if (allSelected) {
      setSearch({ ...search, filters: { ...search.filters, relatedFileTypes: selectedRelatedFileTypes.filter((ft: string) => !withResults.includes(ft)) } });
    } else {
      setSearch({ ...search, filters: { ...search.filters, relatedFileTypes: Array.from(new Set([...selectedRelatedFileTypes, ...withResults])) } });
    }
  };

  return (
    <span className="relative inline ml-1">
      <button
        className="flex items-center gap-1 hover:bg-base-200 px-2 py-1 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon name="LuFilter" size="xxs" />
        {selectedRelatedFileTypes.length > 0 && (
          <span className="badge badge-primary badge-sm">{selectedRelatedFileTypes.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-base-100 rounded-box shadow-lg border z-20 font-normal normal-case">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">Related File Types</span>
              <div className="flex gap-1">
                <button className="btn btn-xs btn-ghost" onClick={toggleAll} disabled={countsLoading}>
                  {availableFileTypes.filter(ft => (relatedFileTypeCounts?.[ft] || 0) > 0).every(ft => selectedRelatedFileTypes.includes(ft))
                    ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() => setSearch({ ...search, filters: { ...search.filters, relatedFileTypes: [] } })}
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="join leading-none">
                <button
                  className={`btn btn-xs join-item ${(search.filterLogic?.relatedFileTypes || 'OR') === 'OR' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={toggleFilterLogic}
                >OR</button>
                <button
                  className={`btn btn-xs ml-2 join-item ${(search.filterLogic?.relatedFileTypes || 'OR') === 'AND' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={toggleFilterLogic}
                >AND</button>
              </div>
              <span className="text-xs text-gray-500">
                {(search.filterLogic?.relatedFileTypes || 'OR') === 'OR' ? 'Match ANY selected type' : 'Match ALL selected types'}
              </span>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {countsLoading ? (
              <div className="flex justify-center items-center py-4">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-sm">Loading filters...</span>
              </div>
            ) : availableFileTypes.length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No related file types available
              </div>
            ) : (
              availableFileTypes.map((fileType) => {
                const count = relatedFileTypeCounts?.[fileType] || 0;
                const isSelected = selectedRelatedFileTypes.includes(fileType);
                return (
                  <div key={fileType} className="form-control">
                    <label className={`label cursor-pointer justify-start gap-2 py-1 ${!count && isSelected ? 'opacity-60' : ''}`}>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm flex-shrink-0"
                        checked={isSelected}
                        onChange={(e) => handleChange(fileType, e.target.checked)}
                      />
                      <span className="label-text text-sm flex-1 break-words whitespace-normal">{getFileTypeLabel(fileType)}</span>
                      <span className={`badge badge-sm flex-shrink-0 ${count ? 'badge-outline' : 'badge-ghost'}`}>
                        {numeral(count).format('0,0')}
                      </span>
                    </label>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-2 border-t">
            <button className="btn btn-sm btn-block" onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </span>
  );
};
