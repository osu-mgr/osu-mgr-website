import numeral from 'numeral';
import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Icon } from "../util/icon";

// Area Filter Dropdown Component
export const AreaFilterDropdown: React.FC<{
  search: any;
  setSearch: (search: any) => void;
}> = ({ search, setSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedAreas = search.filters?.areas || [];

  // Fetch counts for each area
  const { data: areaCounts, isLoading: countsLoading } = useQuery({
    queryKey: ['areaCountsDropdown', search.types, search.searchString, search.filters?.fileTypes, search.filterLogic?.fileTypes, search.filters?.methods, search.filters?.materialTypes, search.filters?.areas],
    queryFn: async () => {
      const res = await fetch('/api/opensearch?areaCounts', {
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
    enabled: search.types.includes('dive')
  });

  const handleAreaChange = (area: string, checked: boolean) => {
    const currentAreas = search.filters?.areas || [];
    const newAreas = checked
      ? [...currentAreas, area]
      : currentAreas.filter((a: string) => a !== area);

    setSearch({
      ...search,
      filters: {
        ...search.filters,
        areas: newAreas
      }
    });
  };

  const toggleAllAreas = () => {
    const availableAreasWithResults = availableAreas.filter(area =>
      (areaCounts?.[area] || 0) > 0
    );
    const allAvailableSelected = availableAreasWithResults.every(area =>
      selectedAreas.includes(area)
    );

    if (allAvailableSelected) {
      setSearch({
        ...search,
        filters: {
          ...search.filters,
          areas: selectedAreas.filter((area: string) =>
            !availableAreasWithResults.includes(area)
          )
        }
      });
    } else {
      const newAreas = Array.from(new Set([...selectedAreas, ...availableAreasWithResults]));
      setSearch({
        ...search,
        filters: {
          ...search.filters,
          areas: newAreas
        }
      });
    }
  };

  const availableAreas = areaCounts
    ? Object.keys(areaCounts).filter(area =>
        (areaCounts[area] || 0) > 0 || selectedAreas.includes(area)
      ).sort((a, b) => {
        const aSelected = selectedAreas.includes(a);
        const bSelected = selectedAreas.includes(b);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.localeCompare(b);
      })
    : [];

  const activeFilterCount = selectedAreas.length;

  return (
    <span className="relative inline ml-1">
      <button
        className="flex items-center gap-1 hover:bg-base-200 px-2 py-1 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon name="LuFilter" size="xxs" />
        {activeFilterCount > 0 && (
          <span className="badge badge-primary badge-sm">{activeFilterCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-base-100 rounded-box shadow-lg border z-20 font-normal normal-case">
          {/* Header with action buttons */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">Areas</span>
              <div className="flex gap-1">
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={toggleAllAreas}
                  disabled={countsLoading}
                >
                  {(() => {
                    const availableAreasWithResults = availableAreas.filter(area =>
                      (areaCounts?.[area] || 0) > 0
                    );
                    const allAvailableSelected = availableAreasWithResults.every(area =>
                      selectedAreas.includes(area)
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
                        areas: []
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
          <div className="max-h-[200px] overflow-y-auto p-2">
            {countsLoading ? (
              <div className="flex justify-center items-center py-4">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-sm">Loading filters...</span>
              </div>
            ) : availableAreas.length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No areas available
              </div>
            ) : (
              availableAreas.map((area) => {
                const count = areaCounts?.[area] || 0;
                const isSelected = selectedAreas.includes(area);
                const hasResults = count > 0;

                return (
                  <div key={area} className="form-control">
                    <label className={`label cursor-pointer justify-start gap-2 py-1 ${!hasResults && isSelected ? 'opacity-60' : ''}`}>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm flex-shrink-0"
                        checked={isSelected}
                        onChange={(e) => handleAreaChange(area, e.target.checked)}
                      />
                      <span className="label-text text-sm flex-1 break-words whitespace-normal">{area}</span>
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
