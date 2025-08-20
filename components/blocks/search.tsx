import _ from 'lodash';
import numeral from 'numeral';
import React, { useState, useCallback, useEffect } from "react";
import useLocalStorage from '../hooks/useLocalStorage';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useInView } from 'react-hook-inview';
import { Section } from "../util/section";
import { Container } from "../util/container";
import { ItemsCount } from '../util/items-count';
import { CollectionFileButton } from '../util/collection-file-button';
import { CollectionMapThumbnail } from '../util/collection-map-thumbnail';
import { Icon } from "../util/icon";

const viewRawData = false; // Set to true to view raw data in the search results

const moratoriumCruises = [
'OSU-KM2201',
'OSU-NBP1808',
'OSU-NBP2002',
'OSU-NBP1902',
'OSU-SLM1801',
'OSU-DLOR2201',
'OSU-FROR2206',
'OSU-FOOR2201',
'OSU-OC1706B',
'OSU-OC1804C',
'OSU-OC1906A',
'OSU-OC1908B',
'OSU-OC2006A',
'OSU-PMOR1806',
'OSU-PMOR1808',
'OSU-PMOR1907',
'OSU-RR1807',
'OSU-RR2208',
'OSU-SP1716',
'OSU-SR1801',
'OSU-SR2113',
'OSU-TT1811',
'OSU-TT1909',
'OSU-NRS2207',
'OSU-SKQ2211',
'OSU-OC2109A',
'OSU-SKQ2303',
'OSU-SKQ2306',
'OSU-NBP2301',
'OSU-NBP2302',
'OSU-NBP2202',
'OSU-CGOR2308',
'OSU-CGOR2309',
'OSU-DOOR2308',
'OSU-DOOR2309',
'OSU-LPOR2308',
'OSU-LPOR2309',
'OSU-AR2307',
'OSU-SKQ202309T',
'OSU-TN314',
'OSU-PE2111',
'OSU-SAFFONZ Torres',
]


const SearchTab: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  type: string;
  searchString?: string;
  filters?: any;
}> = ({ label, isActive, onClick, type, searchString, filters }) => {
  return (
    <div
      className={`tab tab-lg tab-bordered ${isActive ? 'tab-active text-primary' : ''}`}
      onClick={onClick}
    >
      <b>{label}</b>
      <span className={`badge badge-md mx-2 ${isActive ? 'badge-primary' : 'badge-outline'}`}>
        <ItemsCount
          searchString={searchString}
          types={[type]}
          filters={filters}
          singularLabel=""
          pluralLabel=""
        />
      </span>
    </div>
  );
}

const fileTypes = [
  'core-description',
  'core-image',
  'coring-data-sheet',
  'cruise-report',
  'ct-color-image',
  'ct-density',
  'ct-gray-image',
  'ct-image',
  'dredge-log',
  'field-image',
  'igsn-sheet',
  'imlgs-file',
  'itrax-image',
  'itrax-xray-image',
  'mst-data',
  'ptmag-data',
  'publications-data',
  'samples-data',
  'thin-section-cross-polarized-foi-image',
  'thin-section-cross-polarized-image',
  'thin-section-plane-polarized-foi-image',
  'thin-section-plane-polarized-image',
  'whole-rock-foi-image',
  'whole-rock-image',
  'xray-image',
  'xrf-data'
];

const getFileTypeLabel = (fileType: string): string => {
  const labelMap: { [key: string]: string } = {
    'core-description': 'Core Description',
    'core-image': 'Core Image',
    'coring-data-sheet': 'Coring Data Sheet',
    'cruise-report': 'Cruise Report',
    'ct-color-image': 'CT Color Image',
    'ct-density': 'CT Density',
    'ct-gray-image': 'CT Gray Image',
    'ct-image': 'CT Image',
    'dredge-log': 'Dredge Log',
    'field-image': 'Field Image',
    'igsn-sheet': 'IGSN Sheet',
    'imlgs-file': 'IMLGS File',
    'itrax-image': 'ITRAX Image',
    'itrax-xray-image': 'ITRAX X-Ray Image',
    'mst-data': 'MST Data',
    'ptmag-data': 'Paleomagnetic Data',
    'publications-data': 'Publications Data',
    'samples-data': 'Samples Data',
    'thin-section-cross-polarized-foi-image': 'Thin Section Cross-Polarized FOI',
    'thin-section-cross-polarized-image': 'Thin Section Cross-Polarized',
    'thin-section-plane-polarized-foi-image': 'Thin Section Plane-Polarized FOI',
    'thin-section-plane-polarized-image': 'Thin Section Plane-Polarized',
    'whole-rock-foi-image': 'Whole Rock FOI Image',
    'whole-rock-image': 'Whole Rock Image',
    'xray-image': 'X-Ray Image',
    'xrf-data': 'XRF Data'
  };
  
  return labelMap[fileType] || fileType;
};

