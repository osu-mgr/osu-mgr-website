import numeral from 'numeral';
import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Icon } from "../util/icon";
import { fileTypes, getFileTypeLabel } from './search-data';

export const FilterPanel: React.FC<{
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
      // Fetch method counts for cores, dives, and cruises (cruise searches query cores via the cruise.keyword field)
      if (!search.types.some((type: string) => ['core', 'dive', 'cruise'].includes(type))) {
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
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: search.types.some((type: string) => ['core', 'dive', 'cruise'].includes(type))
  });

  // Fetch available material types for cores and cruises
  const { data: materialCounts, isLoading: materialsLoading } = useQuery({
    queryKey: ['materialCounts', search.types, search.searchString, search.filters?.materialTypes, search.filterLogic?.materialTypes, search.filters?.fileTypes, search.filters?.methods, search.filters?.rvNames, search.filters?.institutions, search.filters?.areas, search.filters?.textures],
    queryFn: async () => {
      // Fetch material counts for cores and cruises (cruise searches query cores via the cruise.keyword field)
      if (!search.types.some((type: string) => ['core', 'cruise'].includes(type))) {
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
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: search.types.some((type: string) => ['core', 'cruise'].includes(type))
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
    gcTime: 30 * 60 * 1000, // 30 minutes
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
    gcTime: 30 * 60 * 1000, // 30 minutes
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
    gcTime: 30 * 60 * 1000, // 30 minutes
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
    gcTime: 30 * 60 * 1000, // 30 minutes
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
    gcTime: 30 * 60 * 1000, // 30 minutes
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

      {/* Institution Filter - only show for cruises and if there are institutions with results */}
      {search.types.includes('cruise') &&
       availableInstitutions.some(institution => (institutionCounts?.[institution] || 0) > 0) && (
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

      {/* Material Type Filter - only show for cores/cruises and if there are materials with results */}
      {search.types.some((type: string) => ['core', 'cruise'].includes(type)) &&
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

      {/* Collection Method Filter - only show for cores, rocks, and cruises and if there are methods with results */}
      {search.types.some((type: string) => ['core', 'dive', 'cruise'].includes(type)) &&
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
