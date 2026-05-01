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
import { r2rCruiseLinks, hasFileTypeLabel, getFileTypeLabel } from '../search/search-data';
import { FileTypesFilterDropdown } from '../search/file-types-filter';
import { RelatedFileTypesFilterDropdown } from '../search/related-file-types-filter';
import { RvNameFilterDropdown } from '../search/rv-name-filter';
import { InstitutionFilterDropdown } from '../search/institution-filter';
import { AreaFilterDropdown } from '../search/area-filter';
import { TextureFilterDropdown } from '../search/texture-filter';
import { CollectionFilterDropdown } from '../search/collection-filter';
import { DownloadFilesButton } from '../search/download-files-button';
import { FilterPanel } from '../search/filter-panel';

const Globe = dynamic(() => import("../util/globe").then(mod => mod.Globe), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[300px] flex items-center justify-center">
    <Icon name="TbLoader2" className="w-8 h-8 animate-spin text-primary" />
  </div>
});

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

export const Search: React.FC<{ data: any }> = ({
    data
}) => {
  const pageSize = 10;
  const router = useRouter();
  const viewRawData = true;  // = !process.env.VERCEL;

  console.log("viewRawData", viewRawData);
  const [search, setSearch] = useLocalStorage('search-2025-08-06-v3', {
    sortOrder: 'alpha asc',
    searchString: '',
    types: ['cruise'],
    filters: {
      fileTypes: [], // Array of selected file types
      relatedFileTypes: [], // Array of selected related file types
      methods: [], // Array of selected collection methods
      materialTypes: [], // Array of selected material types
      rvNames: [], // Array of selected RV names
      institutions: [], // Array of selected institutions
    },
    filterLogic: {
      fileTypes: 'OR', // 'OR' or 'AND'
      relatedFileTypes: 'OR',
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

  // Query for core data when viewing a section in the modal
  const {
    data: coreForSectionResults,
    isLoading: isCoreForSectionLoading,
  } = useQuery({
    queryKey: ['coreForSectionModal', currentDoc?._coreUUID],
    queryFn: async () => {
      if (!currentDoc?._coreUUID) return null;

      const payload = {
        types: ['core'],
        terms: {
          "_coreUUID.keyword": [currentDoc._coreUUID],
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
      return res.json();
    },
    enabled: !!currentDoc?._coreUUID && currentDoc?._docType === 'section',
  });

  const coreForSection = coreForSectionResults?.hits?.hits?.[0]?._source || null;

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
    // Update URL with osu parameter
    router.push(`/search?osu=${encodeURIComponent(osuid)}`, undefined, { shallow: true });
  };

  const closeLandingModal = () => {
    setShowLandingModal(false);
    setOsuId('');
    // Remove osu parameter from URL
    router.push('/search', undefined, { shallow: true });
  };

  const copyModalLink = () => {
    if (osuId) {
      const url = `https://osu-mgr.org/${encodeURIComponent(osuId)}`;
      navigator.clipboard.writeText(url).then(() => {
        // You could add a toast notification here if desired
      });
    }
  };

  const getDocTypeLabel = (docType: string | undefined) => {
    if (!docType) return 'Item';
    switch(docType.toLowerCase()) {
      case 'cruise': return 'Cruise';
      case 'core': return 'Core';
      case 'section': return 'Section';
      case 'sectionhalf': return 'Section Half';
      case 'dive': return 'Dive';
      case 'divesample': return 'Rock';
      default: return docType.charAt(0).toUpperCase() + docType.slice(1);
    }
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
          // Strip section half suffix (e.g. OSU-7004Y-1PC-1A -> OSU-7004Y-1PC-1)
          const resolvedId = osuParam.replace(/^(OSU-[^-]+-[^-]+-\d+)[A-Za-z]$/i, '$1');
          console.log('Processing OSU URL parameter:', resolvedId);
          setOsuId(resolvedId);
          setSearchString(resolvedId);
          setShowLandingModal(true);
          setSearch(prevSearch => ({
            ...prevSearch,
            searchString: resolvedId,
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

  const renderRelatedFileCounts = (source: any) => {
    const allRelated = [
      ...(source._parentFiles || []),
      ...(source._childFiles || []),
    ].filter((f: any) => hasFileTypeLabel(f.type));

    if (allRelated.length === 0) {
      return <span className="text-gray-500 text-sm">No files</span>;
    }

    const counts: { [key: string]: number } = {};
    allRelated.forEach((f: any) => {
      counts[f.type] = (counts[f.type] || 0) + 1;
    });

    return (
      <div className="flex flex-col gap-1">
        {Object.entries(counts).map(([fileType, count]) => (
          <div key={fileType} className="text-sm">
            <span className="font-bold">{getFileTypeLabel(fileType)}:</span> {count}
          </div>
        ))}
      </div>
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
            />
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          {/* Left Sidebar - Filters and Active Filters */}
          <div className={`${showFilters ? 'w-[320px]' : 'w-auto'} flex-shrink-0 flex flex-col gap-4 overflow-y-auto h-[calc(100vh-25rem)]`}>
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
          <div className="flex-1 overflow-hidden flex flex-col h-[calc(100vh-25rem)]">

        {/* Responsive tabs - full tabs on large screens, dropdown on small */}
        <div className="mb-2">
          {/* Desktop tabs - hidden on small screens */}
          <div className="hidden min-[1200px]:flex tabs min-w-full px-0">
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
          <div className="min-[1200px]:hidden relative tabs min-w-full px-0">
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
          <div className="flex-1 overflow-y-auto">
          {search.types.includes('cruise') &&
            <table className="table table-compact w-full mt-0">
              <thead className="sticky top-0 z-10 bg-base-100">
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
                  <th className="rounded-none">Location</th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Files</span>
                      <FileTypesFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Related Files</span>
                      <RelatedFileTypesFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
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
                        {match._source._moratorium && <div><span className="badge btn-primary">Moratorium</span></div>}
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {match._source.rvName}
                        {r2rCruiseLinks[match._source._osuid] && (
                          <div className="mt-1 flex flex-row flex-wrap gap-1">
                            {r2rCruiseLinks[match._source._osuid].map((link: string, idx: number) => (
                              <a
                                key={idx}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="badge badge-ghost hover:badge-ghost no-underline flex items-center gap-1"
                              >
                                R2R
                                <Icon name="BiLinkExternal" size="xxs" />
                                <span className="font-normal">{link.split('/').pop()}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {match._source.pi && <><b>{match._source.pi}</b><br/></>}
                        {match._source.piInstitution && <>{match._source.piInstitution}<br/></>}
                      </td>
                      <td className="align-top">
                        <CollectionMapThumbnail locations={match._source._locations} />
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {(() => {
                          const files = match._source._files || [];
                          const moratoriumFiles = match._source._moratorium_files || [];

                          if (files.length === 0 && moratoriumFiles.length === 0) {
                            return <span className="text-gray-500 text-sm">No files</span>;
                          }

                          // Group files by type and count them
                          const fileTypeCounts: { [key: string]: number } = {};
                          const moratoriumFileCounts: { [key: string]: number } = {};

                          files.forEach((file: any) => {
                            if (hasFileTypeLabel(file.type)) {
                              fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
                            }
                          });

                          moratoriumFiles.forEach((file: any) => {
                            moratoriumFileCounts[file.type] = (moratoriumFileCounts[file.type] || 0) + 1;
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
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {renderRelatedFileCounts(match._source)}
                      </td>
                    </tr>
                    {viewRawData &&
                      <tr key={`${key}-rawresults`}>
                        <td colSpan={6}>
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
              <thead className="sticky top-0 z-10 bg-base-100">
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
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Related Files</span>
                      <RelatedFileTypesFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
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
                        {match._source._moratorium && <div><span className="badge btn-primary">Moratorium</span></div>}
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
                      <td className="align-top">
                        <CollectionMapThumbnail
                          lat={match._source.latitudeStart || match._source.latitudeEnd}
                          lon={match._source.longitudeStart || match._source.longitudeEnd}
                        />
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {(() => {
                          const files = match._source._files || [];
                          const moratoriumFiles = match._source._moratorium_files || [];

                          if (files.length === 0 && moratoriumFiles.length === 0) {
                            return <span className="text-gray-500 text-sm">No files</span>;
                          }

                          // Group files by type and count them
                          const fileTypeCounts: { [key: string]: number } = {};
                          const moratoriumFileCounts: { [key: string]: number } = {};

                          files.forEach((file: any) => {
                            if (hasFileTypeLabel(file.type)) {
                              fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
                            }
                          });

                          moratoriumFiles.forEach((file: any) => {
                            moratoriumFileCounts[file.type] = (moratoriumFileCounts[file.type] || 0) + 1;
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
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {renderRelatedFileCounts(match._source)}
                      </td>
                    </tr>
                    { viewRawData &&
                      <tr key={`${key}-raw`}>
                        <td colSpan={8}>
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
              <thead className="sticky top-0 z-10 bg-base-100">
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
                  <th className="rounded-none">Location</th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Files</span>
                      <FileTypesFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Related Files</span>
                      <RelatedFileTypesFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
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
                        {match._source._moratorium && <div><span className="badge btn-primary">Moratorium</span></div>}
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
                      <td className="align-top">
                        <CollectionMapThumbnail
                          lat={match._source.latitudeStart || match._source.latitudeEnd}
                          lon={match._source.longitudeStart || match._source.longitudeEnd}
                        />
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {(() => {
                          const files = match._source._files || [];
                          const moratoriumFiles = match._source._moratorium_files || [];

                          if (files.length === 0 && moratoriumFiles.length === 0) {
                            return <span className="text-gray-500 text-sm">No files</span>;
                          }

                          // Group files by type and count them
                          const fileTypeCounts: { [key: string]: number } = {};
                          const moratoriumFileCounts: { [key: string]: number } = {};

                          files.forEach((file: any) => {
                            if (hasFileTypeLabel(file.type)) {
                              fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
                            }
                          });

                          moratoriumFiles.forEach((file: any) => {
                            moratoriumFileCounts[file.type] = (moratoriumFileCounts[file.type] || 0) + 1;
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
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {renderRelatedFileCounts(match._source)}
                      </td>
                    </tr>
                    { viewRawData &&
                      <tr key={`${key}-raw`}>
                        <td colSpan={6}>
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
              <thead className="sticky top-0 z-10 bg-base-100">
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
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Related Files</span>
                      <RelatedFileTypesFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                  {matches.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-500">
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
                            {match._source._moratorium && <div><span className="badge btn-primary">Moratorium</span></div>}
                          </td>
                          <td className="align-top overflow-hidden text-ellipsis max-w-0">
                            {(() => {
                              const files = match._source._files || [];
                              const moratoriumFiles = match._source._moratorium_files || [];

                              if (files.length === 0 && moratoriumFiles.length === 0) {
                                return <span className="text-gray-500 text-sm">No files</span>;
                              }

                              // Group files by type and count them
                              const fileTypeCounts: { [key: string]: number } = {};
                              const moratoriumFileCounts: { [key: string]: number } = {};

                              files.forEach((file: any) => {
                                if (hasFileTypeLabel(file.type)) {
                                  fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
                                }
                              });

                              moratoriumFiles.forEach((file: any) => {
                                moratoriumFileCounts[file.type] = (moratoriumFileCounts[file.type] || 0) + 1;
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
                          <td className="align-top overflow-hidden text-ellipsis max-w-0">
                            {renderRelatedFileCounts(match._source)}
                          </td>
                        </tr>
                        {viewRawData &&
                          <tr key={`${key}-raw`}>
                            <td colSpan={3}>
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
              <thead className="sticky top-0 z-10 bg-base-100">
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
                  <th className="rounded-none">Location</th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Files</span>
                      <FileTypesFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Related Files</span>
                      <RelatedFileTypesFilterDropdown search={search} setSearch={setSearch} />
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
                        {match._source._moratorium && <div><span className="badge btn-primary">Moratorium</span></div>}
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {match._source.method != null && <><b>Method:</b><br/>{match._source.method}<br/></>}
                        {match._source.material != null && <><b>Material:</b><br/>{match._source.material}<br /></>}
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">{match._source.area}</td>
                      <td className="align-top">
                        <CollectionMapThumbnail locations={match._source._locations} lat={match._source.latitudeStart || match._source.latitudeEnd} lon={match._source.longitudeStart || match._source.longitudeEnd} />
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {(() => {
                          const files = match._source._files || [];
                          const moratoriumFiles = match._source._moratorium_files || [];

                          if (files.length === 0 && moratoriumFiles.length === 0) {
                            return <span className="text-gray-500 text-sm">No files</span>;
                          }

                          // Group files by type and count them
                          const fileTypeCounts: { [key: string]: number } = {};
                          const moratoriumFileCounts: { [key: string]: number } = {};

                          files.forEach((file: any) => {
                            if (hasFileTypeLabel(file.type)) {
                              fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
                            }
                          });

                          moratoriumFiles.forEach((file: any) => {
                            moratoriumFileCounts[file.type] = (moratoriumFileCounts[file.type] || 0) + 1;
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
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {renderRelatedFileCounts(match._source)}
                      </td>
                    </tr>
                    { viewRawData &&
                      <tr key={`${key}-rawresults`}>
                        <td colSpan={6}>
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
              <thead className="sticky top-0 z-10 bg-base-100">
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
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Related Files</span>
                      <RelatedFileTypesFilterDropdown search={search} setSearch={setSearch} />
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
                        {match._source._moratorium && <div><span className="badge btn-primary">Moratorium</span></div>}
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
                      <td className="align-top">
                        <CollectionMapThumbnail
                          lat={match._source.latitudeStart || match._source.latitudeEnd}
                          lon={match._source.longitudeStart || match._source.longitudeEnd}
                        />
                      </td>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {(() => {
                          const files = match._source._files || [];
                          const moratoriumFiles = match._source._moratorium_files || [];

                          if (files.length === 0 && moratoriumFiles.length === 0) {
                            return <span className="text-gray-500 text-sm">No files</span>;
                          }

                          // Group files by type and count them
                          const fileTypeCounts: { [key: string]: number } = {};
                          const moratoriumFileCounts: { [key: string]: number } = {};

                          files.forEach((file: any) => {
                            if (hasFileTypeLabel(file.type)) {
                              fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
                            }
                          });

                          moratoriumFiles.forEach((file: any) => {
                            moratoriumFileCounts[file.type] = (moratoriumFileCounts[file.type] || 0) + 1;
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
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        {renderRelatedFileCounts(match._source)}
                      </td>
                    </tr>
                    { viewRawData &&
                      <tr key={`${key}-raw`}>
                        <td colSpan={7}>
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
              search.filters?.relatedFileTypes?.length > 0 ||
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
                      <div className="tab tab-lg tab-bordered text-primary px-0">
                        <button
                          className="btn btn-xs btn-outline"
                          onClick={() => {
                            setSearchString("");
                            setSearch({
                              ...search,
                              searchString: '',
                              filters: {
                                fileTypes: [],
                                relatedFileTypes: [],
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

                    {/* Related File Types Filters */}
                    {search.filters?.relatedFileTypes?.map((fileType: string) => (
                      <div key={`relatedFileType-${fileType}`} className="form-control">
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
                                  relatedFileTypes: search.filters.relatedFileTypes.filter((f: string) => f !== fileType)
                                }
                              });
                            }}
                          />
                          <span className="label-text text-sm flex-1 break-words"><strong>Related File:</strong> {getFileTypeLabel(fileType)}</span>
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
          {/* Infinite scroll trigger: only show if there are more pages to load */}
          {hasNextPage && <div ref={ref} className="h-1" /> }
          </div>
        </div>
        </div>
      </Container>

      {/* Landing Page Modal - Redesigned */}
      {showLandingModal && (
        <div className="fixed inset-0 z-50 overflow-hidden" onClick={closeLandingModal}>
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"></div>

          {/* Modal Container */}
          <div className="flex items-center justify-center min-h-screen px-8 py-24">
            <div
              className="relative bg-base-100 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[calc(100vh-12rem)] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Title and Close Button */}
              <div className="relative border-b border-base-300">
                <div className="flex justify-between items-center p-6">
                  <div className="flex items-center gap-3 flex-1">
                    <h2 className="text-2xl font-bold text-primary m-0">
                      {getDocTypeLabel(currentDoc?._docType)} {osuId || currentDoc?._osuid}
                    </h2>
                    <button
                      className="btn btn-sm btn-ghost hover:bg-base-300 transition-colors text-gray-400"
                      onClick={copyModalLink}
                      title="Copy link to this item"
                    >
                      <Icon name="BiCopy" size="small" />
                      <span>Copy Link</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn btn-sm btn-circle btn-ghost hover:bg-base-300 transition-colors"
                      onClick={closeLandingModal}
                    >
                      <Icon name="BiX" size="small" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto">
                {/* Globe Hero Section - Use core coordinates for sections */}
                {currentDoc && currentDoc._docType === 'section' && coreForSection &&
                 (coreForSection.latitudeStart != null || coreForSection.latitudeEnd != null ||
                  coreForSection.longitudeStart != null || coreForSection.longitudeEnd != null) && (
                  <div className="relative bg-gradient-to-br from-primary/10 via-base-100 to-base-100 border-b border-base-300">
                    <div className="min-h-[300px]">
                      <Globe
                        latitudeStart={coreForSection.latitudeStart}
                        latitudeEnd={coreForSection.latitudeEnd}
                        longitudeStart={coreForSection.longitudeStart}
                        longitudeEnd={coreForSection.longitudeEnd}
                      />
                    </div>
                    {/* Coordinate Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pointer-events-none">
                      <div className="flex gap-6 text-white">
                        {coreForSection.latitudeStart != null && (
                          <div>
                            <div className="text-xs opacity-80 font-medium mb-1 uppercase tracking-wide">Latitude (Core)</div>
                            <div className="font-bold">
                              {numeral(coreForSection.latitudeStart).format('0.0000')}°
                              {coreForSection.latitudeEnd != null && coreForSection.latitudeStart !== coreForSection.latitudeEnd && (
                                <span className="text-sm opacity-90 font-normal ml-1">
                                  to {numeral(coreForSection.latitudeEnd).format('0.0000')}°
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {coreForSection.longitudeStart != null && (
                          <div>
                            <div className="text-xs opacity-80 font-medium mb-1 uppercase tracking-wide">Longitude (Core)</div>
                            <div className="font-bold">
                              {numeral(coreForSection.longitudeStart).format('0.0000')}°
                              {coreForSection.longitudeEnd != null && coreForSection.longitudeStart !== coreForSection.longitudeEnd && (
                                <span className="text-sm opacity-90 font-normal ml-1">
                                  to {numeral(coreForSection.longitudeEnd).format('0.0000')}°
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Globe Hero Section - For non-section documents */}
                {currentDoc && currentDoc._docType !== 'section' && currentDoc._docType !== 'cruise' && currentDoc._docType !== 'dive' &&
                 (currentDoc.latitudeStart != null || currentDoc.latitudeEnd != null ||
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
                {currentDoc && currentDoc._docType === 'cruise' && currentDoc._locations?.length > 0 && (
                  <CruiseGlobe cruiseDoc={currentDoc} />
                )}

                {/* Dive/Rock Globe Hero Section */}
                {currentDoc && currentDoc._docType === 'dive' && currentDoc.latitudeStart != null && (
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
