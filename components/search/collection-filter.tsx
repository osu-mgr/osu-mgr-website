import numeral from 'numeral';
import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Icon } from "../util/icon";

// Collection Filter Dropdown Component (Material Types + Methods)
export const CollectionFilterDropdown: React.FC<{
  search: any;
  setSearch: (search: any) => void;
}> = ({ search, setSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedMethods = search.filters?.methods || [];
  const selectedMaterialTypes = search.filters?.materialTypes || [];

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

  // Fetch counts for each method
  const { data: methodCounts, isLoading: methodCountsLoading } = useQuery({
    queryKey: ['methodCounts', search.types, search.searchString, search.filters, search.filterLogic],
    queryFn: async () => {
      const res = await fetch('/api/opensearch?methodCounts', {
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
    enabled: search.types.includes('core') || search.types.includes('dive') || search.types.includes('cruise')
  });

  // Fetch counts for each material type
  const { data: materialCounts, isLoading: materialCountsLoading } = useQuery({
    queryKey: ['materialCounts', search.types, search.searchString, search.filters, search.filterLogic],
    queryFn: async () => {
      const res = await fetch('/api/opensearch?materialCounts', {
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
    enabled: search.types.includes('core') || search.types.includes('dive')
  });

  const handleMethodChange = (method: string, checked: boolean) => {
    const currentMethods = search.filters?.methods || [];
    const newMethods = checked
      ? [...currentMethods, method]
      : currentMethods.filter((m: string) => m !== method);

    setSearch({
      ...search,
      filters: {
        ...search.filters,
        methods: newMethods
      }
    });
  };

  const handleMaterialChange = (material: string, checked: boolean) => {
    const currentMaterials = search.filters?.materialTypes || [];
    const newMaterials = checked
      ? [...currentMaterials, material]
      : currentMaterials.filter((m: string) => m !== material);

    setSearch({
      ...search,
      filters: {
        ...search.filters,
        materialTypes: newMaterials
      }
    });
  };

  const availableMethods = methodCounts
    ? Object.keys(methodCounts)
        .filter(method =>
          (methodCounts[method] || 0) > 0 || selectedMethods.includes(method)
        )
        .sort((a, b) => {
          const aSelected = selectedMethods.includes(a);
          const bSelected = selectedMethods.includes(b);
          if (aSelected && !bSelected) return -1;
          if (!aSelected && bSelected) return 1;
          return a.localeCompare(b);
        })
    : [];

  const availableMaterials = materialCounts
    ? Object.keys(materialCounts)
        .filter(material =>
          (materialCounts[material] || 0) > 0 || selectedMaterialTypes.includes(material)
        )
        .sort((a, b) => {
          const aSelected = selectedMaterialTypes.includes(a);
          const bSelected = selectedMaterialTypes.includes(b);
          if (aSelected && !bSelected) return -1;
          if (!aSelected && bSelected) return 1;
          return a.localeCompare(b);
        })
    : [];

  const totalSelected = selectedMethods.length + selectedMaterialTypes.length;
  const isLoading = methodCountsLoading || materialCountsLoading;

  return (
    <span className="relative inline ml-1">
      <button
        className="flex items-center gap-1 hover:bg-base-200 px-2 py-1 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon name="LuFilter" size="xxs" />
        {totalSelected > 0 && (
          <span className="badge badge-primary badge-sm">{totalSelected}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-base-100 rounded-box shadow-lg border z-20 font-normal normal-case">
          {/* Methods Section */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">Collection Methods</span>
              <button
                className="btn btn-xs btn-outline"
                onClick={() => {
                  setSearch({
                    ...search,
                    filters: {
                      ...search.filters,
                      methods: []
                    }
                  });
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Scrollable methods list */}
          <div className="max-h-40 overflow-y-auto p-2 border-b">
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-sm">Loading...</span>
              </div>
            ) : availableMethods.length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No methods available
              </div>
            ) : (
              availableMethods.map((method) => {
                const count = methodCounts?.[method] || 0;
                const isSelected = selectedMethods.includes(method);
                const hasResults = count > 0;

                return (
                  <div key={`method-${method}`} className="form-control">
                    <label className={`label cursor-pointer justify-start gap-2 py-1 ${!hasResults && isSelected ? 'opacity-60' : ''}`}>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm flex-shrink-0"
                        checked={isSelected}
                        onChange={(e) => handleMethodChange(method, e.target.checked)}
                      />
                      <span className="label-text text-sm flex-1 break-words whitespace-normal">{method}</span>
                      <span className={`badge badge-sm flex-shrink-0 ${hasResults ? 'badge-outline' : 'badge-ghost'}`}>
                        {numeral(count).format('0,0')}
                      </span>
                    </label>
                  </div>
                );
              })
            )}
          </div>

          {/* Material Types Section */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">Material Types</span>
              <button
                className="btn btn-xs btn-outline"
                onClick={() => {
                  setSearch({
                    ...search,
                    filters: {
                      ...search.filters,
                      materialTypes: []
                    }
                  });
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Scrollable materials list */}
          <div className="max-h-40 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-sm">Loading...</span>
              </div>
            ) : availableMaterials.length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No materials available
              </div>
            ) : (
              availableMaterials.map((material) => {
                const count = materialCounts?.[material] || 0;
                const isSelected = selectedMaterialTypes.includes(material);
                const hasResults = count > 0;

                return (
                  <div key={`material-${material}`} className="form-control">
                    <label className={`label cursor-pointer justify-start gap-2 py-1 ${!hasResults && isSelected ? 'opacity-60' : ''}`}>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm flex-shrink-0"
                        checked={isSelected}
                        onChange={(e) => handleMaterialChange(material, e.target.checked)}
                      />
                      <span className="label-text text-sm flex-1 break-words whitespace-normal">{material}</span>
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
