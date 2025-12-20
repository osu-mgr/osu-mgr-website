import _ from 'lodash';
import numeral from 'numeral';
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import useLocalStorage from '../hooks/useLocalStorage';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-hook-inview';
import { Section } from "../util/section";
import { Container } from "../util/container";
import { ItemsCount } from '../util/items-count';
import { CollectionMapThumbnail } from '../util/collection-map-thumbnail';
import { Icon } from "../util/icon";
import { LandingPage, CruiseGlobe, DiveGlobe } from "./landing-page";
import dynamic from 'next/dynamic';
import JSZip from 'jszip';

const Globe = dynamic(() => import("../util/globe").then(mod => mod.Globe), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[300px] flex items-center justify-center">
    <Icon name="TbLoader2" className="w-8 h-8 animate-spin text-primary" />
  </div>
});

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
  'OSU-CE24009',
  'OSU-NBP2403',
  'OSU-TN426',
  'OSU-TN435'
];

const r2rCruiseLinks = {
  'OSU-AT0003': ['https://www.rvdata.us/search/cruise/AT3-49'],
  'OSU-BENTHIC3': ['https://www.rvdata.us/search/cruise/BNTH03MV'],
  'OSU-EW0104': ['https://www.rvdata.us/search/cruise/EW0104'],
  'OSU-EW0408': ['https://www.rvdata.us/search/cruise/EW0408'],
  'OSU-EW9504': ['https://www.rvdata.us/search/cruise/EW9504'],
  'OSU-EW9505': ['https://www.rvdata.us/search/cruise/EW9505'],
  'OSU-EW9709': ['https://www.rvdata.us/search/cruise/EW9709'],
  'OSU-FD7503': ['https://www.rvdata.us/search/cruise/FDRK03MV'],
  'OSU-HE0002': ['https://www.rvdata.us/search/cruise/HLY0001'],
  'OSU-INMD01': ['https://www.rvdata.us/search/cruise/INMD01MV'],
  'OSU-KM0419': ['https://www.rvdata.us/search/cruise/KM0419'],
  'OSU-M8011': ['https://www.rvdata.us/search/cruise/VLCN03MV','https://www.rvdata.us/search/cruise/VLCN04MV'],
  'OSU-M9907': ['https://www.rvdata.us/search/cruise/AVON09MV'],
  'OSU-ME0005A': ['https://www.rvdata.us/search/cruise/NEMO03MV'],
  'OSU-MV0209': ['https://www.rvdata.us/search/cruise/VANC02MV'],
  'OSU-MV0502': ['https://www.rvdata.us/search/cruise/TUIM03MV'],
  'OSU-MV0508': ['https://www.rvdata.us/search/cruise/TUIM13MV'],
  'OSU-MV0811': ['https://www.rvdata.us/search/cruise/BOLT02MV'],
  'OSU-MV1014': ['https://www.rvdata.us/search/cruise/MV1014'],
  'OSU-PE2111': ['https://www.rvdata.us/search/cruise/PE21-11'],
  'OSU-PLDS2': ['https://www.rvdata.us/search/cruise/PLDS02MV'],
  'OSU-PLUME02': ['https://www.rvdata.us/search/cruise/PLUM02WT'],
  'OSU-PLUTO3': ['https://www.rvdata.us/search/cruise/PLTO03MV'],
  'OSU-RAMA1': ['https://www.rvdata.us/search/cruise/RAMA01WT'],
  'OSU-RR0207': ['https://www.rvdata.us/search/cruise/LPRS02RR'],
  'OSU-RR0503': ['https://www.rvdata.us/search/cruise/ZHNG03RR'],
  'OSU-RR0603': ['https://www.rvdata.us/search/cruise/AMAT03RR'],
  'OSU-RR1310': ['https://www.rvdata.us/search/cruise/RR1310'],
  'OSU-RR1807': ['https://www.rvdata.us/search/cruise/RR1807'],
  'OSU-RR2208': ['https://www.rvdata.us/search/vessel/Revelle'],
  'OSU-RR9702A': ['https://www.rvdata.us/search/cruise/GENE03RR'],
  'OSU-SH1710': ['https://www.rvdata.us/search/cruise/HRS1710JH'],
  'OSU-SKQ1603': ['https://www.rvdata.us/search/cruise/SKQ201602S'],
  'OSU-SKQ1903': ['https://www.rvdata.us/search/cruise/SKQ201905S'],
  'OSU-SP1716': ['https://www.rvdata.us/search/cruise/SP1716'],
  'OSU-SR1801': ['https://www.rvdata.us/search/cruise/SR1801'],
  'OSU-SR2113': ['https://www.rvdata.us/search/cruise/SR2113'],
  'OSU-TN037': ['https://www.rvdata.us/search/cruise/TN037'],
  'OSU-TN0909': ['https://www.rvdata.us/search/cruise/TN240'],
  'OSU-TN314': ['https://www.rvdata.us/search/cruise/TN314'],
  'OSU-TT1811': ['https://www.rvdata.us/search/cruise/TN362'],
  'OSU-TT1909': ['https://www.rvdata.us/search/cruise/TN372'],
  'OSU-OC2109A': ['https://www.rvdata.us/search/cruise/OC2109A'],
  'OSU-OC1706B': ['https://www.rvdata.us/search/cruise/OC1706B'],
  'OSU-OC1804C': ['https://www.rvdata.us/search/cruise/OC1804C'],
  'OSU-OC1906A': ['https://www.rvdata.us/search/cruise/OC1906A'],
  'OSU-OC1908B': ['https://www.rvdata.us/search/cruise/OC1908B'],
  'OSU-OC2006A': ['https://www.rvdata.us/search/cruise/OC2006A'],
  'OSU-SKQ202309T': ['https://www.rvdata.us/search/cruise/SKQ202309T'],
  'OSU-SKQ202311S': ['https://www.rvdata.us/search/cruise/SKQ202311S'],
  'OSU-SKQ202404S': ['https://www.rvdata.us/search/cruise/SKQ202404S'],
  'OSU-SKQ202410S': ['https://www.rvdata.us/search/cruise/SKQ202410S'],
  'OSU-SKQ2012': ['https://www.rvdata.us/search/cruise/SKQ202016S'],
  'OSU-SKQ2211': ['https://www.rvdata.us/search/cruise/SKQ202215S'],
  'OSU-SKQ2303': ['https://www.rvdata.us/search/cruise/SKQ202305S'],
  'OSU-SKQ202206S': ['https://www.rvdata.us/search/cruise/SKQ202206S'],
  'OSU-SP2323': ['https://www.rvdata.us/search/cruise/SP2323'],
  'OSU-SR2510': ['https://www.rvdata.us/search/cruise/SR2510'],
  'OSU-W0903B': ['https://www.rvdata.us/search/cruise/W0903B'],
  'OSU-W0906A': ['https://www.rvdata.us/search/cruise/W0906A'],
  'OSU-W0906C': ['https://www.rvdata.us/search/cruise/W0906C'],
  'OSU-W0910B': ['https://www.rvdata.us/search/cruise/W0910B']
};