const FilterPanel: React.FC<{
  search: any;
  setSearch: (search: any) => void;
}> = ({ search, setSearch }) => {
  const selectedFileTypes = search.filters?.fileTypes || [];
  const selectedMethods = search.filters?.methods || [];
  const selectedMaterialTypes = search.filters?.materialTypes || [];
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
  
  // Fetch counts for each file type
  const { data: fileTypeCounts, isLoading: countsLoading } = useQuery({
    queryKey: ['fileTypeCounts', search.types, search.searchString],
    queryFn: async () => {
      const res = await fetch('/api/opensearch?fileTypeCounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          types: search.types,
          searchString: search.searchString || ''
        }),
      });
      
      if (res.ok) {
        return await res.json();
      }
      return {};
    }
  });

  // Fetch available collection methods for cores and rocks
  const { data: methodCounts, isLoading: methodsLoading } = useQuery({
    queryKey: ['methodCounts', search.types, search.searchString],
    queryFn: async () => {
      // Only fetch method counts for cores and dive (rocks)
      if (!search.types.some((type: string) => ['core', 'dive'].includes(type))) {
        return {};
      }
      
      const res = await fetch('/api/opensearch?methodCounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          types: search.types,
          searchString: search.searchString || ''
        }),
      });
      
      if (res.ok) {
        return await res.json();
      }
      return {};
    },
    enabled: search.types.some((type: string) => ['core', 'dive'].includes(type))
  });

  // Fetch available material types for cores only
  const { data: materialCounts, isLoading: materialsLoading } = useQuery({
    queryKey: ['materialCounts', search.types, search.searchString],
    queryFn: async () => {
      // Only fetch material counts for cores
      if (!search.types.includes('core')) {
        return {};
      }
      
      const res = await fetch('/api/opensearch?materialCounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          types: search.types,
          searchString: search.searchString || ''
        }),
      });
      
      if (res.ok) {
        return await res.json();
      }
      return {};
    },
    enabled: search.types.includes('core')
  });

  // Fetch available RV names for cruises only
  const { data: rvNameCounts, isLoading: rvNamesLoading } = useQuery({
    queryKey: ['rvNameCounts', search.types, search.searchString],
    queryFn: async () => {
      // Only fetch RV name counts for cruises
      if (!search.types.includes('cruise')) {
        return {};
      }
      
      const res = await fetch('/api/opensearch?rvNameCounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          types: search.types,
          searchString: search.searchString || ''
        }),
      });
      
      if (res.ok) {
        return await res.json();
      }
      return {};
    },
    enabled: search.types.includes('cruise')
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

  const handleMaterialTypeChange = (materialType: string, checked: boolean) => {
    const currentMaterialTypes = search.filters?.materialTypes || [];
    const newMaterialTypes = checked 
      ? [...currentMaterialTypes, materialType]
      : currentMaterialTypes.filter((m: string) => m !== materialType);
    
    setSearch({
      ...search,
      filters: {
        ...search.filters,
        materialTypes: newMaterialTypes
      }
    });
  };

  const handleRvNameChange = (rvName: string, checked: boolean) => {
    const currentRvNames = search.filters?.rvNames || [];
    const newRvNames = checked 
      ? [...currentRvNames, rvName]
      : currentRvNames.filter((r: string) => r !== rvName);
    
    setSearch({
      ...search,
      filters: {
        ...search.filters,
        rvNames: newRvNames
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
      // Deselect all available file types
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
      // Select all available file types
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

  const toggleAllMethods = () => {
    const availableMethodsWithResults = availableMethods.filter(method => 
      (methodCounts?.[method] || 0) > 0
    );
    const allAvailableSelected = availableMethodsWithResults.every(method => 
      selectedMethods.includes(method)
    );
    
    if (allAvailableSelected) {
      // Deselect all available methods
      setSearch({
        ...search,
        filters: {
          ...search.filters,
          methods: selectedMethods.filter(method => 
            !availableMethodsWithResults.includes(method)
          )
        }
      });
    } else {
      // Select all available methods
      const newMethods = Array.from(new Set([...selectedMethods, ...availableMethodsWithResults]));
      setSearch({
        ...search,
        filters: {
          ...search.filters,
          methods: newMethods
        }
      });
    }
  };

  const toggleAllMaterialTypes = () => {
    const availableMaterialTypesWithResults = availableMaterialTypes.filter(materialType => 
      (materialCounts?.[materialType] || 0) > 0
    );
    const allAvailableSelected = availableMaterialTypesWithResults.every(materialType => 
      selectedMaterialTypes.includes(materialType)
    );
    
    if (allAvailableSelected) {
      // Deselect all available material types
      setSearch({
        ...search,
        filters: {
          ...search.filters,
          materialTypes: selectedMaterialTypes.filter(materialType => 
            !availableMaterialTypesWithResults.includes(materialType)
          )
        }
      });
    } else {
      // Select all available material types
      const newMaterialTypes = Array.from(new Set([...selectedMaterialTypes, ...availableMaterialTypesWithResults]));
      setSearch({
        ...search,
        filters: {
          ...search.filters,
          materialTypes: newMaterialTypes
        }
      });
    }
  };

  const toggleAllRvNames = () => {
    const availableRvNamesWithResults = availableRvNames.filter(rvName => 
      (rvNameCounts?.[rvName] || 0) > 0
    );
    const allAvailableSelected = availableRvNamesWithResults.every(rvName => 
      selectedRvNames.includes(rvName)
    );
    
    if (allAvailableSelected) {
      // Deselect all available RV names
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
      // Select all available RV names
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

  // Filter out file types with 0 counts, but keep selected ones visible
  // Sort selected items to the top
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

  // Filter out methods with 0 counts, but keep selected ones visible
  // Sort selected items to the top
  const availableMethods = methodCounts 
    ? Object.keys(methodCounts).filter(method => 
        (methodCounts[method] || 0) > 0 || selectedMethods.includes(method)
      ).sort((a, b) => {
        const aSelected = selectedMethods.includes(a);
        const bSelected = selectedMethods.includes(b);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.localeCompare(b);
      })
    : [];

  // Filter out material types with 0 counts, but keep selected ones visible
  // Sort selected items to the top
  const availableMaterialTypes = materialCounts 
    ? Object.keys(materialCounts).filter(materialType => 
        (materialCounts[materialType] || 0) > 0 || selectedMaterialTypes.includes(materialType)
      ).sort((a, b) => {
        const aSelected = selectedMaterialTypes.includes(a);
        const bSelected = selectedMaterialTypes.includes(b);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.localeCompare(b);
      })
    : [];

  // Filter out RV names with 0 counts, but keep selected ones visible
  // Sort selected items to the top
  const availableRvNames = rvNameCounts 
    ? Object.keys(rvNameCounts).filter(rvName => 
        (rvNameCounts[rvName] || 0) > 0 || selectedRvNames.includes(rvName)
      ).sort((a, b) => {
        const aSelected = selectedRvNames.includes(a);
        const bSelected = selectedRvNames.includes(b);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.localeCompare(b);
      })
    : [];

  return (
    <div className="pr-4 min-w-[300px] border-r-2">
      <div className="sticky top-0 bg-white pb-2">
        <h4 className="font-bold text-lg mt-0">
          Filters
        </h4>
      </div>
      
      {/* Only show File Types filter if there are file types with results */}
      {availableFileTypes.some(fileType => (fileTypeCounts?.[fileType] || 0) > 0) && (
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text font-semibold">File Types</span>
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
                    fileTypes: []
                  }
                });
              }}
            >
              Clear
            </button>
          </div>
        </label>
        
        <div className="max-h-[200px] overflow-y-scroll border rounded p-2 bg-base-100">
          {countsLoading ? (
            <div className="flex justify-center items-center py-4">
              <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
              <span className="ml-2 text-sm">Loading filters...</span>
            </div>
          ) : (
            <>
              {availableFileTypes.map((fileType) => {
                const count = fileTypeCounts?.[fileType] || 0;
                const isSelected = selectedFileTypes.includes(fileType);
                const hasResults = count > 0;
                
                return (
                  <div key={fileType} className="form-control">
                    <label className={`label cursor-pointer justify-start gap-2 py-1 ${!hasResults && isSelected ? 'opacity-60' : ''}`}>
                      <input 
                        type="checkbox" 
                        className="checkbox checkbox-sm"
                        checked={isSelected}
                        onChange={(e) => handleFileTypeChange(fileType, e.target.checked)}
                      />
                      <span className="label-text text-sm flex-1">{getFileTypeLabel(fileType)}</span>
                      <span className={`badge badge-sm ${hasResults ? 'badge-outline' : 'badge-ghost'}`}>
                        {numeral(count).format('0,0')}
                      </span>
                    </label>
                  </div>
                );
              })}
              
              {/* Filter Logic Toggle for File Types - show when at least one is selected */}
              {selectedFileTypes.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-center">
                    <div className="join">
                      <button 
                        className={`btn btn-xs join-item ${(search.filterLogic?.fileTypes || 'OR') === 'OR' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => toggleFilterLogic('fileTypes')}
                      >
                        OR
                      </button>
                      <button 
                        className={`btn btn-xs join-item ${(search.filterLogic?.fileTypes || 'OR') === 'AND' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => toggleFilterLogic('fileTypes')}
                      >
                        AND
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-center text-gray-500 mt-1">
                    {(search.filterLogic?.fileTypes || 'OR') === 'OR' ? 'Match ANY selected file type' : 'Match ALL selected file types'}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      )}

      {/* Collection Method Filter - only show for cores and rocks and if there are methods with results */}
      {search.types.some((type: string) => ['core', 'dive'].includes(type)) && 
       availableMethods.some(method => (methodCounts?.[method] || 0) > 0) && (
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-semibold">Collection Method</span>
            <div className="flex gap-1">
              <button 
                className="btn btn-xs btn-ghost"
                onClick={toggleAllMethods}
                disabled={methodsLoading}
              >
                {(() => {
                  const availableMethodsWithResults = availableMethods.filter(method => 
                    (methodCounts?.[method] || 0) > 0
                  );
                  const allAvailableSelected = availableMethodsWithResults.every(method => 
                    selectedMethods.includes(method)
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
                      methods: []
                    }
                  });
                }}
              >
              Clear
            </button>
          </div>
        </label>
        
        <div className="max-h-[200px] overflow-y-scroll border rounded p-2 bg-base-100">
          {methodsLoading ? (
            <div className="flex justify-center items-center py-4">
              <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
              <span className="ml-2 text-sm">Loading methods...</span>
            </div>
          ) : (
            <>
              {availableMethods.map((method) => {
                const count = methodCounts?.[method] || 0;
                const isSelected = selectedMethods.includes(method);
                const hasResults = count > 0;
                
                return (
                  <div key={method} className="form-control">
                    <label className={`label cursor-pointer justify-start gap-2 py-1 ${!hasResults && isSelected ? 'opacity-60' : ''}`}>
                      <input 
                        type="checkbox" 
                        className="checkbox checkbox-sm"
                        checked={isSelected}
                        onChange={(e) => handleMethodChange(method, e.target.checked)}
                      />
                      <span className="label-text text-sm flex-1">{method || 'Unknown'}</span>
                      <span className={`badge badge-sm ${hasResults ? 'badge-outline' : 'badge-ghost'}`}>
                        {numeral(count).format('0,0')}
                      </span>
                    </label>
                  </div>
                );
              })}
              
              {/* Filter Logic Toggle for Collection Method - show when at least one is selected */}
              {selectedMethods.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-center">
                    <div className="join">
                      <button 
                        className={`btn btn-xs join-item ${(search.filterLogic?.methods || 'OR') === 'OR' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => toggleFilterLogic('methods')}
                      >
                        OR
                      </button>
                      <button 
                        className={`btn btn-xs join-item ${(search.filterLogic?.methods || 'OR') === 'AND' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => toggleFilterLogic('methods')}
                      >
                        AND
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-center text-gray-500 mt-1">
                    {(search.filterLogic?.methods || 'OR') === 'OR' ? 'Match ANY selected method' : 'Match ALL selected methods'}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      )}

      {/* Material Type Filter - only show for cores and if there are materials with results */}
      {search.types.includes('core') && 
       availableMaterialTypes.some(materialType => (materialCounts?.[materialType] || 0) > 0) && (
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-semibold">Material Type</span>
            <div className="flex gap-1">
              <button 
                className="btn btn-xs btn-ghost"
                onClick={toggleAllMaterialTypes}
                disabled={materialsLoading}
              >
                {(() => {
                  const availableMaterialTypesWithResults = availableMaterialTypes.filter(materialType => 
                    (materialCounts?.[materialType] || 0) > 0
                  );
                  const allAvailableSelected = availableMaterialTypesWithResults.every(materialType => 
                    selectedMaterialTypes.includes(materialType)
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
                      materialTypes: []
                    }
                  });
                }}
              >
              Clear
            </button>
          </div>
        </label>
        
        <div className="max-h-[200px] overflow-y-scroll border rounded p-2 bg-base-100">
          {materialsLoading ? (
            <div className="flex justify-center items-center py-4">
              <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
              <span className="ml-2 text-sm">Loading materials...</span>
            </div>
          ) : (
            <>
              {availableMaterialTypes.map((materialType) => {
                const count = materialCounts?.[materialType] || 0;
                const isSelected = selectedMaterialTypes.includes(materialType);
                const hasResults = count > 0;
                
                return (
                  <div key={materialType} className="form-control">
                    <label className={`label cursor-pointer justify-start gap-2 py-1 ${!hasResults && isSelected ? 'opacity-60' : ''}`}>
                      <input 
                        type="checkbox" 
                        className="checkbox checkbox-sm"
                        checked={isSelected}
                        onChange={(e) => handleMaterialTypeChange(materialType, e.target.checked)}
                      />
                      <span className="label-text text-sm flex-1">{materialType || 'Unknown'}</span>
                      <span className={`badge badge-sm ${hasResults ? 'badge-outline' : 'badge-ghost'}`}>
                        {numeral(count).format('0,0')}
                      </span>
                    </label>
                  </div>
                );
              })}
              
              {/* Filter Logic Toggle for Material Type - show when at least one is selected */}
              {selectedMaterialTypes.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-center">
                    <div className="join">
                      <button 
                        className={`btn btn-xs join-item ${(search.filterLogic?.materialTypes || 'OR') === 'OR' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => toggleFilterLogic('materialTypes')}
                      >
                        OR
                      </button>
                      <button 
                        className={`btn btn-xs join-item ${(search.filterLogic?.materialTypes || 'OR') === 'AND' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => toggleFilterLogic('materialTypes')}
                      >
                        AND
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-center text-gray-500 mt-1">
                    {(search.filterLogic?.materialTypes || 'OR') === 'OR' ? 'Match ANY selected material' : 'Match ALL selected materials'}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      )}

      {/* RV Name Filter - only show for cruises and if there are RV names with results */}
      {search.types.includes('cruise') && 
       availableRvNames.some(rvName => (rvNameCounts?.[rvName] || 0) > 0) && (
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-semibold">RV Name</span>
            <div className="flex gap-1">
              <button 
                className="btn btn-xs btn-ghost"
                onClick={toggleAllRvNames}
                disabled={rvNamesLoading}
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
        </label>
        
        <div className="max-h-[200px] overflow-y-scroll border rounded p-2 bg-base-100">
          {rvNamesLoading ? (
            <div className="flex justify-center items-center py-4">
              <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
              <span className="ml-2 text-sm">Loading RV names...</span>
            </div>
          ) : (
            <>
              {availableRvNames.map((rvName) => {
                const count = rvNameCounts?.[rvName] || 0;
                const isSelected = selectedRvNames.includes(rvName);
                const hasResults = count > 0;
                
                return (
                  <div key={rvName} className="form-control">
                    <label className={`label cursor-pointer justify-start gap-2 py-1 ${!hasResults && isSelected ? 'opacity-60' : ''}`}>
                      <input 
                        type="checkbox" 
                        className="checkbox checkbox-sm"
                        checked={isSelected}
                        onChange={(e) => handleRvNameChange(rvName, e.target.checked)}
                      />
                      <span className="label-text text-sm flex-1">{rvName || 'Unknown'}</span>
                      <span className={`badge badge-sm ${hasResults ? 'badge-outline' : 'badge-ghost'}`}>
                        {numeral(count).format('0,0')}
                      </span>
                    </label>
                  </div>
                );
              })}
              
              {/* Filter Logic Toggle for RV Name - show when at least one is selected */}
              {selectedRvNames.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-center">
                    <div className="join">
                      <button 
                        className={`btn btn-xs join-item ${(search.filterLogic?.rvNames || 'OR') === 'OR' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => toggleFilterLogic('rvNames')}
                      >
                        OR
                      </button>
                      <button 
                        className={`btn btn-xs join-item ${(search.filterLogic?.rvNames || 'OR') === 'AND' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => toggleFilterLogic('rvNames')}
                      >
                        AND
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-center text-gray-500 mt-1">
                    {(search.filterLogic?.rvNames || 'OR') === 'OR' ? 'Match ANY selected RV name' : 'Match ALL selected RV names'}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

export const Search: React.FC<{ data: any }> = ({
    data
}) => {
  const pageSize = 10;
  const [search, setSearch] = useLocalStorage('search-2025-08-06-v2', {
    sortOrder: 'alpha asc',
    searchString: '',
    types: ['cruise'],
    filters: {
      fileTypes: [], // Array of selected file types
      methods: [], // Array of selected collection methods
      materialTypes: [], // Array of selected material types
      rvNames: [], // Array of selected RV names
    },
    filterLogic: {
      fileTypes: 'OR', // 'OR' or 'AND'
      methods: 'OR',
      materialTypes: 'OR',
      rvNames: 'OR',
    }
  });
  const [searchString, setSearchString] = useState(search.searchString || '');
  const [expandedRawData, setExpandedRawData] = useState<Set<string>>(new Set());
  const [ref, isVisible] = useInView({
      threshold: 0,
  });

  const debouncedSetSearch = useCallback(
    _.debounce((newSearchString: string) => {
      const cleanedSearchString = newSearchString.replace(/^http(s?):\/\/osu-mgr.org\//i, '');
      setSearch(prevSearch => ({ ...prevSearch, searchString: cleanedSearchString }));
      // Resetting pagination is handled by React Query when the queryKey (search) changes
    }, 500),
    [setSearch]
  );

  const {
    data: results,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingQuery,
  } = useInfiniteQuery({
    queryKey: ['searchResults', search],
    queryFn: async ({ pageParam }) => { 
      const payload = {
        ...search,
        from: pageSize * pageParam,
        size: pageSize,
      };
      const res = await fetch('/api/opensearch?search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorresults = await res.json();
        throw new Error(errorresults.message || 'Failed to fetch search results');
      }
      return res.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !lastPage.hits || !lastPage.hits.hits) {
        return undefined;
      }
      const totalFetched = allPages.reduce((acc, page) => acc + (page.hits?.hits?.length || 0), 0);
      const totalAvailable = lastPage.hits.total?.value || 0;

      if (totalFetched < totalAvailable) {
        return allPages.length;
      }
      return undefined;
    }
  });

  const matches = results?.pages.flatMap(pageresults => pageresults.hits?.hits || []) || [];
  
  const toggleRawData = (itemId: string) => {
    setExpandedRawData(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };
  
  useEffect(() => {
    if (isVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

  console.log("Search types: ", search.types);
  return (
    <Section>
      <Container className="my-4 prose max-w-none" width="custom">
        <h3>Search OSU-MGR Collections</h3>
        <div className="form-control">
          <div className="input-group flex">
            <input type="text"
              placeholder="Search OSU-MGR Collections Text..." className="input input-bordered flex-grow"
              value={searchString}
              onChange={(e) => {
                setSearchString(e.target.value);
                debouncedSetSearch(e.target.value);
              }}
            />
            <button className="btn btn-secondary btn-square"
              onClick={() => {
                setSearchString('');
                setSearch(prevSearch => ({ ...prevSearch, searchString: '' }));
              }}
            >
              <Icon name="BiX" />
            </button>
            <select className="select select-bordered"
              value={search.sortOrder}
              onChange={(e) => {
                setSearch({ ...search, sortOrder: e.target.value });
              }}
            >
              <option value="alpha asc">Names (Ordered)</option>
              <option value="alpha desc">Names (Reverse)</option>
              <option value="ids asc">IDs (Ordered)</option>
              <option value="ids desc">IDs (Reverse)</option>
            </select>
          </div>
        </div>
        <div className="tabs mt-2 min-w-full">
          <SearchTab
            label="Cruises/Programs"
            isActive={search.types.includes('cruise')}
            onClick={() => setSearch({ ...search, types: ['cruise'] })}
            type="cruise"
            searchString={search.searchString}
            filters={search.filters}
          />
          <SearchTab
            label="Cores"
            isActive={search.types.includes('core')}
            onClick={() => setSearch({ ...search, types: ['core'] })}
            type="core"
            searchString={search.searchString}
            filters={search.filters}
          />
          <SearchTab
            label="Core Sections"
            isActive={search.types.includes('section')}
            onClick={() => setSearch({ ...search, types: ['section'] })}
            type="section"
            searchString={search.searchString}
            filters={search.filters}
          />
          <SearchTab
            label="Rocks"
            isActive={search.types.includes('dive')}
            onClick={() => setSearch({ ...search, types: ['dive'] })}
            type="dive"
            searchString={search.searchString}
            filters={search.filters}
          />
          <div className="tab tab-lg tab-bordered flex-grow"></div>  
        </div>
        <div className="flex gap-4 mt-4">
          {/* Filter Panel */}
          <FilterPanel search={search} setSearch={setSearch} />
          
          {/* Main Content Area */}
          <div className="flex-1 min-h-[500px]">
          {matches.length > 0 && search.types.includes('cruise') &&
            <table className="table table-compact w-full mt-0">
              <thead>
                <tr>
                  <th className="rounded-none">Cruise</th> 
                  <th className="rounded-none">RV Name</th> 
                  <th className="rounded-none">Files</th>
                </tr>
              </thead> 
              <tbody>
                { matches.map((match, key) => (
                  <>
                    <tr key={key} className="hover cursor-pointer" onClick={() => {
                      window.location.href = `/${match._source._osuid}`;
                    }}>
                      <td className="align-top"><b>{match._source._osuid}</b>
                      { moratoriumCruises.includes(match._source._osuid) && <div><span className="badge btn-primary">Moratorium</span></div>}
                      </td>
                      <td className="align-top">{match._source.rvName}</td>
                      <td className="align-top">
                        {match._source._files && match._source._files.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {(() => {
                              // Group files by type and count them
                              const fileTypeCounts: { [key: string]: number } = {};
                              match._source._files.forEach((file: any) => {
                                fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
                              });
                              
                              return Object.entries(fileTypeCounts).map(([fileType, count]) => (
                                <div key={fileType} className="text-sm">
                                  <span className="font-bold">{getFileTypeLabel(fileType)}:</span> {count}
                                </div>
                              ));
                            })()}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">No files</span>
                        )}
                      </td>
                    </tr>
                    {viewRawData &&
                      <tr key={`${key}-rawresults`}>
                        <td colSpan={3}>
                          <button 
                            className="btn btn-xs btn-ghost mb-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRawData(`cruise-${key}`);
                            }}
                          >
                            <Icon name={expandedRawData.has(`cruise-${key}`) ? "TbChevronUp" : "TbChevronDown"} className="w-3 h-3 mr-1" />
                            Raw Data
                          </button>
                          {expandedRawData.has(`cruise-${key}`) && (
                            <pre><code className="flex flex-col gap-2">
                              {JSON.stringify(match._source, null, 2)}
                            </code></pre>
                          )}
                        </td>
                      </tr>
                    }
                  </>
                )) }
              </tbody>
            </table>
          }
          {matches.length > 0 && search.types.includes('core') &&
            <table className="table table-compact w-full mt-0">
              <thead>
                <tr>
                  <th className="rounded-none">Core</th>
                  <th className="rounded-none">Size</th>
                  <th className="rounded-none">Depth</th>
                  <th className="rounded-none">Collection</th>
                  <th className="rounded-none">Location</th>
                  <th className="rounded-none">Files</th>
                </tr>
              </thead> 
              <tbody>
                  {matches.map((match, key) => (
                  <>
                    <tr key={key} className="hover cursor-pointer" onClick={() => {
                      window.location.href = `/${match._source._osuid}`;
                    }}>
                      <td className="align-top">
                        <b>{match._source._osuid}</b>
                        {match._source.nSections != null && <><br/><b>Sections:</b> {numeral(match._source.nSections).format(0)}</>}
                      </td>
                      <td className="align-top">
                        {match._source.length != null && <><b>Length:</b><br/>{numeral(match._source.length).format(0.00)} cm<br /></>}
                        {match._source.diameter != null && <><b>Diameter:</b><br/>{numeral(match._source.diameter).format(0.00)} cm<br /></>}
                      </td>
                      <td className="align-top">
                        {(match._source.waterDepthStart != null || match._source.waterDepthEnd != null) &&
                          <>
                            <b>Water Depth:</b><br />
                            {match._source.waterDepthStart && numeral(match._source.waterDepthStart).format(0.00) || ""} {match._source.waterDepthStart && match._source.waterDepthEnd && "-" || ""} {match._source.waterDepthEnd && numeral(match._source.waterDepthEnd).format(0.00) || ""} cm<br />
                          </>
                        }
                      </td>
                      <td className="align-top">
                        {match._source.material != null && <><b>Material:</b><br/>{match._source.material}<br /></>}
                        {match._source.method != null && <><b>Method:</b><br/>{match._source.method}<br/></>}
                      </td>
                      <td className="align-top">
                        <div className="flex flex-row gap-2">
                          <CollectionMapThumbnail
                            lat={match._source.latitudeStart || match._source.latitudeEnd}
                            lon={match._source.longitudeStart || match._source.longitudeEnd}
                          />
                          <div>
                            {(match._source.latitudeStart != null || match._source.latitudeEnd != null) &&
                            <>
                              <b>Latitude:</b><br/>
                              {match._source.latitudeStart != null && numeral(match._source.latitudeStart).format('0.0000')}
                              {match._source.latitudeStart != null && match._source.latitudeEnd != null && ' to '}
                              {match._source.latitudeEnd != null && numeral(match._source.latitudeEnd).format('0.0000')}
                              <br />
                            </>}
                            {(match._source.longitudeStart != null || match._source.longitudeEnd != null) &&
                            <>
                              <b>Longitude:</b><br/>
                              {match._source.longitudeStart != null && numeral(match._source.longitudeStart).format('0.0000')}
                              {match._source.longitudeStart != null && match._source.longitudeEnd != null && ' to '}
                              {match._source.longitudeEnd != null && numeral(match._source.longitudeEnd).format('0.0000')}
                              <br />
                            </>}
                          </div>
                        </div>
                      </td>
                      <td className="align-top">
                        {match._source._files && match._source._files.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {(() => {
                              // Group files by type and count them
                              const fileTypeCounts: { [key: string]: number } = {};
                              match._source._files.forEach((file: any) => {
                                fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
                              });
                              
                              return Object.entries(fileTypeCounts).map(([fileType, count]) => (
                                <div key={fileType} className="text-sm">
                                  <span className="font-bold">{getFileTypeLabel(fileType)}:</span> {count}
                                </div>
                              ));
                            })()}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">No files</span>
                        )}
                      </td>
                    </tr>
                    { viewRawData &&
                      <tr key={`${key}-raw`}>
                        <td colSpan={5}>
                          <button 
                            className="btn btn-xs btn-ghost mb-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRawData(`core-${key}`);
                            }}
                          >
                            <Icon name={expandedRawData.has(`core-${key}`) ? "TbChevronUp" : "TbChevronDown"} className="w-3 h-3 mr-1" />
                            Raw Data
                          </button>
                          {expandedRawData.has(`core-${key}`) && (
                            <pre><code className="flex flex-col gap-2">
                              {JSON.stringify(match._source, null, 2)}
                            </code></pre>
                          )}
                        </td>
                      </tr>
                    }
                  </>
                )) }
              </tbody>
            </table>
          }
          {matches.length > 0 && search.types.includes('section') &&
            <table className="table table-compact w-full mt-0">
              <thead>
                <tr>
                  <th className="rounded-none">Section</th>
                  <th className="rounded-none">Size</th>
                  <th className="rounded-none">Depth</th>
                  <th className="rounded-none">Collection</th>
                  <th className="rounded-none">Location</th>
                  <th className="rounded-none">Files</th>
                </tr>
              </thead> 
              <tbody>
                  {matches.map((match, key) => (
                  <>
                    <tr key={key} className="hover cursor-pointer" onClick={() => {
                      window.location.href = `/${match._source._osuid}`;
                    }}>
                      <td className="align-top">
                        <b>{match._source._osuid}</b>
                        {match._source.nSections != null && <><br/><b>Sections:</b> {numeral(match._source.nSections).format(0)}</>}
                      </td>
                      <td className="align-top">
                        {match._source.depthTop != null && match._source.depthBottom != null &&
                          <>
                            <b>Length:</b><br />
                            {numeral(parseFloat(match._source.depthBottom) - parseFloat(match._source.depthTop)).format(0.00)} cm<br />
                          </>
                        }
                      </td>
                      <td className="align-top">
                        {(match._source.depthTop != null || match._source.depthBottom != null) &&
                          <>
                            <b>Core Depth:</b><br />
                            {match._source.depthTop && numeral(match._source.depthTop).format(0.00) || ""} {match._source.depthTop && match._source.depthBottom && "-" || ""} {match._source.depthBottom && numeral(match._source.depthBottom).format(0.00) || ""} cm<br />
                          </>
                        }
                      </td>
                      <td className="align-top">
                        {match._source.material != null && <><b>Material:</b><br/>{match._source.material}<br /></>}
                        {match._source.method != null && <><b>Method:</b><br/>{match._source.method}<br/></>}
                      </td>
                      <td className="align-top">
                        <div className="flex flex-row gap-2">
                          <CollectionMapThumbnail
                            lat={match._source.latitudeStart || match._source.latitudeEnd}
                            lon={match._source.longitudeStart || match._source.longitudeEnd}
                          />
                          <div>
                            {(match._source.latitudeStart != null || match._source.latitudeEnd != null) &&
                            <>
                              <b>Latitude:</b><br/>
                              {match._source.latitudeStart != null && numeral(match._source.latitudeStart).format('0.0000')}
                              {match._source.latitudeStart != null && match._source.latitudeEnd != null && ' to '}
                              {match._source.latitudeEnd != null && numeral(match._source.latitudeEnd).format('0.0000')}
                              <br />
                            </>}
                            {(match._source.longitudeStart != null || match._source.longitudeEnd != null) &&
                            <>
                              <b>Longitude:</b><br/>
                              {match._source.longitudeStart != null && numeral(match._source.longitudeStart).format('0.0000')}
                              {match._source.longitudeStart != null && match._source.longitudeEnd != null && ' to '}
                              {match._source.longitudeEnd != null && numeral(match._source.longitudeEnd).format('0.0000')}
                              <br />
                            </>}
                          </div>
                        </div>
                      </td>
                      <td className="align-top">
                        {match._source._files && match._source._files.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {(() => {
                              // Group files by type and count them
                              const fileTypeCounts: { [key: string]: number } = {};
                              match._source._files.forEach((file: any) => {
                                fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
                              });
                              
                              return Object.entries(fileTypeCounts).map(([fileType, count]) => (
                                <div key={fileType} className="text-sm">
                                  <span className="font-bold">{getFileTypeLabel(fileType)}:</span> {count}
                                </div>
                              ));
                            })()}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">No files</span>
                        )}
                      </td>
                    </tr>
                    { viewRawData &&
                      <tr key={`${key}-raw`}>
                        <td colSpan={5}>
                          <button 
                            className="btn btn-xs btn-ghost mb-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRawData(`section-${key}`);
                            }}
                          >
                            <Icon name={expandedRawData.has(`section-${key}`) ? "TbChevronUp" : "TbChevronDown"} className="w-3 h-3 mr-1" />
                            Raw Data
                          </button>
                          {expandedRawData.has(`section-${key}`) && (
                            <pre><code className="flex flex-col gap-2">
                              {JSON.stringify(match._source, null, 2)}
                            </code></pre>
                          )}
                        </td>
                      </tr>
                    }
                  </>
                )) }
              </tbody>
            </table>
          }
          {matches.length > 0 && search.types.includes('dive') &&
            <table className="table table-compact w-full mt-0">
              <thead>
                <tr>
                  <th className="rounded-none">Rock</th>
                  <th className="rounded-none">Method</th>
                  <th className="rounded-none">Weight (kg)</th>
                  <th className="rounded-none">Area</th>
                  <th className="rounded-none">Files</th>
                </tr>
              </thead> 
              <tbody>
                  {matches.map((match, key) => (
                  <>
                    <tr key={key} className="hover cursor-pointer" onClick={() => {
                      window.location.href = `/${match._source._osuid}`;
                    }}>
                      <td className="align-top"><b>{match._source._osuid}</b></td>
                      <td className="align-top">{match._source.method}</td>
                      <td className="align-top">{match._source.weight == null ? '' : numeral(match._source.weight).format('0.00')}</td>
                      <td className="align-top">{match._source.area}</td>
                      <td className="align-top">
                        {match._source._files && match._source._files.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {(() => {
                              // Group files by type and count them
                              const fileTypeCounts: { [key: string]: number } = {};
                              match._source._files.forEach((file: any) => {
                                fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
                              });
                              
                              return Object.entries(fileTypeCounts).map(([fileType, count]) => (
                                <div key={fileType} className="text-sm">
                                  <span className="font-bold">{getFileTypeLabel(fileType)}:</span> {count}
                                </div>
                              ));
                            })()}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">No files</span>
                        )}
                      </td>
                    </tr>
                    { viewRawData &&
                      <tr key={`${key}-rawresults`}>
                        <td colSpan={5}>
                          <button 
                            className="btn btn-xs btn-ghost mb-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRawData(`dive-${key}`);
                            }}
                          >
                            <Icon name={expandedRawData.has(`dive-${key}`) ? "TbChevronUp" : "TbChevronDown"} className="w-3 h-3 mr-1" />
                            Raw Data
                          </button>
                          {expandedRawData.has(`dive-${key}`) && (
                            <pre><code className="flex flex-col gap-2">
                              {JSON.stringify(match._source, null, 2)}
                            </code></pre>
                          )}
                        </td>
                      </tr>
                    }
                  </>
                )) }
              </tbody>
            </table>
          }

          {/* No results message */}
          {!isLoadingQuery && !isFetchingNextPage && matches.length === 0 && search.searchString.length > 0 && (
            <div className="flex justify-center items-center min-h-[400px] flex-col">
              <div className="text-gray-500">No results found for "{search.searchString}"</div>
              <button className="btn btn-primary mt-4" onClick={() => {
                setSearchString("");
              }}>
                Clear Search
              </button>
            </div>
          )}

          {/* Initial loading spinner (if query is loading and no matches yet) */}
          {isLoadingQuery && !isFetchingNextPage && matches.length === 0 && (
            <div className="flex justify-center items-center min-h-[200px]">
              <Icon name="TbLoader2" className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-2">Loading...</span>
            </div>
          )}
          
          {/* "Loading more" spinner at the end of the list, if actively fetching more */}
          {isFetchingNextPage && (
            <div className="flex justify-center items-center py-4">
              <Icon name="TbLoader2" className="w-6 h-6 text-primary animate-spin" />
              <span className="ml-2">Loading more...</span>
            </div>
          )}
          </div>
        </div>
        {/* Infinite scroll trigger: only show if there are more pages to load */}
        {hasNextPage && <div ref={ref} className="h-1" /> }
      </Container>
    </Section>
  );
};

export const searchBlockSchema = {
  name: "search",
  label: "Search Collections",
  fields: [
    {
      type: "string",
      label: "HTML Source",
      name: "source",
    },
    {
      type: "number",
      label: "Height in Pixels",
      name: "height",
    }
  ],
};