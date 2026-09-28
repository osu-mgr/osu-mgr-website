import React, { useState } from "react";
import { Icon } from "../util/icon";
import { Area, formatArea } from "./map-points";

// Location column filter (the result tables' thumbnail column): the geospatial
// area. Without one it opens the Maps tab to add it; with one it shows its
// ranges, to edit it on the map or clear it.
export const AreaColumnFilter: React.FC<{
  search: any;
  setSearch: (search: any) => void;
  // Opens the Maps tab to edit the area, adding one if create.
  onEditArea: (create: boolean) => void;
}> = ({ search, setSearch, onEditArea }) => {
  const [isOpen, setIsOpen] = useState(false);
  const area: Area | null = search.filters?.area || null;

  return (
    <span className="relative inline ml-1">
      <button
        className="flex items-center gap-1 hover:bg-base-200 px-2 py-1 rounded"
        title={area ? 'Filtered to an area on the map' : 'Filter to an area on the map'}
        onClick={() => (area ? setIsOpen(!isOpen) : onEditArea(true))}
      >
        <Icon name="LuFilter" size="xxs" />
        {area && <span className="badge badge-primary badge-sm">1</span>}
      </button>

      {isOpen && area && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-base-100 rounded-box shadow-lg border z-20 font-normal normal-case">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">Geospatial</span>
              <button
                className="btn btn-xs btn-outline"
                onClick={() => {
                  setIsOpen(false);
                  setSearch({ ...search, filters: { ...search.filters, area: undefined } });
                }}
              >
                Clear
              </button>
            </div>
          </div>
          <div className="p-3 text-sm leading-snug">
            <div>Latitude: {formatArea(area).latitude}</div>
            <div>Longitude: {formatArea(area).longitude}</div>
            <button
              className="link link-primary text-xs"
              onClick={() => {
                setIsOpen(false);
                onEditArea(false);
              }}
            >
              Edit on the map
            </button>
          </div>
        </div>
      )}
    </span>
  );
};
