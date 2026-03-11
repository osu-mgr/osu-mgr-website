import numeral from 'numeral';
import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Icon } from "../util/icon";
import { fileTypes, getFileTypeLabel } from './search-data';

// File Types Filter Dropdown Component
export const FileTypesFilterDropdown: React.FC<{
  search: any;
  setSearch: (search: any) => void;
}> = ({ search, setSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedFileTypes = search.filters?.fileTypes || [];

  const toggleFilterLogic = (filterType: string) => {
    const currentLogic = search.filterLogic?.[filterType] || 'OR';
    const newLogic = currentLogic === 'OR' ? 'AND' : 'OR';

    setSearch({
      ...search,
      filterLogic: {
        ...search.filterLogic,
        [filterType]: newLogic
      }
    });
  };

  // Fetch counts for each file type
  const { data: fileTypeCounts, isLoading: countsLoading } = useQuery({
    queryKey: ['fileTypeCounts', search.types, search.searchString, search.filters?.fileTypes, search.filterLogic?.fileTypes, search.filters?.methods, search.filters?.materialTypes, search.filters?.rvNames],
    queryFn: async () => {
      const res = await fetch('/api/opensearch?fileTypeCounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          types: search.types,
          searchString: search.searchString || '',
          filters: search.filters,
          filterLogic: search.filterLogic
        }),
      });

      if (res.ok) {
        return await res.json();
      }
      return {};
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const handleFileTypeChange = (fileType: string, checked: boolean) => {
    const currentTypes = search.filters?.fileTypes || [];
    const newTypes = checked
      ? [...currentTypes, fileType]
      : currentTypes.filter((type: string) => type !== fileType);

    setSearch({
      ...search,
      filters: {
        ...search.filters,
        fileTypes: newTypes
      }
    });
  };

  const toggleAllFileTypes = () => {
    const availableFileTypesWithResults = availableFileTypes.filter(fileType =>
      (fileTypeCounts?.[fileType] || 0) > 0
    );
    const allAvailableSelected = availableFileTypesWithResults.every(fileType =>
      selectedFileTypes.includes(fileType)
    );

    if (allAvailableSelected) {
      setSearch({
        ...search,
        filters: {
          ...search.filters,
          fileTypes: selectedFileTypes.filter(fileType =>
            !availableFileTypesWithResults.includes(fileType)
          )
        }
      });
    } else {
      const newFileTypes = Array.from(new Set([...selectedFileTypes, ...availableFileTypesWithResults]));
      setSearch({
        ...search,
        filters: {
          ...search.filters,
          fileTypes: newFileTypes
        }
      });
    }
  };

  const availableFileTypes = fileTypeCounts
    ? fileTypes.filter(fileType =>
        (fileTypeCounts[fileType] || 0) > 0 || selectedFileTypes.includes(fileType)
      ).sort((a, b) => {
        const aSelected = selectedFileTypes.includes(a);
        const bSelected = selectedFileTypes.includes(b);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
      })
    : fileTypes;


  return (
    <span className="relative inline ml-1">
      <button
        className="flex items-center gap-1 hover:bg-base-200 px-2 py-1 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon name="LuFilter" size="xxs" />
        {selectedFileTypes.length > 0 && (
          <span className="badge badge-primary badge-sm">{selectedFileTypes.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-base-100 rounded-box shadow-lg border z-20 font-normal normal-case">
          {/* Header with AND/OR toggle */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">File Types</span>
              <div className="flex gap-1">
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={toggleAllFileTypes}
                  disabled={countsLoading}
                >
                  {(() => {
                    const availableFileTypesWithResults = availableFileTypes.filter(fileType =>
                      (fileTypeCounts?.[fileType] || 0) > 0
                    );
                    const allAvailableSelected = availableFileTypesWithResults.every(fileType =>
                      selectedFileTypes.includes(fileType)
                    );
                    return allAvailableSelected ? 'Deselect All' : 'Select All';
                  })()}
                </button>
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() => {
                    setSearch({
                      ...search,
                      filters: {
                        ...search.filters,
                        fileTypes: []
                      }
                    });
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="join leading-none">
                <button
                  className={`btn btn-xs join-item ${(search.filterLogic?.fileTypes || 'OR') === 'OR' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => toggleFilterLogic('fileTypes')}
                >
                  OR
                </button>
                <button
                  className={`btn btn-xs ml-2 join-item ${(search.filterLogic?.fileTypes || 'OR') === 'AND' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => toggleFilterLogic('fileTypes')}
                >
                  AND
                </button>
              </div>
              <span className="text-xs text-gray-500">
                {(search.filterLogic?.fileTypes || 'OR') === 'OR' ? 'Match ANY selected file type' : 'Match ALL selected file types'}
              </span>
            </div>
          </div>

          {/* Scrollable filter list */}
          <div className="max-h-64 overflow-y-auto p-2">
            {countsLoading ? (
              <div className="flex justify-center items-center py-4">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-sm">Loading filters...</span>
              </div>
            ) : availableFileTypes.length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No file types available
              </div>
            ) : (
              availableFileTypes.map((fileType) => {
                const count = fileTypeCounts?.[fileType] || 0;
                const isSelected = selectedFileTypes.includes(fileType);
                const hasResults = count > 0;

                return (
                  <div key={fileType} className="form-control">
                    <label className={`label cursor-pointer justify-start gap-2 py-1 ${!hasResults && isSelected ? 'opacity-60' : ''}`}>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm flex-shrink-0"
                        checked={isSelected}
                        onChange={(e) => handleFileTypeChange(fileType, e.target.checked)}
                      />
                      <span className="label-text text-sm flex-1 break-words whitespace-normal">{getFileTypeLabel(fileType)}</span>
                      <span className={`badge badge-sm flex-shrink-0 ${hasResults ? 'badge-outline' : 'badge-ghost'}`}>
                        {numeral(count).format('0,0')}
                      </span>
                    </label>
                  </div>
                );
              })
            )}
          </div>

          {/* Close button */}
          <div className="p-2 border-t">
            <button
              className="btn btn-sm btn-block"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </span>
  );
};