const SearchTab: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  type: string;
  searchString?: string;
  filters?: any;
  filterLogic?: any;
}> = ({ label, isActive, onClick, type, searchString, filters, filterLogic }) => {
  return (
    <div
      className={`tab tab-lg tab-bordered px-0 ${isActive ? 'tab-active text-primary' : ''}`}
      onClick={onClick}
    >
      <b>{label}</b>
      <span className={`badge badge-md mx-2 ${isActive ? 'badge-primary' : 'badge-outline'}`}>
        <ItemsCount
          searchString={searchString}
          types={[type]}
          filters={filters}
          filterLogic={filterLogic}
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
  //'itrax-image',
  //'itrax-xray-image',
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

const fileTypeLabelMap: { [key: string]: string } = {
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
  //'itrax-image': 'ITRAX Image',
  //'itrax-xray-image': 'ITRAX X-Ray Image',
  'mst-data': 'MST Data',
  'ptmag-data': 'Point MS Data',
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

const hasFileTypeLabel = (fileType: string): boolean => {
  return fileType in fileTypeLabelMap;
};

const getFileTypeLabel = (fileType: string): string => {
  return fileTypeLabelMap[fileType] || fileType;
};

// File Types Filter Dropdown Component
const FileTypesFilterDropdown: React.FC<{
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

// RV Name Filter Dropdown Component
const RvNameFilterDropdown: React.FC<{
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
    cacheTime: 30 * 60 * 1000, // 30 minutes
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

// Institution Filter Dropdown Component
const InstitutionFilterDropdown: React.FC<{
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
    queryKey: ['institutionCounts', search.types, search.searchString, search.filters?.fileTypes, search.filterLogic?.fileTypes, search.filters?.methods, search.filters?.materialTypes, search.filters?.rvNames, search.filters?.areas, search.filters?.textures],
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
    cacheTime: 30 * 60 * 1000, // 30 minutes
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

// Area Filter Dropdown Component
const AreaFilterDropdown: React.FC<{
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
    cacheTime: 30 * 60 * 1000, // 30 minutes
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

// Texture Filter Dropdown Component
const TextureFilterDropdown: React.FC<{
  search: any;
  setSearch: (search: any) => void;
}> = ({ search, setSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedTextures = search.filters?.textures || [];

  // Fetch counts for each texture
  const { data: textureCounts, isLoading: countsLoading } = useQuery({
    queryKey: ['textureCountsDropdown', search.types, search.searchString, JSON.stringify(search.filters?.fileTypes), search.filterLogic?.fileTypes, JSON.stringify(search.filters?.methods), JSON.stringify(search.filters?.materialTypes), JSON.stringify(search.filters?.areas), JSON.stringify(search.filters?.textures)],
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
    cacheTime: 30 * 60 * 1000, // 30 minutes
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

// Collection Filter Dropdown Component (Material Types + Methods)
const CollectionFilterDropdown: React.FC<{
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
    queryKey: ['methodCounts', search.types, search.searchString, search.filters?.fileTypes, search.filterLogic?.fileTypes, search.filters?.methods, search.filters?.materialTypes, search.filters?.rvNames, search.filters?.institutions, search.filters?.areas, search.filters?.textures],
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
    cacheTime: 30 * 60 * 1000, // 30 minutes
    enabled: search.types.includes('core') || search.types.includes('dive')
  });

  // Fetch counts for each material type
  const { data: materialCounts, isLoading: materialCountsLoading } = useQuery({
    queryKey: ['materialCounts', search.types, search.searchString, search.filters?.fileTypes, search.filterLogic?.fileTypes, search.filters?.methods, search.filters?.materialTypes, search.filters?.rvNames, search.filters?.institutions, search.filters?.areas, search.filters?.textures],
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
    cacheTime: 30 * 60 * 1000, // 30 minutes
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

// Download Files Button Component
const DownloadFilesButton: React.FC<{
  search: any;
  searchString: string;
  moratoriumCruises: string[];
}> = ({ search, searchString, moratoriumCruises }) => {

  const [isOpen, setIsOpen] = useState(false);
  const [selectedFileTypes, setSelectedFileTypes] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Fetch file counts from ALL result types (not just current)
  // Count unique file names/paths instead of counting duplicates
  const { data: fileTypeCounts, isLoading: countsLoading } = useQuery({
    queryKey: ['fileTypeCountsAll', search.searchString, search.filters?.fileTypes, search.filterLogic?.fileTypes, search.filters?.methods, search.filters?.materialTypes, search.filters?.rvNames],
    queryFn: async () => {
      // Fetch all documents from all document types
      const allTypes = ['cruise', 'core', 'section', 'section-half', 'dive', 'rock'];
      let allMatches: any[] = [];

      for (const docType of allTypes) {
        let pageNum = 0;
        const pageSize = 100;

        while (true) {
          const payload = {
            ...search,
            types: [docType],
            from: pageSize * pageNum,
            size: pageSize,
          };
          const res = await fetch('/api/opensearch?search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) break;

          const data = await res.json();
          const hits = data.hits?.hits || [];
          if (hits.length === 0) break;

          allMatches = allMatches.concat(hits);
          pageNum++;

          // Stop if we've fetched all available results
          const totalAvailable = data.hits.total?.value || 0;
          const fetchedForType = pageNum * pageSize;
          if (fetchedForType >= totalAvailable) break;
        }
      }

      // Count unique file paths by file type
      const uniqueFilesByType: { [key: string]: Set<string> } = {};
      
      for (const match of allMatches) {
        // Skip moratorium cruises
        if (moratoriumCruises.includes(match._source._osuid)) continue;

        const files = match._source._files || [];
        for (const file of files) {
          // Skip itrax file types
          if (file.type && file.type.startsWith('itrax-')) continue;
          
          if (!uniqueFilesByType[file.type]) {
            uniqueFilesByType[file.type] = new Set();
          }
          uniqueFilesByType[file.type].add(file.path);
        }
      }

      // Convert Sets to counts
      const counts: { [key: string]: number } = {};
      for (const [fileType, pathSet] of Object.entries(uniqueFilesByType)) {
        counts[fileType] = pathSet.size;
      }

      return counts;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  const availableFileTypes = Object.keys(fileTypeCounts || {})
    .filter(fileType => !fileType.startsWith('itrax-'))
    .sort();

  // Initialize selected file types when available types change
  useEffect(() => {
    if (availableFileTypes.length > 0) {
      setSelectedFileTypes(new Set(availableFileTypes));
    } else {
      // Close menu when no file types available
      setIsOpen(false);
    }
  }, [availableFileTypes.join(',')]);

  // Calculate total files to download
  const totalFiles = Object.entries(fileTypeCounts || {})
    .filter(([type]) => selectedFileTypes.has(type))
    .reduce((sum, [, count]) => sum + (count as number), 0);
  const tooManyFiles = totalFiles > 1000;

  const handleDownload = async () => {
    if (tooManyFiles || totalFiles === 0) return;

    setIsDownloading(true);
    try {
      const zip = new JSZip();

      // Fetch all results from ALL document types by scrolling through pages
      let allMatches: any[] = [];
      const allTypes = ['cruise', 'core', 'section', 'section-half', 'dive', 'rock'];

      for (const docType of allTypes) {
        let pageNum = 0;
        const pageSize = 100;

        while (true) {
          const payload = {
            ...search,
            types: [docType],
            from: pageSize * pageNum,
            size: pageSize,
          };
          const res = await fetch('/api/opensearch?search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) break;

          const data = await res.json();
          const hits = data.hits?.hits || [];
          if (hits.length === 0) break;

          allMatches = allMatches.concat(hits);
          pageNum++;

          // Stop if we've fetched all available results
          const totalAvailable = data.hits.total?.value || 0;
          const fetchedForType = pageNum * pageSize;
          if (fetchedForType >= totalAvailable) break;
        }
      }

      // Collect all files to download
      const filesToDownload: any[] = [];
      for (const match of allMatches) {
        // Skip moratorium cruises
        if (moratoriumCruises.includes(match._source._osuid)) continue;

        const files = match._source._files || [];
        for (const file of files) {
          // Skip itrax file types
          if (file.type && file.type.startsWith('itrax-')) continue;
          
          if (selectedFileTypes.has(file.type)) {
            filesToDownload.push(file);
          }
        }
      }

      // Fetch and add each file to the zip
      let fetchedCount = 0;
      for (const file of filesToDownload) {
        try {
          const response = await fetch(`/api/file/${file.path}`);
          if (response.ok) {
            const blob = await response.blob();
            // Extract just the filename from the path
            const filename = file.path.split('/').pop() || file.path;
            zip.file(filename, blob);
          }
          fetchedCount++;
          setDownloadProgress((fetchedCount / filesToDownload.length) * 100);
        } catch (error) {
          console.error(`Failed to fetch file: ${file.path}`, error);
          fetchedCount++;
          setDownloadProgress((fetchedCount / filesToDownload.length) * 100);
        }
      }

      // Generate and download the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `osu-mgr-files-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsOpen(false);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download files. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const toggleFileType = (fileType: string) => {
    const newSet = new Set(selectedFileTypes);
    if (newSet.has(fileType)) {
      newSet.delete(fileType);
    } else {
      newSet.add(fileType);
    }
    setSelectedFileTypes(newSet);
  };

  const toggleAll = () => {
    if (selectedFileTypes.size === Object.keys(fileTypeCounts || {}).length) {
      setSelectedFileTypes(new Set());
    } else {
      setSelectedFileTypes(new Set(Object.keys(fileTypeCounts || {})));
    }
  };

  return (
    <div className="relative ml-2">
      <div>
        <button
          className="btn btn-primary"
          onClick={() => setIsOpen(!isOpen)}
          disabled={!countsLoading && availableFileTypes.length === 0}
        >
          Download Files
          <Icon name={isOpen ? "LuChevronUp" : "LuChevronDown"} size="xxs" className="ml-1" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-base-100 rounded-box shadow-lg border z-30 font-normal normal-case">
          {/* Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="label-text font-semibold pl-0 bg-transparent">Select File Types</span>
              <button
                className="btn btn-xs btn-outline"
                onClick={toggleAll}
              >
                {selectedFileTypes.size === Object.keys(fileTypeCounts || {}).length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* Scrollable file types list */}
          <div className="max-h-64 overflow-y-auto p-2">
            {countsLoading ? (
              <div className="flex justify-center items-center py-4">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
              </div>
            ) : Object.keys(fileTypeCounts || {}).length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No files available
              </div>
            ) : (
              Object.entries(fileTypeCounts || {})
                .filter(([, count]) => (count as number) > 0)
                .map(([fileType, count]) => {
                  const isSelected = selectedFileTypes.has(fileType);
                  return (
                    <div key={fileType} className="form-control">
                      <label className="label cursor-pointer justify-start gap-2 py-1">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={isSelected}
                          onChange={() => toggleFileType(fileType)}
                        />
                        <span className="label-text text-sm bg-transparent flex-1">{getFileTypeLabel(fileType)}</span>
                        <span className="badge badge-sm badge-outline">
                          {numeral(count).format('0,0')}
                        </span>
                      </label>
                    </div>
                  );
                })
            )}
          </div>

          {/* Download button */}
          <div className="p-2 border-t">
            {tooManyFiles && (
              <div className="alert alert-primary mb-2 py-2 text-xs">
                Too many files selected ({numeral(totalFiles).format('0,0')}). Please select fewer than 1,000 files.
              </div>
            )}
            {!tooManyFiles && (
              <button
                className="btn btn-primary btn-sm btn-block relative overflow-hidden"
                disabled={tooManyFiles || totalFiles === 0 || isDownloading}
                onClick={handleDownload}
              >
                {isDownloading && (
                  <div
                    className="absolute inset-0 bg-primary-focus transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                )}
                <span className="relative z-10 bg-transparent">
                  {isDownloading ? (
                    <span className="text-black bg-transparent">
                      <Icon name="TbLoader2" size="small" className="animate-spin inline-block mr-1" />
                      Downloading... {Math.round(downloadProgress)}%
                    </span>
                  ) : (
                    <>Download {numeral(totalFiles).format('0,0')} File{totalFiles !== 1 ? 's' : ''}</>
                  )}
                </span>
              </button>)}
          </div>
        </div>
      )}
    </div>
  );
};

const FilterPanel: React.FC<{
  search: any;
  setSearch: (search: any) => void;
  onToggle: () => void;
}> = ({ search, setSearch, onToggle }) => {
  const selectedMethods = search.filters?.methods || [];
  const selectedMaterialTypes = search.filters?.materialTypes || [];
  const selectedRvNames = search.filters?.rvNames || [];
  const selectedFileTypes = search.filters?.fileTypes || [];

  // Collapse state for each filter section
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({
    methods: false,
    materialTypes: false,
    rvNames: false,
    institutions: false,
    areas: false,
    textures: false,
    fileTypes: false,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Count active filter types
  const activeFilterCount = [
    selectedFileTypes.length > 0,
    selectedMethods.length > 0,
    selectedMaterialTypes.length > 0,
    selectedRvNames.length > 0,
    (search.filters?.institutions || []).length > 0
  ].filter(Boolean).length;
  
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

  // Fetch available collection methods for cores and rocks
  const { data: methodCounts, isLoading: methodsLoading } = useQuery({
    queryKey: ['methodCounts', search.types, search.searchString, search.filters?.methods, search.filterLogic?.methods, search.filters?.fileTypes, search.filters?.materialTypes, search.filters?.rvNames, search.filters?.institutions, search.filters?.areas, search.filters?.textures],
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
    cacheTime: 30 * 60 * 1000, // 30 minutes
    enabled: search.types.some((type: string) => ['core', 'dive'].includes(type))
  });

  // Fetch available material types for cores only
  const { data: materialCounts, isLoading: materialsLoading } = useQuery({
    queryKey: ['materialCounts', search.types, search.searchString, search.filters?.materialTypes, search.filterLogic?.materialTypes, search.filters?.fileTypes, search.filters?.methods, search.filters?.rvNames, search.filters?.institutions, search.filters?.areas, search.filters?.textures],
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
    cacheTime: 30 * 60 * 1000, // 30 minutes
    enabled: search.types.includes('core')
  });

  // Fetch available RV names for cruises only
  const { data: rvNameCounts, isLoading: rvNamesLoading } = useQuery({
    queryKey: ['rvNameCounts', search.types, search.searchString, search.filters?.rvNames, search.filterLogic?.rvNames, search.filters?.fileTypes, search.filters?.methods, search.filters?.materialTypes, search.filters?.institutions, search.filters?.areas, search.filters?.textures],
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
    cacheTime: 30 * 60 * 1000, // 30 minutes
    enabled: search.types.includes('cruise')
  });

  // Fetch counts for each file type - reuse the same query as FileTypesFilterDropdown
  const { data: fileTypeCounts, isLoading: fileTypesLoading } = useQuery({
    queryKey: ['fileTypeCounts', search.types, search.searchString, search.filters?.fileTypes, search.filterLogic?.fileTypes, search.filters?.methods, search.filters?.materialTypes, search.filters?.rvNames, search.filters?.institutions, search.filters?.areas, search.filters?.textures],
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
    cacheTime: 30 * 60 * 1000, // 30 minutes
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

  const handleFileTypeChange = (fileType: string, checked: boolean) => {
    const currentFileTypes = search.filters?.fileTypes || [];
    const newFileTypes = checked 
      ? [...currentFileTypes, fileType]
      : currentFileTypes.filter((f: string) => f !== fileType);
    
    setSearch({
      ...search,
      filters: {
        ...search.filters,
        fileTypes: newFileTypes
      }
    });
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

  // Fetch available institutions for cruises only
  const { data: institutionData, isLoading: institutionsLoading } = useQuery({
    queryKey: ['institutionCounts', search.types, search.searchString, search.filters?.institutions, search.filterLogic?.institutions, search.filters?.fileTypes, search.filters?.methods, search.filters?.materialTypes, search.filters?.rvNames, search.filters?.areas, search.filters?.textures],
    queryFn: async () => {
      // Only fetch institution counts for cruises
      if (!search.types.includes('cruise')) {
        return { counts: {}, piInstitutions: {} };
      }

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
    cacheTime: 30 * 60 * 1000, // 30 minutes
    enabled: search.types.includes('cruise')
  });

  const institutionCounts = institutionData?.counts || {};
  const piInstitutions = institutionData?.piInstitutions || {};

  const selectedInstitutions = search.filters?.institutions || [];

  const handleInstitutionChange = (institution: string, checked: boolean) => {
    const currentInstitutions = search.filters?.institutions || [];
    const newInstitutions = checked
      ? [...currentInstitutions, institution]
      : currentInstitutions.filter((inst: string) => inst !== institution);

    setSearch((prevSearch: any) => ({
      ...prevSearch,
      filters: {
        ...prevSearch.filters,
        institutions: newInstitutions
      }
    }));
  };

  const toggleAllInstitutions = () => {
    const availableInstitutionsWithResults = availableInstitutions.filter(institution =>
      (institutionCounts?.[institution] || 0) > 0
    );
    const allAvailableSelected = availableInstitutionsWithResults.every(institution =>
      selectedInstitutions.includes(institution)
    );

    if (allAvailableSelected) {
      setSearch((prevSearch: any) => ({
        ...prevSearch,
        filters: {
          ...prevSearch.filters,
          institutions: selectedInstitutions.filter((institution: string) =>
            !availableInstitutionsWithResults.includes(institution)
          )
        }
      }));
    } else {
      const newInstitutions = Array.from(new Set([...selectedInstitutions, ...availableInstitutionsWithResults]));
      setSearch((prevSearch: any) => ({
        ...prevSearch,
        filters: {
          ...prevSearch.filters,
          institutions: newInstitutions
        }
      }));
    }
  };

  // Filter out institutions with 0 counts, but keep selected ones visible
  // Sort selected items to the top
  const availableInstitutions = institutionCounts
    ? Object.keys(institutionCounts).filter(institution =>
        (institutionCounts[institution] || 0) > 0 || selectedInstitutions.includes(institution)
      ).sort((a, b) => {
        const aSelected = selectedInstitutions.includes(a);
        const bSelected = selectedInstitutions.includes(b);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.localeCompare(b);
      })
    : [];

  // Fetch available areas for dives/dredges only
  const { data: areaCounts, isLoading: areasLoading } = useQuery({
    queryKey: ['areaCounts', search.types, search.searchString, search.filters?.areas, search.filters?.fileTypes, search.filters?.methods, search.filters?.materialTypes, search.filters?.rvNames, search.filters?.institutions, search.filters?.textures],
    queryFn: async () => {
      // Only fetch area counts for dives and dredges
      if (!search.types.includes('dive')) {
        return {};
      }

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
    cacheTime: 30 * 60 * 1000, // 30 minutes
    enabled: search.types.includes('dive')
  });

  const selectedAreas = search.filters?.areas || [];

  const handleAreaChange = (area: string, checked: boolean) => {
    const currentAreas = search.filters?.areas || [];
    const newAreas = checked
      ? [...currentAreas, area]
      : currentAreas.filter((a: string) => a !== area);

    setSearch((prevSearch: any) => ({
      ...prevSearch,
      filters: {
        ...prevSearch.filters,
        areas: newAreas
      }
    }));
  };

  const toggleAllAreas = () => {
    const availableAreasWithResults = availableAreas.filter(area =>
      (areaCounts?.[area] || 0) > 0
    );
    const allAvailableSelected = availableAreasWithResults.every(area =>
      selectedAreas.includes(area)
    );

    if (allAvailableSelected) {
      setSearch((prevSearch: any) => ({
        ...prevSearch,
        filters: {
          ...prevSearch.filters,
          areas: selectedAreas.filter((area: string) =>
            !availableAreasWithResults.includes(area)
          )
        }
      }));
    } else {
      const newAreas = Array.from(new Set([...selectedAreas, ...availableAreasWithResults]));
      setSearch((prevSearch: any) => ({
        ...prevSearch,
        filters: {
          ...prevSearch.filters,
          areas: newAreas
        }
      }));
    }
  };

  // Filter out areas with 0 counts, but keep selected ones visible
  // Sort selected items to the top
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

  // Fetch available textures for dives/rocks only
  const { data: textureCounts, isLoading: texturesLoading } = useQuery({
    queryKey: ['textureCounts', search.types, search.searchString, search.filters?.textures, search.filters?.fileTypes, search.filterLogic?.fileTypes, search.filters?.methods, search.filters?.materialTypes, search.filters?.areas, search.filters?.rvNames, search.filters?.institutions],
    queryFn: async () => {
      // Only fetch texture counts for dives and rocks
      if (!search.types.some((type: string) => ['dive', 'diveSample'].includes(type))) {
        return {};
      }

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
    cacheTime: 30 * 60 * 1000, // 30 minutes
    enabled: search.types.some((type: string) => ['dive', 'diveSample'].includes(type))
  });

  const selectedTextures = search.filters?.textures || [];

  const handleTextureChange = (texture: string, checked: boolean) => {
    const currentTextures = search.filters?.textures || [];
    const newTextures = checked
      ? [...currentTextures, texture]
      : currentTextures.filter((t: string) => t !== texture);

    setSearch((prevSearch: any) => ({
      ...prevSearch,
      filters: {
        ...prevSearch.filters,
        textures: newTextures
      }
    }));
  };

  const toggleAllTextures = () => {
    const availableTexturesWithResults = availableTextures.filter(texture =>
      (textureCounts?.[texture] || 0) > 0
    );
    const allAvailableSelected = availableTexturesWithResults.every(texture =>
      selectedTextures.includes(texture)
    );

    if (allAvailableSelected) {
      setSearch((prevSearch: any) => ({
        ...prevSearch,
        filters: {
          ...prevSearch.filters,
          textures: selectedTextures.filter((texture: string) =>
            !availableTexturesWithResults.includes(texture)
          )
        }
      }));
    } else {
      const newTextures = Array.from(new Set([...selectedTextures, ...availableTexturesWithResults]));
      setSearch((prevSearch: any) => ({
        ...prevSearch,
        filters: {
          ...prevSearch.filters,
          textures: newTextures
        }
      }));
    }
  };

  // Filter out textures with 0 counts, but keep selected ones visible
  // Sort selected items to the top
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

  // Filter out file types with 0 counts, but keep selected ones visible
  // Sort selected items to the top, and filter out imgs-file
  const availableFileTypes = fileTypeCounts 
    ? fileTypes.filter(fileType => 
        fileType !== 'imgs-file' && // Hide imgs-file from the left panel too
        ((fileTypeCounts[fileType] || 0) > 0 || selectedFileTypes.includes(fileType))
      ).sort((a, b) => {
        const aSelected = selectedFileTypes.includes(a);
        const bSelected = selectedFileTypes.includes(b);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
      })
    : fileTypes.filter(fileType => fileType !== 'imgs-file');

  return (
    <div className="pr-4 w-[320px] flex-shrink-0 border-r-2">
      <div className="sticky top-0 bg-white pb-2">
        <div className="flex items-center justify-between">
          <div className="tabs min-w-full px-0">
            <div className="tab tab-lg tab-bordered text-primary flex-grow justify-start px-0"
                onClick={onToggle}>
              <b>Filters</b>
              <span className="badge bg-white text-primary ml-2 font-bold">{activeFilterCount}</span>
            </div>
            {activeFilterCount > 0 && (
              <div className="tab tab-lg tab-bordered text-primary">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    setSearch({
                      ...search,
                      filters: {
                        fileTypes: [],
                        methods: [],
                        materialTypes: [],
                        rvNames: [],
                        institutions: [],
                        areas: [],
                        textures: []
                      }
                    });
                  }}
                  title="Clear all filters"
                >
                  Clear All
                </button>
              </div>
            )}
            <div className="tab tab-lg tab-bordered text-primary px-0">
              <button
                className="btn btn-sm btn-ghost px-0"
                onClick={onToggle}
              >
                <Icon name="LuChevronLeft" size="small" />
              </button>
            </div>
          </div>
        </div>
      </div>
      

      {/* Collection Method Filter - only show for cores and rocks and if there are methods with results */}
      {search.types.some((type: string) => ['core', 'dive'].includes(type)) &&
       availableMethods.some(method => (methodCounts?.[method] || 0) > 0) && (
        <div className="form-control mb-4">
          <div className="label">
            <span className="label-text font-semibold flex items-center gap-2 cursor-pointer" onClick={() => toggleSection('methods')}>
              <Icon name={collapsedSections.methods ? "LuChevronRight" : "LuChevronDown"} size="xxs" />
              Collection Method
            </span>
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
        </div>

        {!collapsedSections.methods && (
        <div className="border rounded bg-base-100">
          {/* Scrollable filter list */}
          <div className="max-h-[200px] overflow-y-auto p-2">
            {methodsLoading ? (
              <div className="flex justify-center items-center py-4">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-sm">Loading methods...</span>
              </div>
            ) : availableMethods.length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No methods available
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
                          className="checkbox checkbox-sm flex-shrink-0"
                          checked={isSelected}
                          onChange={(e) => handleMethodChange(method, e.target.checked)}
                        />
                        <span className="label-text text-sm flex-1 break-words">{method || 'Unknown'}</span>
                        <span className={`badge badge-sm flex-shrink-0 ${hasResults ? 'badge-outline' : 'badge-ghost'}`}>
                          {numeral(count).format('0,0')}
                        </span>
                      </label>
                    </div>
                  );
                })}

              </>
            )}
          </div>
        </div>
        )}
      </div>
      )}

      {/* Material Type Filter - only show for cores and if there are materials with results */}
      {search.types.includes('core') &&
       availableMaterialTypes.some(materialType => (materialCounts?.[materialType] || 0) > 0) && (
        <div className="form-control mb-4">
          <div className="label">
            <span className="label-text font-semibold flex items-center gap-2 cursor-pointer" onClick={() => toggleSection('materialTypes')}>
              <Icon name={collapsedSections.materialTypes ? "LuChevronRight" : "LuChevronDown"} size="xxs" />
              Material Type
            </span>
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
        </div>

        {!collapsedSections.materialTypes && (
        <div className="border rounded bg-base-100">
          {/* Scrollable filter list */}
          <div className="max-h-[200px] overflow-y-auto p-2">
            {materialsLoading ? (
              <div className="flex justify-center items-center py-4">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-sm">Loading materials...</span>
              </div>
            ) : availableMaterialTypes.length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No materials available
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
                          className="checkbox checkbox-sm flex-shrink-0"
                          checked={isSelected}
                          onChange={(e) => handleMaterialTypeChange(materialType, e.target.checked)}
                        />
                        <span className="label-text text-sm flex-1 break-words">{materialType || 'Unknown'}</span>
                        <span className={`badge badge-sm flex-shrink-0 ${hasResults ? 'badge-outline' : 'badge-ghost'}`}>
                          {numeral(count).format('0,0')}
                        </span>
                      </label>
                    </div>
                  );
                })}

              </>
            )}
          </div>
        </div>
        )}
      </div>
      )}

      {/* RV Name Filter - only show for cruises and if there are RV names with results */}
      {search.types.includes('cruise') &&
       availableRvNames.some(rvName => (rvNameCounts?.[rvName] || 0) > 0) && (
        <div className="form-control mb-4">
          <div className="label">
            <span className="label-text font-semibold flex items-center gap-2 cursor-pointer" onClick={() => toggleSection('rvNames')}>
              <Icon name={collapsedSections.rvNames ? "LuChevronRight" : "LuChevronDown"} size="xxs" />
              RV Name
            </span>
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
        </div>

        {!collapsedSections.rvNames && (
        <div className="border rounded bg-base-100">
          {/* Scrollable filter list */}
          <div className="max-h-[200px] overflow-y-auto p-2">
            {rvNamesLoading ? (
              <div className="flex justify-center items-center py-4">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-sm">Loading RV names...</span>
              </div>
            ) : availableRvNames.length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No RV names available
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
                          className="checkbox checkbox-sm flex-shrink-0"
                          checked={isSelected}
                          onChange={(e) => handleRvNameChange(rvName, e.target.checked)}
                        />
                        <span className="label-text text-sm flex-1 break-words">{rvName || 'Unknown'}</span>
                        <span className={`badge badge-sm flex-shrink-0 ${hasResults ? 'badge-outline' : 'badge-ghost'}`}>
                          {numeral(count).format('0,0')}
                        </span>
                      </label>
                    </div>
                  );
                })}

              </>
            )}
          </div>
        </div>
        )}
      </div>
      )}

      {/* Institution Filter - only show for cruises */}
      {search.types.includes('cruise') && (
        <div className="form-control mb-4">
          <div className="label">
            <span className="label-text font-semibold flex items-center gap-2 cursor-pointer" onClick={() => toggleSection('institutions')}>
              <Icon name={collapsedSections.institutions ? "LuChevronRight" : "LuChevronDown"} size="xxs" />
              Cruise PI
            </span>
            <div className="flex gap-1">
              <button
                className="btn btn-xs btn-ghost"
                onClick={toggleAllInstitutions}
                disabled={institutionsLoading}
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

        {!collapsedSections.institutions && (
        <div className="border rounded bg-base-100">
          {/* Scrollable filter list */}
          <div className="max-h-[200px] overflow-y-auto p-2">
            {institutionsLoading ? (
              <div className="flex justify-center items-center py-4">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-sm">Loading Cruise PIs...</span>
              </div>
            ) : availableInstitutions.length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No Cruise PIs available
              </div>
            ) : (
              <>
                {availableInstitutions.map((institution) => {
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
                        <span className="label-text text-sm flex-1 break-words">
                          <div>{institution || 'Unknown'}</div>
                          {piInstitution && <div className="text-xs text-gray-500">{piInstitution}</div>}
                        </span>
                        <span className={`badge badge-sm flex-shrink-0 ${hasResults ? 'badge-outline' : 'badge-ghost'}`}>
                          {numeral(count).format('0,0')}
                        </span>
                      </label>
                    </div>
                  );
                })}

              </>
            )}
          </div>
        </div>
        )}
      </div>
      )}

      {/* Area Filter - only show for dives/dredges */}
      {search.types.includes('dive') &&
       availableAreas.some(area => (areaCounts?.[area] || 0) > 0) && (
        <div className="form-control mb-4">
          <div className="label">
            <span className="label-text font-semibold flex items-center gap-2 cursor-pointer" onClick={() => toggleSection('areas')}>
              <Icon name={collapsedSections.areas ? "LuChevronRight" : "LuChevronDown"} size="xxs" />
              Area
            </span>
            <div className="flex gap-1">
              <button
                className="btn btn-xs btn-ghost"
                onClick={toggleAllAreas}
                disabled={areasLoading}
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

        {!collapsedSections.areas && (
        <div className="border rounded bg-base-100">
          {/* Scrollable filter list */}
          <div className="max-h-[200px] overflow-y-auto p-2">
            {areasLoading ? (
              <div className="flex justify-center items-center py-4">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-sm">Loading areas...</span>
              </div>
            ) : availableAreas.length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No areas available
              </div>
            ) : (
              <>
                {availableAreas.map((area) => {
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
                        <span className="label-text text-sm flex-1 break-words">{area || 'Unknown'}</span>
                        <span className={`badge badge-sm flex-shrink-0 ${hasResults ? 'badge-outline' : 'badge-ghost'}`}>
                          {numeral(count).format('0,0')}
                        </span>
                      </label>
                    </div>
                  );
                })}

              </>
            )}
          </div>
        </div>
        )}
      </div>
      )}

      {/* Texture Filter - only show for dives/rocks */}
      {search.types.some((type: string) => ['dive', 'diveSample'].includes(type)) &&
       availableTextures.some(texture => (textureCounts?.[texture] || 0) > 0) && (
        <div className="form-control mb-4">
          <div className="label">
            <span className="label-text font-semibold flex items-center gap-2 cursor-pointer" onClick={() => toggleSection('textures')}>
              <Icon name={collapsedSections.textures ? "LuChevronRight" : "LuChevronDown"} size="xxs" />
              Texture
            </span>
            <div className="flex gap-1">
              <button
                className="btn btn-xs btn-ghost"
                onClick={toggleAllTextures}
                disabled={texturesLoading}
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

        {!collapsedSections.textures && (
        <div className="border rounded bg-base-100">
          {/* Scrollable filter list */}
          <div className="max-h-[200px] overflow-y-auto p-2">
            {texturesLoading ? (
              <div className="flex justify-center items-center py-4">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-sm">Loading textures...</span>
              </div>
            ) : availableTextures.length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No textures available
              </div>
            ) : (
              <>
                {availableTextures.map((texture) => {
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
                        <span className="label-text text-sm flex-1 break-words">{texture || 'Unknown'}</span>
                        <span className={`badge badge-sm flex-shrink-0 ${hasResults ? 'badge-outline' : 'badge-ghost'}`}>
                          {numeral(count).format('0,0')}
                        </span>
                      </label>
                    </div>
                  );
                })}

              </>
            )}
          </div>
        </div>
        )}
      </div>
      )}

      {/* File Types Filter - show if there are file types with results or any selected */}
      {(availableFileTypes.some(fileType => (fileTypeCounts?.[fileType] || 0) > 0) || selectedFileTypes.length > 0) && (
        <div className="form-control mb-4">
          <div className="label">
            <span className="label-text font-semibold flex items-center gap-2 cursor-pointer" onClick={() => toggleSection('fileTypes')}>
              <Icon name={collapsedSections.fileTypes ? "LuChevronRight" : "LuChevronDown"} size="xxs" />
              File Types
            </span>
            <div className="flex gap-1">
              <button
                className="btn btn-xs btn-ghost"
                onClick={toggleAllFileTypes}
                disabled={fileTypesLoading}
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

          {!collapsedSections.fileTypes && (
          <div className="border rounded bg-base-100">
            {/* AND/OR Toggle - always visible at the top */}
            <div className="p-2 border-b border-gray-200 bg-gray-50">
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
            <div className="max-h-[200px] overflow-y-auto p-2">
              {fileTypesLoading ? (
                <div className="flex justify-center items-center py-4">
                  <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
                  <span className="ml-2 text-sm">Loading file types...</span>
                </div>
              ) : availableFileTypes.length === 0 ? (
                <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                  No file types available
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
                            className="checkbox checkbox-sm flex-shrink-0"
                            checked={isSelected}
                            onChange={(e) => handleFileTypeChange(fileType, e.target.checked)}
                          />
                          <span className="label-text text-sm flex-1 break-words">{getFileTypeLabel(fileType)}</span>
                          <span className={`badge badge-sm flex-shrink-0 ${hasResults ? 'badge-outline' : 'badge-ghost'}`}>
                            {numeral(count).format('0,0')}
                          </span>
                        </label>
                      </div>
                    );
                  })}
                  
                </>
              )}
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
}

export const Search: React.FC<{ data: any }> = ({
    data
}) => {
  const pageSize = 10;
  const router = useRouter();
  const viewRawData = false;  // = !process.env.VERCEL;
  	
  console.log("viewRawData", viewRawData);
  const [search, setSearch] = useLocalStorage('search-2025-08-06-v3', {
    sortOrder: 'alpha asc',
    searchString: '',
    types: ['cruise'],
    filters: {
      fileTypes: [], // Array of selected file types
      methods: [], // Array of selected collection methods
      materialTypes: [], // Array of selected material types
      rvNames: [], // Array of selected RV names
      institutions: [], // Array of selected institutions
    },
    filterLogic: {
      fileTypes: 'OR', // 'OR' or 'AND'
      methods: 'OR',
      materialTypes: 'OR',
      rvNames: 'OR',
      institutions: 'OR',
    }
  });
  const [searchString, setSearchString] = useState(search.searchString || '');
  const [expandedRawData, setExpandedRawData] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(true);
  const [hasProcessedUrlParam, setHasProcessedUrlParam] = useState(false);
  const [showLandingModal, setShowLandingModal] = useState(false);
  const [osuId, setOsuId] = useState<string>('');
  const [currentDoc, setCurrentDoc] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    },
    staleTime: 1000, // Keep data fresh for 1 second
    placeholderData: (previousData) => previousData, // Keep previous data while loading new
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

  const openLandingModal = (osuid: string) => {
    setOsuId(osuid);
    setShowLandingModal(true);
  };

  // Hook to fetch core data by UUID for breadcrumbs
  const useCoreData = (coreUUID: string | null) => {
    return useQuery({
      queryKey: ['coreForBreadcrumb', coreUUID],
      queryFn: async () => {
        if (!coreUUID) return null;

        const payload = {
          types: ['core'],
          terms: {
            "_coreUUID.keyword": [coreUUID],
          },
        };
        const res = await fetch('/api/opensearch?search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errorresults = await res.json();
          throw new Error(errorresults.message || 'Failed to fetch core');
        }
        const results = await res.json();
        return results?.hits?.hits?.[0]?._source || null;
      },
      enabled: !!coreUUID,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
  };

  // Hook to fetch dive/dredge data by UUID for breadcrumbs
  const useDiveData = (diveUUID: string | null) => {
    return useQuery({
      queryKey: ['diveForBreadcrumb', diveUUID],
      queryFn: async () => {
        if (!diveUUID) return null;

        const payload = {
          types: ['dive'],
          terms: {
            "_diveUUID.keyword": [diveUUID],
          },
        };
        const res = await fetch('/api/opensearch?search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errorresults = await res.json();
          throw new Error(errorresults.message || 'Failed to fetch dive');
        }
        const results = await res.json();
        return results?.hits?.hits?.[0]?._source || null;
      },
      enabled: !!diveUUID,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
  };

  // Breadcrumb component for modal header
  const Breadcrumbs: React.FC<{ doc: any }> = ({ doc }) => {
    if (!doc || !doc._docType) return <span>{osuId}</span>;

    // Fetch core data if this is a section/sectionHalf and has _coreUUID
    const { data: coreData } = useCoreData(
      (doc._docType === 'section' || doc._docType === 'sectionHalf') && doc._coreUUID
        ? doc._coreUUID
        : null
    );

    // Fetch dive/dredge data if this is a diveSample (rock) and has _diveUUID
    const { data: diveData } = useDiveData(
      doc._docType === 'diveSample' && doc._diveUUID
        ? doc._diveUUID
        : null
    );

    const breadcrumbs = [];

    // Build breadcrumb hierarchy based on document type
    if (doc._docType === 'sectionHalf' || doc._docType === 'section') {
      // Cruise -> Core -> Section/SectionHalf (hierarchical order)
      if (doc._cruiseID) {
        breadcrumbs.push({
          label: `OSU-${doc._cruiseID}`,
          osuid: `OSU-${doc._cruiseID}`,
          type: 'cruise'
        });
      }
      // Use fetched core data instead of doc._coreID
      if (coreData && coreData._osuid) {
        breadcrumbs.push({
          label: coreData._osuid,
          osuid: coreData._osuid,
          type: 'core'
        });
      }
      breadcrumbs.push({
        label: doc._osuid || osuId,
        osuid: doc._osuid || osuId,
        type: doc._docType,
        current: true
      });
    } else if (doc._docType === 'core') {
      // Core -> Cruise
      if (doc._cruiseID) {
        breadcrumbs.push({
          label: `OSU-${doc._cruiseID}`,
          osuid: `OSU-${doc._cruiseID}`,
          type: 'cruise'
        });
      }
      breadcrumbs.push({
        label: doc._osuid || osuId,
        osuid: doc._osuid || osuId,
        type: 'core',
        current: true
      });
    } else if (doc._docType === 'dive') {
      // Dive -> Cruise
      if (doc._cruiseID) {
        breadcrumbs.push({
          label: `OSU-${doc._cruiseID}`,
          osuid: `OSU-${doc._cruiseID}`,
          type: 'cruise'
        });
      }
      breadcrumbs.push({
        label: doc._osuid || osuId,
        osuid: doc._osuid || osuId,
        type: 'dive',
        current: true
      });
    } else if (doc._docType === 'diveSample') {
      // Rock -> Dive/Dredge -> Cruise
      if (doc._cruiseID) {
        breadcrumbs.push({
          label: `OSU-${doc._cruiseID}`,
          osuid: `OSU-${doc._cruiseID}`,
          type: 'cruise'
        });
      }
      // Use fetched dive/dredge data
      if (diveData && diveData._osuid) {
        breadcrumbs.push({
          label: diveData._osuid,
          osuid: diveData._osuid,
          type: 'dive'
        });
      }
      breadcrumbs.push({
        label: doc._osuid || osuId,
        osuid: doc._osuid || osuId,
        type: 'diveSample',
        current: true
      });
    } else {
      // Cruise or unknown - just show current
      breadcrumbs.push({
        label: doc._osuid || osuId,
        osuid: doc._osuid || osuId,
        type: doc._docType || 'unknown',
        current: true
      });
    }

    return (
      <div className="breadcrumbs text-lg">
        <ul>
          {breadcrumbs.map((crumb, index) => (
            <li key={index}>
              {crumb.current ? (
                <span className="font-semibold">{crumb.label}</span>
              ) : (
                <button
                  onClick={() => openLandingModal(crumb.osuid)}
                  className="text-primary hover:text-primary-focus hover:underline"
                >
                  {crumb.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  useEffect(() => {
    if (isVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle URL query parameters on component mount
  useEffect(() => {
    if (router.isReady && !hasProcessedUrlParam) {
      // Handle text parameter for direct search
      if (router.query.text) {
        const textParam = Array.isArray(router.query.text) ? router.query.text[0] : router.query.text;
        if (textParam) {
          console.log('Processing text URL parameter:', textParam);
          setSearchString(textParam);
          setSearch(prevSearch => ({ 
            ...prevSearch, 
            searchString: textParam,
            filters: {
              fileTypes: [],
              methods: [],
              materialTypes: [],
              rvNames: [],
            },
            filterLogic: {
              fileTypes: 'OR',
              methods: 'OR',
              materialTypes: 'OR',
              rvNames: 'OR',
            }
          }));
          setHasProcessedUrlParam(true);
          router.replace('/search', undefined, { shallow: true });
        }
      }
      // Handle OSU ID parameter for modal
      else if (router.query.osu) {
        const osuParam = Array.isArray(router.query.osu) ? router.query.osu[0] : router.query.osu;
        if (osuParam) {
          console.log('Processing OSU URL parameter:', osuParam);
          setOsuId(osuParam);
          setSearchString(osuParam);
          setShowLandingModal(true);
          setSearch(prevSearch => ({ 
            ...prevSearch, 
            searchString: osuParam,
            filters: {
              fileTypes: [],
              methods: [],
              materialTypes: [],
              rvNames: [],
            },
            filterLogic: {
              fileTypes: 'OR',
              methods: 'OR',
              materialTypes: 'OR',
              rvNames: 'OR',
            }
          }));
          setHasProcessedUrlParam(true);
          router.replace('/search', undefined, { shallow: true });
        }
      }
    }
  }, [router.isReady, router.query.text, router.query.osu, hasProcessedUrlParam, setSearch, router]);

  // Helper function to toggle sorting (three-way: asc -> desc -> none -> asc)
  const toggleSort = (sortType: string) => {
    const currentOrder = search.sortOrder;
    let newOrder: string;

    if (currentOrder === `${sortType} asc`) {
      newOrder = `${sortType} desc`;
    } else if (currentOrder === `${sortType} desc`) {
      newOrder = 'ids asc'; // Reset to default sort
    } else {
      newOrder = `${sortType} asc`;
    }

    setSearch({ ...search, sortOrder: newOrder });
  };

  // Helper function to get sort icon
  const getSortIcon = (sortType: string) => {
    const currentOrder = search.sortOrder;
    if (currentOrder === `${sortType} asc`) {
      return <Icon name="LuChevronUp" size="xxs" className="inline ml-1 align-text-bottom" />;
    } else if (currentOrder === `${sortType} desc`) {
      return <Icon name="LuChevronDown" size="xxs" className="inline ml-1 align-text-bottom" />;
    }
    // Show disabled up/down chevrons for sortable columns
    return (
      <span className="inline opacity-30">
        <Icon name="LuChevronsUpDown" size="xxs" className="inline ml-1 align-text-bottom" />
      </span>
    );
  };
  
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
            <DownloadFilesButton
              search={search}
              searchString={searchString}
              moratoriumCruises={moratoriumCruises}
            />
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          {/* Left Sidebar - Filters and Active Filters */}
          <div className="w-[320px] flex-shrink-0 flex flex-col gap-4">
            {/* Filter Panel - conditionally shown */}
            {showFilters && (
              <FilterPanel 
                search={search} 
                setSearch={setSearch} 
                onToggle={() => setShowFilters(false)}
              />
            )}
            
            {/* Show Filters Button - shown when filters are hidden */}
            {!showFilters && (
              <button
                className="btn btn-primary btn-sm flex flex-col gap-1 h-auto py-2 px-2"
                onClick={() => setShowFilters(true)}
                title="Show filters panel"
              >
                <Icon name="LuFilter" size="xs" />
                <span className="badge bg-white text-primary font-bold min-h-0 h-auto">
                  {[
                    (search.filters?.fileTypes || []).length > 0,
                    (search.filters?.methods || []).length > 0,
                    (search.filters?.materialTypes || []).length > 0,
                    (search.filters?.rvNames || []).length > 0
                  ].filter(Boolean).length}
                </span>
              </button>
            )}
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 min-h-[500px]">
            
        {/* Responsive tabs - full tabs on large screens, dropdown on small */}
        <div className="mb-2">
          {/* Desktop tabs - hidden on small screens */}
          <div className="hidden 2xl:flex tabs min-w-full px-0">
            <SearchTab
              label="Cruises"
              isActive={search.types.includes('cruise')}
              onClick={() => setSearch({ ...search, types: ['cruise'] })}
              type="cruise"
              searchString={search.searchString}
              filters={search.filters}
              filterLogic={search.filterLogic}
            />
            <div className="tab tab-lg tab-bordered px-2"></div> 
            <SearchTab
              label="Cores"
              isActive={search.types.includes('core')}
              onClick={() => setSearch({ ...search, types: ['core'] })}
              type="core"
              searchString={search.searchString}
              filters={search.filters}
              filterLogic={search.filterLogic}
            />
            <div className="tab tab-lg tab-bordered px-2"></div> 
            <SearchTab
              label="Sections"
              isActive={search.types.includes('section')}
              onClick={() => setSearch({ ...search, types: ['section'] })}
              type="section"
              searchString={search.searchString}
              filters={search.filters}
              filterLogic={search.filterLogic}
            />
            {process.env.NEXT_PUBLIC_DEPLOYMENT !== 'production' && (
              <>
                <div className="tab tab-lg tab-bordered px-2"></div> 
                <SearchTab
                  label="Section Halves"
                  isActive={search.types.includes('sectionHalf')}
                  onClick={() => setSearch({ ...search, types: ['sectionHalf'] })}
                  type="sectionHalf"
                  searchString={search.searchString}
                  filters={search.filters}
                  filterLogic={search.filterLogic}
                />
                <div className="tab tab-lg tab-bordered px-2"></div>
              </>
            )} 
            <SearchTab
              label="Dredges/Dives"
              isActive={search.types.includes('dive')}
              onClick={() => setSearch({ ...search, types: ['dive'] })}
              type="dive"
              searchString={search.searchString}
              filters={search.filters}
              filterLogic={search.filterLogic}
            />
            <div className="tab tab-lg tab-bordered px-2"></div> 
            <SearchTab
              label="Rocks"
              isActive={search.types.includes('diveSample')}
              onClick={() => setSearch({ ...search, types: ['diveSample'] })}
              type="diveSample"
              searchString={search.searchString}
              filters={search.filters}
              filterLogic={search.filterLogic}
            />
            <div className="tab tab-lg tab-bordered flex-grow"></div>  
          </div>

          {/* Mobile menu - shown on small screens */}
          <div className="2xl:hidden relative tabs min-w-full px-0">
            <button
              className="tab tab-lg tab-bordered tab-active text-primary justify-between no-animation px-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="flex items-center gap-2 mr-2">
                <b>
                  {(() => {
                    if (search.types.includes('cruise')) return 'Cruises';
                    if (search.types.includes('core')) return 'Cores';
                    if (search.types.includes('section')) return 'Sections';
                    if (process.env.NEXT_PUBLIC_DEPLOYMENT !== 'production' && search.types.includes('sectionHalf')) return 'Section Halves';
                    if (search.types.includes('dive')) return 'Dredges/Dives';
                    if (search.types.includes('diveSample')) return 'Rocks';
                    return 'Select Type';
                  })()}
                </b>
                <span className="badge badge-primary badge-md">
                  <ItemsCount
                    searchString={search.searchString}
                    types={search.types}
                    filters={search.filters}
                    filterLogic={search.filterLogic}
                    singularLabel=""
                    pluralLabel=""
                  />
                </span>
              </div>
              <Icon name={isMenuOpen ? "LuChevronUp" : "LuChevronDown"} size="xxs" />
            </button> 
            <div className="tab tab-lg tab-bordered flex-grow" onClick={() => setIsMenuOpen(!isMenuOpen)}></div>

            {isMenuOpen && (
              <ul className="menu bg-base-100 rounded-box z-30 min-w-[300px] p-1 shadow border absolute top-full mt-1 left-0">
                <li>
                  <div
                    onClick={() => {
                      setSearch({ ...search, types: ['cruise'] });
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center justify-between ${search.types.includes('cruise') ? 'active' : ''}`}
                  >
                    <span>Cruises</span>
                    <span className="badge badge-sm badge-outline">
                      <ItemsCount
                        searchString={search.searchString}
                        types={['cruise']}
                        filters={search.filters}
                        filterLogic={search.filterLogic}
                        singularLabel=""
                        pluralLabel=""
                      />
                    </span>
                  </div>
                </li>
                <li>
                  <div 
                    onClick={() => {
                      setSearch({ ...search, types: ['core'] });
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center justify-between ${search.types.includes('core') ? 'active' : ''}`}
                  >
                    <span>Cores</span>
                    <span className="badge badge-sm badge-outline">
                      <ItemsCount
                        searchString={search.searchString}
                        types={['core']}
                        filters={search.filters}
                        filterLogic={search.filterLogic}
                        singularLabel=""
                        pluralLabel=""
                      />
                    </span>
                  </div>
                </li>
                <li>
                  <div 
                    onClick={() => {
                      setSearch({ ...search, types: ['section'] });
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center justify-between ${search.types.includes('section') ? 'active' : ''}`}
                  >
                    <span>Sections</span>
                    <span className="badge badge-sm badge-outline">
                      <ItemsCount
                        searchString={search.searchString}
                        types={['section']}
                        filters={search.filters}
                        filterLogic={search.filterLogic}
                        singularLabel=""
                        pluralLabel=""
                      />
                    </span>
                  </div>
                </li>
                {process.env.NEXT_PUBLIC_DEPLOYMENT !== 'production' && (
                  <li>
                    <div
                      onClick={() => {
                        setSearch({ ...search, types: ['sectionHalf'] });
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center justify-between ${search.types.includes('sectionHalf') ? 'active' : ''}`}
                    >
                      <span>Section Halves</span>
                      <span className="badge badge-sm badge-outline">
                        <ItemsCount
                          searchString={search.searchString}
                          types={['sectionHalf']}
                          filters={search.filters}
                          filterLogic={search.filterLogic}
                          singularLabel=""
                          pluralLabel=""
                        />
                      </span>
                    </div>
                  </li>
                )}
                <li>
                  <div
                    onClick={() => {
                      setSearch({ ...search, types: ['dive'] });
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center justify-between ${search.types.includes('dive') ? 'active' : ''}`}
                  >
                    <span>Dredges/Dives</span>
                    <span className="badge badge-sm badge-outline">
                      <ItemsCount
                        searchString={search.searchString}
                        types={['dive']}
                        filters={search.filters}
                        filterLogic={search.filterLogic}
                        singularLabel=""
                        pluralLabel=""
                      />
                    </span>
                  </div>
                </li>
                <li>
                  <div
                    onClick={() => {
                      setSearch({ ...search, types: ['diveSample'] });
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center justify-between ${search.types.includes('diveSample') ? 'active' : ''}`}
                  >
                    <span>Rocks</span>
                    <span className="badge badge-sm badge-outline">
                      <ItemsCount
                        searchString={search.searchString}
                        types={['diveSample']}
                        filters={search.filters}
                        filterLogic={search.filterLogic}
                        singularLabel=""
                        pluralLabel=""
                      />
                    </span>
                  </div>
                </li>
              </ul>
            )}
          </div>
        </div>
          {search.types.includes('cruise') &&
            <table className="table table-compact w-full mt-0">
              <thead>
                <tr>
                  <th 
                    className="rounded-none cursor-pointer hover:bg-base-200" 
                    onClick={() => toggleSort('alpha')}
                  >
                    Cruise {getSortIcon('alpha')}
                  </th> 
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span
                        className="cursor-pointer hover:bg-base-200"
                        onClick={() => toggleSort('rvName')}
                      >
                        RV Name {getSortIcon('rvName')}
                      </span>
                      <RvNameFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Cruise PI</span>
                      <InstitutionFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Files</span>
                      <FileTypesFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                </tr>
              </thead> 
              <tbody>
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No matching cruises found
                    </td>
                  </tr>
                ) : (
                matches.map((match, key) => (
                  <>
                    <tr key={key} className="hover cursor-pointer" onClick={() => {
                      openLandingModal(match._source._osuid);
                    }}>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        <b>{match._source._osuid}</b>
                        {moratoriumCruises.some(cruise => match._source._osuid.startsWith(cruise)) && <div><span className="badge btn-primary">Moratorium</span></div>}
                        {r2rCruiseLinks[match._source._osuid] && (
                          <div className="mt-1 flex flex-row flex-wrap gap-1">
                            {r2rCruiseLinks[match._source._osuid].map((link: string, idx: number) => (
                              <a 
                                key={idx}
                                href={link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="badge badge-primary hover:badge-primary-focus no-underline flex items-center gap-1"
                              >
                                R2R
                                <Icon name="BiLinkExternal" size="xxs" />
                                <span className="font-normal">{link.split('/').pop()}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">{match._source.rvName}</td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {match._source.pi && <><b>{match._source.pi}</b><br/></>}
                        {match._source.piInstitution && <>{match._source.piInstitution}<br/></>}
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {(() => {
                          if (!match._source._files || match._source._files.length === 0) {
                            return <span className="text-gray-500 text-sm">No files</span>;
                          }

                          // Group files by type and count them
                          const fileTypeCounts: { [key: string]: number } = {};
                          const moratoriumFileCounts: { [key: string]: number } = {};

                          match._source._files.forEach((file: any) => {
                            if (hasFileTypeLabel(file.type)) {
                              fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
                            } else {
                              // Unlabeled files are moratorium files
                              moratoriumFileCounts[file.type] = (moratoriumFileCounts[file.type] || 0) + 1;
                            }
                          });

                          const displayableFiles = Object.entries(fileTypeCounts);

                          if (displayableFiles.length === 0 && Object.keys(moratoriumFileCounts).length === 0) {
                            return <span className="text-gray-500 text-sm">No files</span>;
                          }

                          return (
                            <div className="flex flex-col gap-1">
                              {displayableFiles.map(([fileType, count]) => {
                                const moratoriumCount = moratoriumFileCounts[fileType] || 0;
                                return (
                                  <div key={fileType} className="text-sm">
                                    <span className="font-bold">{getFileTypeLabel(fileType)}:</span> {count}
                                    {moratoriumCount > 0 && <span className="text-gray-500"> ({moratoriumCount} under moratorium)</span>}
                                  </div>
                                );
                              })}
                              {Object.entries(moratoriumFileCounts).filter(([type]) => !fileTypeCounts[type]).map(([fileType, count]) => (
                                <div key={fileType} className="text-sm">
                                  <span className="font-bold">{getFileTypeLabel(fileType)}:</span> <span className="text-gray-500">({count} under moratorium)</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                    {viewRawData &&
                      <tr key={`${key}-rawresults`}>
                        <td colSpan={4}>
                          <button 
                            className="btn btn-xs btn-ghost mb-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRawData(`cruise-${key}`);
                            }}
                          >
                            <Icon name={expandedRawData.has(`cruise-${key}`) ? "LuChevronUp" : "LuChevronDown"} size="xxs" className="mr-1" />
                            Raw Data
                          </button>
                          {expandedRawData.has(`cruise-${key}`) && (
                            <pre><code className="flex flex-col gap-2">
                              Index: {match._index || 'osu-mgr'}{'\n'}
                              {JSON.stringify(match._source, null, 2)}
                            </code></pre>
                          )}
                        </td>
                      </tr>
                    }
                  </>
                )) 
                )}
              </tbody>
            </table>
          }
          {search.types.includes('core') &&
            <table className="table table-compact w-full mt-0">
              <thead>
                <tr>
                  <th
                    className="rounded-none cursor-pointer hover:bg-base-200"
                    onClick={() => toggleSort('alpha')}
                  >
                    Core {getSortIcon('alpha')}
                  </th>
                  <th className="rounded-none">Size</th>
                  <th
                    className="rounded-none cursor-pointer hover:bg-base-200"
                    onClick={() => toggleSort('depth')}
                  >
                    Depth {getSortIcon('depth')}
                  </th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Collection</span>
                      <CollectionFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                  <th
                    className="rounded-none cursor-pointer hover:bg-base-200"
                    onClick={() => toggleSort('modified')}
                  >
                    Date Time {getSortIcon('modified')}
                  </th>
                  <th className="rounded-none">Location</th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Files</span>
                      <FileTypesFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                </tr>
              </thead> 
              <tbody>
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No matching cores found
                    </td>
                  </tr>
                ) : (
                matches.map((match, key) => (
                  <>
                    <tr key={key} className="hover cursor-pointer" onClick={() => {
                      openLandingModal(match._source._osuid);
                    }}>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        <b>{match._source._osuid}</b>
                        {match._source.nSections != null && <><br/><b>Sections:</b> {numeral(match._source.nSections).format(0)}</>}
                        {moratoriumCruises.some(cruise => match._source._osuid.startsWith(cruise)) && <div><span className="badge btn-primary">Moratorium</span></div>}
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {match._source.length != null && <><b>Length:</b><br/>{numeral(match._source.length).format(0.00)} cm<br /></>}
                        {match._source.diameter != null && <><b>Diameter:</b><br/>{numeral(match._source.diameter).format(0.00)} cm<br /></>}
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {(match._source.waterDepthStart != null || match._source.waterDepthEnd != null) &&
                          <>
                            <b>Water Depth:</b><br />
                            {match._source.waterDepthStart && numeral(match._source.waterDepthStart).format(0.00) || ""} {match._source.waterDepthStart && match._source.waterDepthEnd && match._source.waterDepthStart !== match._source.waterDepthEnd && "-" || ""} {match._source.waterDepthEnd && match._source.waterDepthStart !== match._source.waterDepthEnd && numeral(match._source.waterDepthEnd).format(0.00) || ""} m<br />
                          </>
                        }
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {match._source.method != null && <><b>Method:</b><br/>{match._source.method}<br/></>}
                        {match._source.material != null && <><b>Material:</b><br/>{match._source.material}<br /></>}
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {(() => {
                          const sd = match._source.startDate ? new Date(match._source.startDate) : null;
                          const st = match._source.startTime ? new Date(match._source.startTime) : null;
                          const ed = match._source.endDate ? new Date(match._source.endDate) : null;
                          const et = match._source.endTime ? new Date(match._source.endTime) : null;
                          const d = match._source.date ? new Date(match._source.date) : null;
                          const t = match._source.time ? new Date(match._source.time) : null;

                          const formatDate = (dt: Date | null) => dt ? dt.toLocaleDateString() : '';
                          const formatTime = (dt: Date | null) => dt ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                          if (sd || st || ed || et) {
                            const startDate = formatDate(sd);
                            const startTime = formatTime(st);
                            const endDate = formatDate(ed);
                            const endTime = formatTime(et);
                            const showEndDate = endDate && endDate !== startDate;
                            const showEndTime = endTime && endTime !== startTime;
                            return (
                              <>
                                {startDate && <><b>Date:</b><br/>{startDate}<br/></>}
                                {showEndDate && <><b>End Date:</b><br/>{endDate}<br/></>}
                                {(startTime || showEndTime) && (
                                  <>
                                    <b>Time:</b><br/>
                                    {startTime}
                                    {showEndTime && <> to {endTime}</>}
                                    <br/>
                                  </>
                                )}
                              </>
                            );
                          }
                          if (d || t) {
                            return (
                              <>
                                {d && <><b>Date:</b><br/>{formatDate(d)}<br/></>}
                                {t && <><b>Time:</b><br/>{formatTime(t)}<br/></>}
                              </>
                            );
                          }
                          return <span className="text-gray-500">—</span>;
                        })()}
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        <div className="flex flex-row gap-2">
                          <CollectionMapThumbnail
                            lat={match._source.latitudeStart || match._source.latitudeEnd}
                            lon={match._source.longitudeStart || match._source.longitudeEnd}
                          />
                          <div className="overflow-hidden">
                            {(match._source.latitudeStart != null || match._source.latitudeEnd != null) &&
                            <div className="truncate">
                              <b>Latitude:</b><br/>
                              {match._source.latitudeStart != null && numeral(match._source.latitudeStart).format('0.0000')}
                              {match._source.latitudeStart != null && match._source.latitudeEnd != null && match._source.latitudeStart !== match._source.latitudeEnd && ' to '}
                              {match._source.latitudeEnd != null && match._source.latitudeStart !== match._source.latitudeEnd && numeral(match._source.latitudeEnd).format('0.0000')}
                            </div>}
                            {(match._source.longitudeStart != null || match._source.longitudeEnd != null) &&
                            <div className="truncate">
                              <b>Longitude:</b><br/>
                              {match._source.longitudeStart != null && numeral(match._source.longitudeStart).format('0.0000')}
                              {match._source.longitudeStart != null && match._source.longitudeEnd != null && match._source.longitudeStart !== match._source.longitudeEnd && ' to '}
                              {match._source.longitudeEnd != null && match._source.longitudeStart !== match._source.longitudeEnd && numeral(match._source.longitudeEnd).format('0.0000')}
                            </div>}
                          </div>
                        </div>
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {(() => {
                          if (!match._source._files || match._source._files.length === 0) {
                            return <span className="text-gray-500 text-sm">No files</span>;
                          }

                          // Group files by type and count them
                          const fileTypeCounts: { [key: string]: number } = {};
                          const moratoriumFileCounts: { [key: string]: number } = {};

                          match._source._files.forEach((file: any) => {
                            if (hasFileTypeLabel(file.type)) {
                              fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
                            } else {
                              // Unlabeled files are moratorium files
                              moratoriumFileCounts[file.type] = (moratoriumFileCounts[file.type] || 0) + 1;
                            }
                          });

                          const displayableFiles = Object.entries(fileTypeCounts);

                          if (displayableFiles.length === 0 && Object.keys(moratoriumFileCounts).length === 0) {
                            return <span className="text-gray-500 text-sm">No files</span>;
                          }

                          return (
                            <div className="flex flex-col gap-1">
                              {displayableFiles.map(([fileType, count]) => {
                                const moratoriumCount = moratoriumFileCounts[fileType] || 0;
                                return (
                                  <div key={fileType} className="text-sm">
                                    <span className="font-bold">{getFileTypeLabel(fileType)}:</span> {count}
                                    {moratoriumCount > 0 && <span className="text-gray-500"> ({moratoriumCount} under moratorium)</span>}
                                  </div>
                                );
                              })}
                              {Object.entries(moratoriumFileCounts).filter(([type]) => !fileTypeCounts[type]).map(([fileType, count]) => (
                                <div key={fileType} className="text-sm">
                                  <span className="font-bold">{getFileTypeLabel(fileType)}:</span> <span className="text-gray-500">({count} under moratorium)</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                    { viewRawData &&
                      <tr key={`${key}-raw`}>
                        <td colSpan={7}>
                          <button
                            className="btn btn-xs btn-ghost mb-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRawData(`core-${key}`);
                            }}
                          >
                            <Icon name={expandedRawData.has(`core-${key}`) ? "LuChevronUp" : "LuChevronDown"} size="xxs" className="mr-1" />
                            Raw Data
                          </button>
                          {expandedRawData.has(`core-${key}`) && (
                            <pre><code className="flex flex-col gap-2">
                              Index: {match._index || 'osu-mgr'}{'\n'}
                              {JSON.stringify(match._source, null, 2)}
                            </code></pre>
                          )}
                        </td>
                      </tr>
                    }
                  </>
                )) 
                )}
              </tbody>
            </table>
          }
          {search.types.includes('section') &&
            <table className="table table-compact w-full mt-0">
              <thead>
                <tr>
                  <th 
                    className="rounded-none cursor-pointer hover:bg-base-200" 
                    onClick={() => toggleSort('alpha')}
                  >
                    Section {getSortIcon('alpha')}
                  </th>
                  <th 
                    className="rounded-none cursor-pointer hover:bg-base-200" 
                    onClick={() => toggleSort('depth')}
                  >
                    Size {getSortIcon('depth')}
                  </th>
                  <th
                    className="rounded-none cursor-pointer hover:bg-base-200"
                    onClick={() => toggleSort('depth')}
                  >
                    Depth {getSortIcon('depth')}
                  </th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Files</span>
                      <FileTypesFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No matching sections found
                    </td>
                  </tr>
                ) : (
                matches.map((match, key) => (
                  <>
                    <tr key={key} className="hover cursor-pointer" onClick={() => {
                      openLandingModal(match._source._osuid);
                    }}>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        <b>{match._source._osuid}</b>
                        {match._source.nSections != null && <><br/><b>Sections:</b> {numeral(match._source.nSections).format(0)}</>}
                        {moratoriumCruises.some(cruise => match._source._osuid.startsWith(cruise)) && <div><span className="badge btn-primary">Moratorium</span></div>}
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {match._source.depthTop != null && match._source.depthBottom != null &&
                          <>
                            <b>Length:</b><br />
                            {numeral(parseFloat(match._source.depthBottom) - parseFloat(match._source.depthTop)).format(0.00)} cm<br />
                          </>
                        }
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {(match._source.depthTop != null || match._source.depthBottom != null) &&
                          <>
                            <b>Core Depth:</b><br />
                            {match._source.depthTop && numeral(match._source.depthTop).format(0.00) || ""} {match._source.depthTop && match._source.depthBottom && "-" || ""} {match._source.depthBottom && numeral(match._source.depthBottom).format(0.00) || ""} cm<br />
                          </>
                        }
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {(() => {
                          if (!match._source._files || match._source._files.length === 0) {
                            return <span className="text-gray-500 text-sm">No files</span>;
                          }

                          // Group files by type and count them
                          const fileTypeCounts: { [key: string]: number } = {};
                          const moratoriumFileCounts: { [key: string]: number } = {};

                          match._source._files.forEach((file: any) => {
                            if (hasFileTypeLabel(file.type)) {
                              fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
                            } else {
                              // Unlabeled files are moratorium files
                              moratoriumFileCounts[file.type] = (moratoriumFileCounts[file.type] || 0) + 1;
                            }
                          });

                          const displayableFiles = Object.entries(fileTypeCounts);

                          if (displayableFiles.length === 0 && Object.keys(moratoriumFileCounts).length === 0) {
                            return <span className="text-gray-500 text-sm">No files</span>;
                          }

                          return (
                            <div className="flex flex-col gap-1">
                              {displayableFiles.map(([fileType, count]) => {
                                const moratoriumCount = moratoriumFileCounts[fileType] || 0;
                                return (
                                  <div key={fileType} className="text-sm">
                                    <span className="font-bold">{getFileTypeLabel(fileType)}:</span> {count}
                                    {moratoriumCount > 0 && <span className="text-gray-500"> ({moratoriumCount} under moratorium)</span>}
                                  </div>
                                );
                              })}
                              {Object.entries(moratoriumFileCounts).filter(([type]) => !fileTypeCounts[type]).map(([fileType, count]) => (
                                <div key={fileType} className="text-sm">
                                  <span className="font-bold">{getFileTypeLabel(fileType)}:</span> <span className="text-gray-500">({count} under moratorium)</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                    { viewRawData &&
                      <tr key={`${key}-raw`}>
                        <td colSpan={4}>
                          <button
                            className="btn btn-xs btn-ghost mb-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRawData(`section-${key}`);
                            }}
                          >
                            <Icon name={expandedRawData.has(`section-${key}`) ? "LuChevronUp" : "LuChevronDown"} size="xxs" className="mr-1" />
                            Raw Data
                          </button>
                          {expandedRawData.has(`section-${key}`) && (
                            <pre><code className="flex flex-col gap-2">
                              Index: {match._index || 'osu-mgr'}{'\n'}
                              {JSON.stringify(match._source, null, 2)}
                            </code></pre>
                          )}
                        </td>
                      </tr>
                    }
                  </>
                )) 
                )}
              </tbody>
            </table>
          }
          {search.types.includes('sectionHalf') &&
            <table className="table table-compact w-full mt-0">
              <thead>
                <tr>
                  <th
                    className="rounded-none cursor-pointer hover:bg-base-200"
                    onClick={() => toggleSort('alpha')}
                  >
                    Section Half {getSortIcon('alpha')}
                  </th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Files</span>
                      <FileTypesFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                  {matches.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center py-8 text-gray-500">
                        No matching section halves found
                      </td>
                    </tr>
                  ) : (
                    matches.map((match, key) => (
                      <>
                        <tr key={key} className="hover cursor-pointer" onClick={() => {
                          openLandingModal(match._source._osuid);
                        }}>
                          <td className="align-top overflow-hidden text-ellipsis max-w-0">
                            <b>{match._source._osuid}</b>
                            {match._source.nSections != null && <><br /><b>Sections:</b> {numeral(match._source.nSections).format(0)}</>}
                            {moratoriumCruises.some(cruise => match._source._osuid.startsWith(cruise)) && <div><span className="badge btn-primary">Moratorium</span></div>}
                          </td>
                          <td className="align-top overflow-hidden text-ellipsis max-w-0">
                            {(() => {
                              if (!match._source._files || match._source._files.length === 0) {
                                return <span className="text-gray-500 text-sm">No files</span>;
                              }

                              // Group files by type and count them
                              const fileTypeCounts: { [key: string]: number } = {};
                              match._source._files.forEach((file: any) => {
                                fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
                              });

                              const displayableFiles = Object.entries(fileTypeCounts)
                                .filter(([fileType]) => hasFileTypeLabel(fileType));

                              if (displayableFiles.length === 0) {
                                return <span className="text-gray-500 text-sm">No files</span>;
                              }

                              return (
                                <div className="flex flex-col gap-1">
                                  {displayableFiles.map(([fileType, count]) => (
                                    <div key={fileType} className="text-sm">
                                      <span className="font-bold">{getFileTypeLabel(fileType)}:</span> {count}
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </td>
                        </tr>
                        {viewRawData &&
                          <tr key={`${key}-raw`}>
                            <td colSpan={2}>
                              <button
                                className="btn btn-xs btn-ghost mb-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRawData(`sectionHalf-${key}`);
                                }}
                              >
                                <Icon name={expandedRawData.has(`sectionHalf-${key}`) ? "LuChevronUp" : "LuChevronDown"} size="xxs" className="mr-1" />
                                Raw Data
                              </button>
                              {expandedRawData.has(`sectionHalf-${key}`) && (
                                <pre><code className="flex flex-col gap-2">
                                  {JSON.stringify(match._source, null, 2)}
                                </code></pre>
                              )}
                            </td>
                          </tr>
                        }
                      </>
                    )))}
              </tbody>
            </table>
          }
          {matches.length > 0 && search.types.includes('dive') &&
            <table className="table table-compact w-full mt-0">
              <thead>
                <tr>
                  <th 
                    className="rounded-none cursor-pointer hover:bg-base-200" 
                    onClick={() => toggleSort('alpha')}
                  >
                    Rock {getSortIcon('alpha')}
                  </th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span
                        className="cursor-pointer hover:bg-base-200"
                        onClick={() => toggleSort('method')}
                      >
                        Collection {getSortIcon('method')}
                      </span>
                      <CollectionFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span
                        className="cursor-pointer hover:text-primary"
                        onClick={() => toggleSort('area')}
                      >
                        Area {getSortIcon('area')}
                      </span>
                      <AreaFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Files</span>
                      <FileTypesFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                </tr>
              </thead> 
              <tbody>
                  {matches.map((match, key) => (
                  <>
                    <tr key={key} className="hover cursor-pointer" onClick={() => {
                      openLandingModal(match._source._osuid);
                    }}>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        <b>{match._source._osuid}</b>  
                        {moratoriumCruises.some(cruise => match._source._osuid.startsWith(cruise)) && <div><span className="badge btn-primary">Moratorium</span></div>}
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {match._source.method != null && <><b>Method:</b><br/>{match._source.method}<br/></>}
                        {match._source.material != null && <><b>Material:</b><br/>{match._source.material}<br /></>}
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">{match._source.area}</td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {(() => {
                          if (!match._source._files || match._source._files.length === 0) {
                            return <span className="text-gray-500 text-sm">No files</span>;
                          }

                          // Group files by type and count them
                          const fileTypeCounts: { [key: string]: number } = {};
                          const moratoriumFileCounts: { [key: string]: number } = {};

                          match._source._files.forEach((file: any) => {
                            if (hasFileTypeLabel(file.type)) {
                              fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
                            } else {
                              // Unlabeled files are moratorium files
                              moratoriumFileCounts[file.type] = (moratoriumFileCounts[file.type] || 0) + 1;
                            }
                          });

                          const displayableFiles = Object.entries(fileTypeCounts);

                          if (displayableFiles.length === 0 && Object.keys(moratoriumFileCounts).length === 0) {
                            return <span className="text-gray-500 text-sm">No files</span>;
                          }

                          return (
                            <div className="flex flex-col gap-1">
                              {displayableFiles.map(([fileType, count]) => {
                                const moratoriumCount = moratoriumFileCounts[fileType] || 0;
                                return (
                                  <div key={fileType} className="text-sm">
                                    <span className="font-bold">{getFileTypeLabel(fileType)}:</span> {count}
                                    {moratoriumCount > 0 && <span className="text-gray-500"> ({moratoriumCount} under moratorium)</span>}
                                  </div>
                                );
                              })}
                              {Object.entries(moratoriumFileCounts).filter(([type]) => !fileTypeCounts[type]).map(([fileType, count]) => (
                                <div key={fileType} className="text-sm">
                                  <span className="font-bold">{getFileTypeLabel(fileType)}:</span> <span className="text-gray-500">({count} under moratorium)</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                    { viewRawData &&
                      <tr key={`${key}-rawresults`}>
                        <td colSpan={4}>
                          <button 
                            className="btn btn-xs btn-ghost mb-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRawData(`dive-${key}`);
                            }}
                          >
                            <Icon name={expandedRawData.has(`dive-${key}`) ? "LuChevronUp" : "LuChevronDown"} size="xxs" className="mr-1" />
                            Raw Data
                          </button>
                          {expandedRawData.has(`dive-${key}`) && (
                            <pre><code className="flex flex-col gap-2">
                              Index: {match._index || 'osu-mgr'}{'\n'}
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
          {matches.length > 0 && search.types.includes('diveSample') &&
            <table className="table table-compact w-full mt-0">
              <thead>
                <tr>
                  <th 
                    className="rounded-none cursor-pointer hover:bg-base-200" 
                    onClick={() => toggleSort('alpha')}
                  >
                    Rock Sample {getSortIcon('alpha')}
                  </th>
                  <th className="rounded-none">Date Time</th>
                  <th className="rounded-none">Water Depth</th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span
                        className="cursor-pointer hover:text-primary"
                        onClick={() => toggleSort('texture')}
                      >
                        Texture {getSortIcon('texture')}
                      </span>
                      <TextureFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                  <th className="rounded-none">Location</th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Files</span>
                      <FileTypesFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                </tr>
              </thead> 
              <tbody>
                  {matches.map((match, key) => (
                  <>
                    <tr key={key} className="hover cursor-pointer" onClick={() => {
                      openLandingModal(match._source._osuid);
                    }}>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        <b>{match._source._osuid}</b>
                        {moratoriumCruises.some(cruise => match._source._osuid.startsWith(cruise)) && <div><span className="badge btn-primary">Moratorium</span></div>}
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {(() => {
                          const sd = match._source.startDate ? new Date(match._source.startDate) : null;
                          const st = match._source.startTime ? new Date(match._source.startTime) : null;
                          const ed = match._source.endDate ? new Date(match._source.endDate) : null;
                          const et = match._source.endTime ? new Date(match._source.endTime) : null;
                          const d = match._source.date ? new Date(match._source.date) : null;
                          const t = match._source.time ? new Date(match._source.time) : null;

                          const formatDate = (dt: Date | null) => dt ? dt.toLocaleDateString() : '';
                          const formatTime = (dt: Date | null) => dt ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                          if (sd || st || ed || et) {
                            const startDate = formatDate(sd);
                            const startTime = formatTime(st);
                            const endDate = formatDate(ed);
                            const endTime = formatTime(et);
                            const showEndDate = endDate && endDate !== startDate;
                            const showEndTime = endTime && endTime !== startTime;
                            return (
                              <>
                                {startDate && <><b>Date:</b><br/>{startDate}<br/></>}
                                {showEndDate && <><b>End Date:</b><br/>{endDate}<br/></>}
                                {(startTime || showEndTime) && (
                                  <>
                                    <b>Time:</b><br/>
                                    {startTime}
                                    {showEndTime && <> to {endTime}</>}
                                    <br/>
                                  </>
                                )}
                              </>
                            );
                          }
                          if (d || t) {
                            return (
                              <>
                                {d && <><b>Date:</b><br/>{formatDate(d)}<br/></>}
                                {t && <><b>Time:</b><br/>{formatTime(t)}<br/></>}
                              </>
                            );
                          }
                          return <span className="text-gray-500">—</span>;
                        })()}
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {(() => {
                          const ws = match._source.waterDepthStart;
                          const we = match._source.waterDepthEnd;
                          if (ws != null || we != null) {
                            const left = ws != null ? numeral(ws).format('0.00') : '';
                            const right = we != null && ws !== we ? numeral(we).format('0.00') : '';
                            return <span>{left}{(ws != null && we != null && ws !== we) ? ' to ' : ''}{right} m</span>;
                          }
                          return <span className="text-gray-500">—</span>;
                        })()}
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">{match._source.texture || <span className="text-gray-500">—</span>}</td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        <div className="flex flex-row gap-2">
                          <CollectionMapThumbnail
                            lat={match._source.latitudeStart || match._source.latitudeEnd}
                            lon={match._source.longitudeStart || match._source.longitudeEnd}
                          />
                          <div className="overflow-hidden">
                            {(match._source.latitudeStart != null || match._source.latitudeEnd != null) &&
                            <div className="truncate">
                              <b>Latitude:</b><br/>
                              {match._source.latitudeStart != null && numeral(match._source.latitudeStart).format('0.0000')}
                              {match._source.latitudeStart != null && match._source.latitudeEnd != null && match._source.latitudeStart !== match._source.latitudeEnd && ' to '}
                              {match._source.latitudeEnd != null && match._source.latitudeStart !== match._source.latitudeEnd && numeral(match._source.latitudeEnd).format('0.0000')}
                            </div>}
                            {(match._source.longitudeStart != null || match._source.longitudeEnd != null) &&
                            <div className="truncate">
                              <b>Longitude:</b><br/>
                              {match._source.longitudeStart != null && numeral(match._source.longitudeStart).format('0.0000')}
                              {match._source.longitudeStart != null && match._source.longitudeEnd != null && match._source.longitudeStart !== match._source.longitudeEnd && ' to '}
                              {match._source.longitudeEnd != null && match._source.longitudeStart !== match._source.longitudeEnd && numeral(match._source.longitudeEnd).format('0.0000')}
                            </div>}
                          </div>
                        </div>
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {(() => {
                          if (!match._source._files || match._source._files.length === 0) {
                            return <span className="text-gray-500 text-sm">No files</span>;
                          }

                          // Group files by type and count them
                          const fileTypeCounts: { [key: string]: number } = {};
                          const moratoriumFileCounts: { [key: string]: number } = {};

                          match._source._files.forEach((file: any) => {
                            if (hasFileTypeLabel(file.type)) {
                              fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
                            } else {
                              // Unlabeled files are moratorium files
                              moratoriumFileCounts[file.type] = (moratoriumFileCounts[file.type] || 0) + 1;
                            }
                          });

                          const displayableFiles = Object.entries(fileTypeCounts);

                          if (displayableFiles.length === 0 && Object.keys(moratoriumFileCounts).length === 0) {
                            return <span className="text-gray-500 text-sm">No files</span>;
                          }

                          return (
                            <div className="flex flex-col gap-1">
                              {displayableFiles.map(([fileType, count]) => {
                                const moratoriumCount = moratoriumFileCounts[fileType] || 0;
                                return (
                                  <div key={fileType} className="text-sm">
                                    <span className="font-bold">{getFileTypeLabel(fileType)}:</span> {count}
                                    {moratoriumCount > 0 && <span className="text-gray-500"> ({moratoriumCount} under moratorium)</span>}
                                  </div>
                                );
                              })}
                              {Object.entries(moratoriumFileCounts).filter(([type]) => !fileTypeCounts[type]).map(([fileType, count]) => (
                                <div key={fileType} className="text-sm">
                                  <span className="font-bold">{getFileTypeLabel(fileType)}:</span> <span className="text-gray-500">({count} under moratorium)</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                    { viewRawData &&
                      <tr key={`${key}-raw`}>
                        <td colSpan={6}>
                          <button 
                            className="btn btn-xs btn-ghost mb-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRawData(`rockSample-${key}`);
                            }}
                          >
                            <Icon name={expandedRawData.has(`rockSample-${key}`) ? "LuChevronUp" : "LuChevronDown"} size="xxs" className="mr-1" />
                            Raw Data
                          </button>
                          {expandedRawData.has(`rockSample-${key}`) && (
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

            {/* Active Filters Display - only show if there are active filters */}
            {(search.searchString || 
              search.filters?.fileTypes?.length > 0 || 
              search.filters?.methods?.length > 0 || 
              search.filters?.materialTypes?.length > 0 || 
              search.filters?.rvNames?.length > 0 ||
              search.filters?.institutions?.length > 0 ||
              search.filters?.areas?.length > 0 ||
              search.filters?.textures?.length > 0) && (
              <div className="w-[320px] mx-auto">
                <div className="sticky top-0 bg-white pb-2">
                  <div className="flex items-center justify-between">
                    <div className="tabs min-w-full px-0">
                      <div className="tab tab-lg tab-bordered text-primary flex-grow justify-start px-0">
                        <b>Active Filters</b>
                      </div>
                      <div className="tab tab-lg tab-bordered text-primary pr-0">
                        <button
                          className="btn btn-sm btn-ghost pr-0"
                          onClick={() => {
                            setSearchString("");
                            setSearch({
                              ...search,
                              searchString: '',
                              filters: {
                                fileTypes: [],
                                methods: [],
                                materialTypes: [],
                                rvNames: [],
                                institutions: [],
                                areas: [],
                                textures: []
                              }
                            });
                          }}
                          title="Clear all active filters"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Active filters list */}
                <div className="border rounded bg-base-100">
                  {/* Scrollable filter list */}
                  <div className="max-h-[400px] overflow-y-auto p-2">
                    {/* Search Text Filter */}
                    {search.searchString && (
                      <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-2 py-1">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm flex-shrink-0"
                            checked={true}
                            onChange={() => {
                              setSearchString("");
                              setSearch({ ...search, searchString: '' });
                            }}
                          />
                          <span className="label-text text-sm flex-1 break-words"><strong>Search:</strong> {search.searchString}</span>
                        </label>
                      </div>
                    )}

                    {/* File Types Filters */}
                    {search.filters?.fileTypes?.map((fileType: string) => (
                      <div key={`fileType-${fileType}`} className="form-control">
                        <label className="label cursor-pointer justify-start gap-2 py-1">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm flex-shrink-0"
                            checked={true}
                            onChange={() => {
                              setSearch({
                                ...search,
                                filters: {
                                  ...search.filters,
                                  fileTypes: search.filters.fileTypes.filter((f: string) => f !== fileType)
                                }
                              });
                            }}
                          />
                          <span className="label-text text-sm flex-1 break-words"><strong>File:</strong> {getFileTypeLabel(fileType)}</span>
                        </label>
                      </div>
                    ))}

                    {/* Methods Filters */}
                    {search.filters?.methods?.map((method: string) => (
                      <div key={`method-${method}`} className="form-control">
                        <label className="label cursor-pointer justify-start gap-2 py-1">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm flex-shrink-0"
                            checked={true}
                            onChange={() => {
                              setSearch({
                                ...search,
                                filters: {
                                  ...search.filters,
                                  methods: search.filters.methods.filter((m: string) => m !== method)
                                }
                              });
                            }}
                          />
                          <span className="label-text text-sm flex-1 break-words"><strong>Method:</strong> {method}</span>
                        </label>
                      </div>
                    ))}

                    {/* Material Types Filters */}
                    {search.filters?.materialTypes?.map((materialType: string) => (
                      <div key={`material-${materialType}`} className="form-control">
                        <label className="label cursor-pointer justify-start gap-2 py-1">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm flex-shrink-0"
                            checked={true}
                            onChange={() => {
                              setSearch({
                                ...search,
                                filters: {
                                  ...search.filters,
                                  materialTypes: search.filters.materialTypes.filter((m: string) => m !== materialType)
                                }
                              });
                            }}
                          />
                          <span className="label-text text-sm flex-1 break-words"><strong>Material:</strong> {materialType}</span>
                        </label>
                      </div>
                    ))}

                    {/* RV Names Filters */}
                    {search.filters?.rvNames?.map((rvName: string) => (
                      <div key={`rvName-${rvName}`} className="form-control">
                        <label className="label cursor-pointer justify-start gap-2 py-1">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm flex-shrink-0"
                            checked={true}
                            onChange={() => {
                              setSearch({
                                ...search,
                                filters: {
                                  ...search.filters,
                                  rvNames: search.filters.rvNames.filter((r: string) => r !== rvName)
                                }
                              });
                            }}
                          />
                          <span className="label-text text-sm flex-1 break-words"><strong>RV Name:</strong> {rvName}</span>
                        </label>
                      </div>
                    ))}

                    {/* Institutions Filters */}
                    {search.filters?.institutions?.map((institution: string) => (
                      <div key={`institution-${institution}`} className="form-control">
                        <label className="label cursor-pointer justify-start gap-2 py-1">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm flex-shrink-0"
                            checked={true}
                            onChange={() => {
                              setSearch({
                                ...search,
                                filters: {
                                  ...search.filters,
                                  institutions: search.filters.institutions.filter((i: string) => i !== institution)
                                }
                              });
                            }}
                          />
                          <span className="label-text text-sm flex-1 break-words"><strong>Cruise PI:</strong> {institution}</span>
                        </label>
                      </div>
                    ))}

                    {/* Areas Filters */}
                    {search.filters?.areas?.map((area: string) => (
                      <div key={`area-${area}`} className="form-control">
                        <label className="label cursor-pointer justify-start gap-2 py-1">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm flex-shrink-0"
                            checked={true}
                            onChange={() => {
                              setSearch({
                                ...search,
                                filters: {
                                  ...search.filters,
                                  areas: search.filters.areas.filter((a: string) => a !== area)
                                }
                              });
                            }}
                          />
                          <span className="label-text text-sm flex-1 break-words"><strong>Area:</strong> {area}</span>
                        </label>
                      </div>
                    ))}

                    {/* Textures Filters */}
                    {search.filters?.textures?.map((texture: string) => (
                      <div key={`texture-${texture}`} className="form-control">
                        <label className="label cursor-pointer justify-start gap-2 py-1">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm flex-shrink-0"
                            checked={true}
                            onChange={() => {
                              setSearch({
                                ...search,
                                filters: {
                                  ...search.filters,
                                  textures: search.filters.textures.filter((t: string) => t !== texture)
                                }
                              });
                            }}
                          />
                          <span className="label-text text-sm flex-1 break-words"><strong>Texture:</strong> {texture}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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

      {/* Landing Page Modal - Redesigned */}
      {showLandingModal && (
        <div className="fixed inset-0 z-50 overflow-hidden" onClick={() => setShowLandingModal(false)}>
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"></div>

          {/* Modal Container */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              className="relative bg-base-100 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Title and Close Button */}
              <div className="relative border-b border-base-300">
                <div className="flex justify-between items-center p-6">
                  <div className="flex-1">
                    <Breadcrumbs doc={currentDoc} />
                  </div>
                  <button
                    className="btn btn-sm btn-circle btn-ghost hover:bg-base-300 transition-colors ml-4"
                    onClick={() => setShowLandingModal(false)}
                  >
                    <Icon name="BiX" size="small" />
                  </button>
                </div>
              </div>

              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto">
                {/* Globe Hero Section */}
                {currentDoc && (currentDoc.latitudeStart != null || currentDoc.latitudeEnd != null ||
                               currentDoc.longitudeStart != null || currentDoc.longitudeEnd != null) && (
                  <div className="relative bg-gradient-to-br from-primary/10 via-base-100 to-base-100 border-b border-base-300">
                    <div className="min-h-[300px]">
                      <Globe
                        latitudeStart={currentDoc.latitudeStart}
                        latitudeEnd={currentDoc.latitudeEnd}
                        longitudeStart={currentDoc.longitudeStart}
                        longitudeEnd={currentDoc.longitudeEnd}
                      />
                    </div>
                    {/* Coordinate Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pointer-events-none">
                      <div className="flex gap-6 text-white">
                        {currentDoc.latitudeStart != null && (
                          <div>
                            <div className="text-xs opacity-80 font-medium mb-1 uppercase tracking-wide">Latitude</div>
                            <div className="font-bold">
                              {numeral(currentDoc.latitudeStart).format('0.0000')}°
                              {currentDoc.latitudeEnd != null && currentDoc.latitudeStart !== currentDoc.latitudeEnd && (
                                <span className="text-sm opacity-90 font-normal ml-1">
                                  to {numeral(currentDoc.latitudeEnd).format('0.0000')}°
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {currentDoc.longitudeStart != null && (
                          <div>
                            <div className="text-xs opacity-80 font-medium mb-1 uppercase tracking-wide">Longitude</div>
                            <div className="font-bold">
                              {numeral(currentDoc.longitudeStart).format('0.0000')}°
                              {currentDoc.longitudeEnd != null && currentDoc.longitudeStart !== currentDoc.longitudeEnd && (
                                <span className="text-sm opacity-90 font-normal ml-1">
                                  to {numeral(currentDoc.longitudeEnd).format('0.0000')}°
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cruise Globe Hero Section */}
                {currentDoc && currentDoc._docType === 'cruise' && currentDoc._cruiseUUID && (
                  <CruiseGlobe cruiseDoc={currentDoc} />
                )}

                {/* Dive/Rock Globe Hero Section */}
                {currentDoc && currentDoc._docType === 'dive' && currentDoc._diveUUID && (
                  <DiveGlobe diveDoc={currentDoc} />
                )}

                {/* Content */}
                <div className="p-6 lg:p-8">
                  <LandingPage
                    data={{}}
                    osuId={osuId}
                    onDocumentLoaded={(doc) => setCurrentDoc(doc)}
                    onNavigateToChild={(childOsuId) => {
                      setOsuId(childOsuId);
                      setCurrentDoc(null);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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