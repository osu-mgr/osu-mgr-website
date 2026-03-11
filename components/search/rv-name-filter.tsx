import numeral from 'numeral';
import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Icon } from "../util/icon";

// RV Name Filter Dropdown Component
export const RvNameFilterDropdown: React.FC<{
  search: any;
  setSearch: (search: any) => void;
}> = ({ search, setSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedRvNames = search.filters?.rvNames || [];

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

  // Fetch counts for each RV name
  const { data: rvNameCounts, isLoading: countsLoading } = useQuery({
    queryKey: ['rvNameCounts', search.types, search.searchString, search.filters?.fileTypes, search.filterLogic?.fileTypes, search.filters?.methods, search.filters?.materialTypes, search.filters?.rvNames],
    queryFn: async () => {
      const res = await fetch('/api/opensearch?rvNameCounts', {
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
    enabled: search.types.includes('cruise')
  });

  const handleRvNameChange = (rvName: string, checked: boolean) => {
    const currentNames = search.filters?.rvNames || [];
    const newNames = checked
      ? [...currentNames, rvName]
      : currentNames.filter((name: string) => name !== rvName);

    setSearch({
      ...search,
      filters: {
        ...search.filters,
        rvNames: newNames
      }
    });
  };

  const toggleAllRvNames = () => {
    const availableRvNamesWithResults = availableRvNames.filter(rvName =>
      (rvNameCounts?.[rvName] || 0) > 0
    );
    const allAvailableSelected = availableRvNamesWithResults.every(rvName =>
      selectedRvNames.includes(rvName)
    );

    if (allAvailableSelected) {
      setSearch({
        ...search,
        filters: {
          ...search.filters,
          rvNames: selectedRvNames.filter(rvName =>
            !availableRvNamesWithResults.includes(rvName)
          )
        }
      });
    } else {
      const newRvNames = Array.from(new Set([...selectedRvNames, ...availableRvNamesWithResults]));
      setSearch({
        ...search,
        filters: {
          ...search.filters,
          rvNames: newRvNames
        }
      });
    }
  };

  const availableRvNames = rvNameCounts
    ? Object.keys(rvNameCounts)
        .filter(rvName =>
          (rvNameCounts[rvName] || 0) > 0 || selectedRvNames.includes(rvName)
        )
        .sort((a, b) => {
          const aSelected = selectedRvNames.includes(a);
          const bSelected = selectedRvNames.includes(b);
          if (aSelected && !bSelected) return -1;
          if (!aSelected && bSelected) return 1;
          return a.localeCompare(b);
        })
    : [];


  return (
    <span className="relative inline ml-1">
      <button
        className="flex items-center gap-1 hover:bg-base-200 px-2 py-1 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon name="LuFilter" size="xxs" />
        {selectedRvNames.length > 0 && (
          <span className="badge badge-primary badge-sm">{selectedRvNames.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-base-100 rounded-box shadow-lg border z-20 font-normal normal-case">
          {/* Header with AND/OR toggle */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">RV Names</span>
              <div className="flex gap-1">
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={toggleAllRvNames}
                  disabled={countsLoading}
                >
                  {(() => {
                    const availableRvNamesWithResults = availableRvNames.filter(rvName =>
                      (rvNameCounts?.[rvName] || 0) > 0
                    );
                    const allAvailableSelected = availableRvNamesWithResults.every(rvName =>
                      selectedRvNames.includes(rvName)
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
                        rvNames: []
                      }
                    });
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable filter list */}
          <div className="max-h-64 overflow-y-auto p-2">
            {countsLoading ? (
              <div className="flex justify-center items-center py-4">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-sm">Loading filters...</span>
              </div>
            ) : availableRvNames.length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No RV names available
              </div>
            ) : (
              availableRvNames.map((rvName) => {
                const count = rvNameCounts?.[rvName] || 0;
                const isSelected = selectedRvNames.includes(rvName);
                const hasResults = count > 0;

                return (
                  <div key={rvName} className="form-control">
                    <label className={`label cursor-pointer justify-start gap-2 py-1 ${!hasResults && isSelected ? 'opacity-60' : ''}`}>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm flex-shrink-0"
                        checked={isSelected}
                        onChange={(e) => handleRvNameChange(rvName, e.target.checked)}
                      />
                      <span className="label-text text-sm flex-1 break-words whitespace-normal">{rvName}</span>
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
