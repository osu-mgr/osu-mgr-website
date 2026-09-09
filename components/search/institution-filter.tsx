import numeral from 'numeral';
import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Icon } from "../util/icon";

// Institution Filter Dropdown Component
export const InstitutionFilterDropdown: React.FC<{
  search: any;
  setSearch: (search: any) => void;
}> = ({ search, setSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedInstitutions = search.filters?.institutions || [];

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

  // Fetch counts for each institution
  const { data: institutionData, isLoading: countsLoading } = useQuery({
    queryKey: ['institutionCounts', search.types, search.searchString, search.filters, search.filterLogic],
    queryFn: async () => {
      const res = await fetch('/api/opensearch?institutionCounts', {
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
      return { counts: {}, piInstitutions: {} };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: search.types.includes('cruise')
  });

  const institutionCounts = institutionData?.counts || {};
  const piInstitutions = institutionData?.piInstitutions || {};

  const handleInstitutionChange = (institution: string, checked: boolean) => {
    const currentInstitutions = search.filters?.institutions || [];
    const newInstitutions = checked
      ? [...currentInstitutions, institution]
      : currentInstitutions.filter((name: string) => name !== institution);

    setSearch({
      ...search,
      filters: {
        ...search.filters,
        institutions: newInstitutions
      }
    });
  };

  const toggleAllInstitutions = () => {
    const availableInstitutionsWithResults = availableInstitutions.filter(institution =>
      (institutionCounts?.[institution] || 0) > 0
    );
    const allAvailableSelected = availableInstitutionsWithResults.every(institution =>
      selectedInstitutions.includes(institution)
    );

    if (allAvailableSelected) {
      setSearch({
        ...search,
        filters: {
          ...search.filters,
          institutions: selectedInstitutions.filter((institution: string) =>
            !availableInstitutionsWithResults.includes(institution)
          )
        }
      });
    } else {
      const newInstitutions = Array.from(new Set([...selectedInstitutions, ...availableInstitutionsWithResults]));
      setSearch({
        ...search,
        filters: {
          ...search.filters,
          institutions: newInstitutions
        }
      });
    }
  };

  const availableInstitutions = institutionCounts
    ? Object.keys(institutionCounts)
        .filter(institution =>
          (institutionCounts[institution] || 0) > 0 || selectedInstitutions.includes(institution)
        )
        .sort((a, b) => {
          const aSelected = selectedInstitutions.includes(a);
          const bSelected = selectedInstitutions.includes(b);
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
        {selectedInstitutions.length > 0 && (
          <span className="badge badge-primary badge-sm">{selectedInstitutions.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-base-100 rounded-box shadow-lg border z-20 font-normal normal-case">
          {/* Header with AND/OR toggle */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">Cruise PI</span>
              <div className="flex gap-1">
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={toggleAllInstitutions}
                  disabled={countsLoading}
                >
                  {(() => {
                    const availableInstitutionsWithResults = availableInstitutions.filter(institution =>
                      (institutionCounts?.[institution] || 0) > 0
                    );
                    const allAvailableSelected = availableInstitutionsWithResults.every(institution =>
                      selectedInstitutions.includes(institution)
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
                        institutions: []
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
          <div className="max-h-64 overflow-y-auto overflow-x-hidden p-2">
            {countsLoading ? (
              <div className="flex justify-center items-center py-4">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-sm">Loading filters...</span>
              </div>
            ) : availableInstitutions.length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No Cruise PIs available
              </div>
            ) : (
              availableInstitutions.map((institution) => {
                const count = institutionCounts?.[institution] || 0;
                const isSelected = selectedInstitutions.includes(institution);
                const hasResults = count > 0;
                const piInstitution = piInstitutions?.[institution];

                return (
                  <div key={institution} className="form-control">
                    <label className={`label cursor-pointer justify-start gap-2 py-1 ${!hasResults && isSelected ? 'opacity-60' : ''}`}>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm flex-shrink-0"
                        checked={isSelected}
                        onChange={(e) => handleInstitutionChange(institution, e.target.checked)}
                      />
                      <span className="label-text text-sm flex-1 break-words whitespace-normal">
                        <div>{institution}</div>
                        {piInstitution && <div className="text-xs text-gray-500">{piInstitution}</div>}
                      </span>
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
