import numeral from 'numeral';
import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Icon } from "../util/icon";

// Texture Filter Dropdown Component
export const TextureFilterDropdown: React.FC<{
  search: any;
  setSearch: (search: any) => void;
}> = ({ search, setSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedTextures = search.filters?.textures || [];

  // Fetch counts for each texture
  const { data: textureCounts, isLoading: countsLoading } = useQuery({
    queryKey: ['textureCountsDropdown', search.types, search.searchString, search.filters, search.filterLogic],
    queryFn: async () => {
      const res = await fetch('/api/opensearch?textureCounts', {
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
    enabled: search.types.some((type: string) => ['dive', 'diveSample'].includes(type))
  });

  const handleTextureChange = (texture: string, checked: boolean) => {
    const currentTextures = search.filters?.textures || [];
    const newTextures = checked
      ? [...currentTextures, texture]
      : currentTextures.filter((t: string) => t !== texture);

    setSearch({
      ...search,
      filters: {
        ...search.filters,
        textures: newTextures
      }
    });
  };

  const toggleAllTextures = () => {
    const availableTexturesWithResults = availableTextures.filter(texture =>
      (textureCounts?.[texture] || 0) > 0
    );
    const allAvailableSelected = availableTexturesWithResults.every(texture =>
      selectedTextures.includes(texture)
    );

    if (allAvailableSelected) {
      setSearch({
        ...search,
        filters: {
          ...search.filters,
          textures: selectedTextures.filter((texture: string) =>
            !availableTexturesWithResults.includes(texture)
          )
        }
      });
    } else {
      const newTextures = Array.from(new Set([...selectedTextures, ...availableTexturesWithResults]));
      setSearch({
        ...search,
        filters: {
          ...search.filters,
          textures: newTextures
        }
      });
    }
  };

  const availableTextures = textureCounts
    ? Object.keys(textureCounts).filter(texture =>
        (textureCounts[texture] || 0) > 0 || selectedTextures.includes(texture)
      ).sort((a, b) => {
        const aSelected = selectedTextures.includes(a);
        const bSelected = selectedTextures.includes(b);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.localeCompare(b);
      })
    : [];

  const activeFilterCount = selectedTextures.length;

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
              <span className="font-semibold text-sm">Textures</span>
              <div className="flex gap-1">
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={toggleAllTextures}
                  disabled={countsLoading}
                >
                  {(() => {
                    const availableTexturesWithResults = availableTextures.filter(texture =>
                      (textureCounts?.[texture] || 0) > 0
                    );
                    const allAvailableSelected = availableTexturesWithResults.every(texture =>
                      selectedTextures.includes(texture)
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
                        textures: []
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
            ) : availableTextures.length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No textures available
              </div>
            ) : (
              availableTextures.map((texture) => {
                const count = textureCounts?.[texture] || 0;
                const isSelected = selectedTextures.includes(texture);
                const hasResults = count > 0;

                return (
                  <div key={texture} className="form-control">
                    <label className={`label cursor-pointer justify-start gap-2 py-1 ${!hasResults && isSelected ? 'opacity-60' : ''}`}>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm flex-shrink-0"
                        checked={isSelected}
                        onChange={(e) => handleTextureChange(texture, e.target.checked)}
                      />
                      <span className="label-text text-sm flex-1 break-words whitespace-normal">{texture}</span>
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
