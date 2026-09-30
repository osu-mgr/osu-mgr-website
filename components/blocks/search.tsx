import _ from 'lodash';
import numeral from 'numeral';
import React, { useState, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useRouter } from 'next/router';
import { useQuery, useQueries } from '@tanstack/react-query';
import useLocalStorage from '../hooks/useLocalStorage';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-hook-inview';
import { Section } from "../util/section";
import { Container } from "../util/container";
import { ItemsCount } from '../util/items-count';
import { CollectionMapThumbnail } from '../util/collection-map-thumbnail';
import { Icon } from "../util/icon";
import { LandingPage } from "./landing-page";
import { r2rCruiseLinks, getCollectionLabel, hasFileTypeLabel, getFileTypeLabel, getDiveMethodLabel, formatDate, formatTime, formatNumber, formatField, isPlaceholder, shown, SHOW_PUBLICATIONS } from '../search/search-data';
import { FileTypesFilterDropdown } from '../search/file-types-filter';
import { RelatedFileTypesFilterDropdown } from '../search/related-file-types-filter';
import { RvNameFilterDropdown } from '../search/rv-name-filter';
import { InstitutionFilterDropdown } from '../search/institution-filter';
import { TextureFilterDropdown } from '../search/texture-filter';
import { CollectionFilterDropdown } from '../search/collection-filter';
import { DownloadFilesButton } from '../search/download-files-button';
import { DownloadRowsButton } from '../search/download-rows-button';
import { FilterPanel } from '../search/filter-panel';
import type { Area } from '../search/map-points';
import type { AreaRequest } from '../search/search-map';
import { DataIssueBadges } from '../search/data-issues';
import { DateTimeCell } from '../search/date-time-cell';
import { IdColumnFilterDropdown, getLinkLabel } from '../search/id-column-filter';
import { AreaColumnFilter } from '../search/area-column-filter';
import { SearchInputWithSuggestions } from '../search/search-suggestions';
import type { DetailFilter } from '../search/detail-filter-button';
import dynamic from 'next/dynamic';

// MapLibre needs the browser, so the Maps tab only loads client-side.
const SearchMap = dynamic(() => import('../search/search-map').then(mod => mod.SearchMap), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading map...</div>,
});


// Date/time column for a result row. Values are formatted with the shared helpers
// rather than new Date(), which mangles the collection's assorted date formats —
// bare years become the previous New Year's Eve and clock times like "08:09" come
// out as "Invalid Date".

// Tab that shows each doc type; types without a visible tab fall back to the nearest one.
const TAB_FOR_DOC_TYPE: Record<string, string> = {
  cruise: 'cruise', core: 'core', section: 'section', sectionHalf: 'section', coreSample: 'section',
  dive: 'dive', diveSample: 'diveSample', diveSubsample: 'diveSample', file: 'file', location: 'file',
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

export const Search: React.FC<{ data: any }> = ({
    data
}) => {
  const pageSize = 10;
  const router = useRouter();
  const viewRawData = process.env.NEXT_PUBLIC_TINA_BRANCH !== 'prod';

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
      dataIssues: [], // 'errors' | 'warnings' (dev deployments only)
      links: [], // 'r2r' | 'publication'
      collections: [], // collection codes: 'MGG' | 'ACC' | 'NOAA' | 'ODC'
    },
    filterLogic: {
      fileTypes: 'OR', // 'OR' or 'AND'
      relatedFileTypes: 'OR',
      methods: 'OR',
      materialTypes: 'OR',
      rvNames: 'OR',
      institutions: 'OR',
      links: 'OR',
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
  // The type tabs give way to a menu when they don't fit on one line. They
  // stay laid out (hidden) so that they can still be measured.
  const tabsRef = useRef<HTMLDivElement>(null);
  const [tabsOverflow, setTabsOverflow] = useState(false);
  useLayoutEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    const measure = () => {
      // The width the tabs need ends where the filler tab starts. Unlike
      // scrollWidth, it doesn't depend on whether the filler has room to grow.
      const filler = tabs.lastElementChild;
      if (!filler) return;
      const needed = filler.getBoundingClientRect().left - tabs.getBoundingClientRect().left;
      // Once collapsed, the tabs need some slack to come back, so that a layout
      // shift caused by the switch itself can't flip it straight back.
      setTabsOverflow(collapsed => needed > tabs.clientWidth - (collapsed ? 24 : 0));
    };
    measure();
    // The tabs' widths change with their counts, as well as with the space.
    // Measuring only on resizes (not after every render) keeps the switch from
    // re-triggering itself within a render.
    const observer = new ResizeObserver(measure);
    observer.observe(tabs);
    Array.from(tabs.children).forEach(tab => observer.observe(tab));
    return () => observer.disconnect();
  }, []);
  // Maps tab: plots the current search instead of listing one record type.
  const [showMap, setShowMap] = useLocalStorage('search-show-map', false);
  // On the Maps tab the filter panel counts what the map plots: its enabled layers,
  // only records with coordinates. Panel edits write back filters only, so the
  // list tab's types are kept for when the user leaves the map.
  const [mapLayers, setMapLayers] = useState<string[]>(['core', 'dive']);
  const filterSearch = useMemo(
    () => (showMap ? { ...search, types: mapLayers, hasCoordinates: true } : search),
    [showMap, search, mapLayers],
  );
  const setFilterSearch = (next: any) => setSearch(prev => {
    const value = typeof next === 'function' ? next(filterSearch) : next;
    return { ...prev, filters: value.filters, filterLogic: value.filterLogic };
  });
  // Geospatial filter (filters.area): edited on the Maps tab, which adds one
  // when asked (see SearchMap): from the filter panel's checkbox or a Location
  // column's button, in the Mercator view when coming from a list.
  const [areaRequest, setAreaRequest] = useState<AreaRequest | null>(null);
  const setArea = (area: Area | null) => {
    setAreaRequest(null);
    setFilterSearch((prev: any) => ({ ...prev, filters: { ...prev.filters, area: area ?? undefined } }));
  };
  const editArea = (create: boolean) => {
    if (create) setAreaRequest(showMap ? {} : { mode: 'flat', zoomTo: true });
    setShowMap(true);
  };
  const [ref, isVisible] = useInView({
      threshold: 0,
  });


  // Keep a ref to the latest setSearch so the debounced function can stay a single
  // stable instance. useLocalStorage returns a new setSearch on every render, so
  // depending on it (e.g. via useCallback([setSearch])) would recreate the debounced
  // function each keystroke — which defeats debouncing entirely, since lodash only
  // cancels a pending call when the *same* instance is invoked again. That caused the
  // search to fire on every keystroke instead of waiting for typing to pause.
  const setSearchRef = useRef(setSearch);
  setSearchRef.current = setSearch;

  const debouncedSetSearch = useMemo(
    () =>
      _.debounce((newSearchString: string) => {
        const cleanedSearchString = newSearchString.replace(/^http(s?):\/\/osu-mgr.org\//i, '');
        setSearchRef.current(prevSearch => ({ ...prevSearch, searchString: cleanedSearchString }));
        // Resetting pagination is handled by React Query when the queryKey (search) changes
      }, 500),
    []
  );

  // Cancel any pending debounced search when the component unmounts.
  useEffect(() => () => debouncedSetSearch.cancel(), [debouncedSetSearch]);

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
    setHasProcessedUrlParam(true);
    // Update URL with osu parameter
    router.push(`/search?osu=${encodeURIComponent(osuid)}`, undefined, { shallow: true });
  };

  const closeLandingModal = () => {
    setShowLandingModal(false);
    setOsuId('');
    // Remove osu parameter from URL
    router.push('/search', undefined, { shallow: true });
  };

  // A filter icon in the modal's Details tab: close the modal and list the given
  // type's records with just that filter, as counted in the icon's popover.
  const applyDetailFilter = (filter: DetailFilter, type: string) => {
    setSearchString('');
    setShowMap(false);
    setSearch(prevSearch => ({
      ...prevSearch,
      searchString: '',
      types: [type],
      filters: {
        fileTypes: [],
        relatedFileTypes: [],
        methods: [],
        materialTypes: [],
        rvNames: [],
        institutions: [],
        textures: [],
        dataIssues: [],
        links: [],
        collections: [],
        [filter.key]: [filter.value],
      },
    }));
    closeLandingModal();
  };

  const copyModalLink = () => {
    if (osuId) {
      const url = `https://osu-mgr.org/${encodeURIComponent(osuId)}`;
      navigator.clipboard.writeText(url).then(() => {
        // You could add a toast notification here if desired
      });
    }
  };

  const getDocTypeLabel = (docType: string | undefined, method?: string) => {
    if (!docType) return 'Item';
    switch(docType.toLowerCase()) {
      case 'cruise': return 'Cruise';
      case 'core': return 'Core';
      case 'section': return 'Section';
      case 'sectionhalf': return 'Section Half';
      case 'dive': return getDiveMethodLabel(method);
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
          // Used as-is; LandingPage redirects a section half or core sample to its parent section.
          const resolvedId = osuParam;
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

  // After a text search, if the current tab has no results, jump to the first tab
  // that does (e.g. a citation search from Cores lands on Cruises). Counts share ItemsCount's query keys, so the tab badges
  // and this check fetch once. Runs once per search string so the user can still
  // pick another tab afterwards.
  const tabTypes = useMemo(() => [
    ['cruise'], ['core'], ['section'], ['dive'], ['diveSample'],
    ...(viewRawData ? [['file', 'location']] : []),
  ], [viewRawData]);
  const tabCounts = useQueries({
    queries: tabTypes.map(types => {
      const countTypes = [types[0]];
      return {
        queryKey: ['itemsCount', countTypes, search.searchString, undefined, search.filters, search.filterLogic],
        queryFn: async () => {
          const res = await fetch('/api/opensearch?count', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ types: countTypes, searchString: search.searchString, filters: search.filters, filterLogic: search.filterLogic }),
          });
          if (!res.ok) throw new Error('Failed to fetch count');
          return res.json();
        },
        enabled: !!search.searchString,
      };
    }),
  });
  // An exact OSU ID also matches its ancestors (they list descendant IDs), so an ID
  // search opens the tab of the record it names rather than needing one result type.
  const isOsuId = /^OSU-\S+$/i.test(search.searchString || '');
  const { data: exactIdDocType, isFetched: exactIdFetched } = useQuery({
    queryKey: ['exactIdDocType', search.searchString],
    queryFn: async () => {
      const res = await fetch('/api/opensearch?search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          types: Object.keys(TAB_FOR_DOC_TYPE),
          terms: { '_osuid.keyword': [search.searchString.trim().toUpperCase()] },
          size: 1,
        }),
      });
      if (!res.ok) return null;
      const body = await res.json();
      return body?.hits?.hits?.[0]?._source?._docType ?? null;
    },
    enabled: isOsuId,
  });
  const autoTabSearchRef = useRef<string | null>(null);
  useEffect(() => {
    if (!search.searchString || autoTabSearchRef.current === search.searchString) return;
    if (tabCounts.some(q => q.data?.count === undefined)) return;
    if (isOsuId && !exactIdFetched) return;
    autoTabSearchRef.current = search.searchString;
    const withResults = tabTypes.filter((_types, i) => tabCounts[i].data.count > 0);
    const idTab = exactIdDocType && withResults.find(types => types[0] === TAB_FOR_DOC_TYPE[exactIdDocType]);
    const currentHasResults = withResults.some(types => search.types.includes(types[0]));
    const target = idTab || (currentHasResults ? null : withResults[0]);
    if (target && !search.types.includes(target[0])) {
      setSearch(prevSearch => ({ ...prevSearch, types: target }));
    }
  });

  return (
    <Section>
      <Container className="my-4 prose max-w-none" width="custom">
        <h3>Search OSU-MGR Collections</h3>
        <div className="form-control">
          <div className="input-group flex">
            <SearchInputWithSuggestions
              placeholder="Search OSU-MGR Collections by ID, text, DOI or citation..." className="flex-grow"
              value={searchString}
              onChange={(value) => {
                setSearchString(value);
                debouncedSetSearch(value);
              }}
              onCommit={(value) => {
                debouncedSetSearch(value);
                debouncedSetSearch.flush();
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
            <DownloadRowsButton
              search={search}
              searchString={searchString}
            />
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
                search={filterSearch}
                setSearch={setFilterSearch}
                onToggle={() => setShowFilters(false)}
                onEditArea={editArea}
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
                    (search.filters?.rvNames || []).length > 0,
                    (search.filters?.dataIssues || []).length > 0
                  ].filter(Boolean).length}
                </span>
              </button>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col h-[calc(100vh-25rem)]">

        {/* Responsive tabs - full tabs on large screens, dropdown on small */}
        <div className="mb-2">
          {/* Full tabs - hidden when they don't fit on one line */}
          <div
            ref={tabsRef}
            aria-hidden={tabsOverflow}
            className={`tabs flex-nowrap overflow-hidden whitespace-nowrap [&>*]:shrink-0 min-w-full px-0 ${tabsOverflow ? 'h-0 invisible' : ''}`}
          >
            <div
              className={`tab tab-lg tab-bordered px-0 ${showMap ? 'tab-active text-primary' : ''}`}
              onClick={() => setShowMap(true)}
            >
              <Icon name="LuMap" size="xs" className="mr-1" />
              <b>Maps</b>
            </div>
            <div className="tab tab-lg tab-bordered px-2"></div>
            <SearchTab
              label="Cruises"
              isActive={!showMap && search.types.includes('cruise')}
              onClick={() => { setShowMap(false); setSearch({ ...search, types: ['cruise'] }); }}
              type="cruise"
              searchString={search.searchString}
              filters={search.filters}
              filterLogic={search.filterLogic}
            />
            <div className="tab tab-lg tab-bordered px-2"></div>
            <SearchTab
              label="Cores"
              isActive={!showMap && search.types.includes('core')}
              onClick={() => { setShowMap(false); setSearch({ ...search, types: ['core'] }); }}
              type="core"
              searchString={search.searchString}
              filters={search.filters}
              filterLogic={search.filterLogic}
            />
            <div className="tab tab-lg tab-bordered px-2"></div>
            <SearchTab
              label="Sections"
              isActive={!showMap && search.types.includes('section')}
              onClick={() => { setShowMap(false); setSearch({ ...search, types: ['section'] }); }}
              type="section"
              searchString={search.searchString}
              filters={search.filters}
              filterLogic={search.filterLogic}
            />
            {false && (
              <>
                <div className="tab tab-lg tab-bordered px-2"></div>
                <SearchTab
                  label="Section Halves"
                  isActive={!showMap && search.types.includes('sectionHalf')}
                  onClick={() => { setShowMap(false); setSearch({ ...search, types: ['sectionHalf'] }); }}
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
              isActive={!showMap && search.types.includes('dive')}
              onClick={() => { setShowMap(false); setSearch({ ...search, types: ['dive'] }); }}
              type="dive"
              searchString={search.searchString}
              filters={search.filters}
              filterLogic={search.filterLogic}
            />
            <div className="tab tab-lg tab-bordered px-2"></div>
            <SearchTab
              label="Rocks"
              isActive={!showMap && search.types.includes('diveSample')}
              onClick={() => { setShowMap(false); setSearch({ ...search, types: ['diveSample'] }); }}
              type="diveSample"
              searchString={search.searchString}
              filters={search.filters}
              filterLogic={search.filterLogic}
            />
            {viewRawData && (
              <>
                <div className="tab tab-lg tab-bordered px-2"></div>
                <SearchTab
                  label="Orphans"
                  isActive={!showMap && search.types.includes('file')}
                  onClick={() => { setShowMap(false); setSearch({ ...search, types: ['file', 'location'] }); }}
                  type="file"
                  searchString={search.searchString}
                  filters={search.filters}
                  filterLogic={search.filterLogic}
                />
              </>
            )}
            <div className="tab tab-lg tab-bordered flex-grow min-w-0 px-0"></div>
          </div>

          {/* Menu - shown when the tabs don't fit */}
          <div className={`${tabsOverflow ? '' : 'hidden'} relative tabs min-w-full px-0`}>
            <button
              className="tab tab-lg tab-bordered tab-active text-primary justify-between no-animation px-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="flex items-center gap-2 mr-2">
                <b>
                  {(() => {
                    if (showMap) return 'Maps';
                    if (search.types.includes('cruise')) return 'Cruises';
                    if (search.types.includes('core')) return 'Cores';
                    if (search.types.includes('section')) return 'Sections';
                    if (false && search.types.includes('sectionHalf')) return 'Section Halves';
                    if (search.types.includes('dive')) return 'Dredges/Dives';
                    if (search.types.includes('diveSample')) return 'Rocks';
                    if (search.types.includes('file')) return 'Orphans';
                    return 'Select Type';
                  })()}
                </b>
                <span className={`badge badge-primary badge-md ${showMap ? 'hidden' : ''}`}>
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
                      setShowMap(true);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center justify-between ${showMap ? 'active' : ''}`}
                  >
                    <span>Maps</span>
                  </div>
                </li>
                <li>
                  <div
                    onClick={() => {
                      setShowMap(false);
                      setSearch({ ...search, types: ['cruise'] });
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center justify-between ${!showMap && search.types.includes('cruise') ? 'active' : ''}`}
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
                      setShowMap(false);
                      setSearch({ ...search, types: ['core'] });
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center justify-between ${!showMap && search.types.includes('core') ? 'active' : ''}`}
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
                      setShowMap(false);
                      setSearch({ ...search, types: ['section'] });
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center justify-between ${!showMap && search.types.includes('section') ? 'active' : ''}`}
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
                {false && (
                  <li>
                    <div
                      onClick={() => {
                        setShowMap(false);
                        setSearch({ ...search, types: ['sectionHalf'] });
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center justify-between ${!showMap && search.types.includes('sectionHalf') ? 'active' : ''}`}
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
                      setShowMap(false);
                      setSearch({ ...search, types: ['dive'] });
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center justify-between ${!showMap && search.types.includes('dive') ? 'active' : ''}`}
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
                      setShowMap(false);
                      setSearch({ ...search, types: ['diveSample'] });
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center justify-between ${!showMap && search.types.includes('diveSample') ? 'active' : ''}`}
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
                {viewRawData && (
                  <li>
                    <div
                      onClick={() => {
                        setShowMap(false);
                        setSearch({ ...search, types: ['file', 'location'] });
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center justify-between ${!showMap && search.types.includes('file') ? 'active' : ''}`}
                    >
                      <span>Orphans</span>
                      <span className="badge badge-sm badge-outline">
                        <ItemsCount
                          searchString={search.searchString}
                          types={['file', 'location']}
                          filters={search.filters}
                          filterLogic={search.filterLogic}
                          singularLabel=""
                          pluralLabel=""
                        />
                      </span>
                    </div>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
          <div className="flex-1 overflow-auto">
          {showMap ? (
            <SearchMap
              search={search}
              onSelect={openLandingModal}
              onLayersChange={setMapLayers}
              onAreaChange={setArea}
              areaRequest={areaRequest}
              onRequestArea={() => setAreaRequest({})}
            />
          ) : (<>
          {search.types.includes('cruise') &&
            <table className="table table-compact w-full mt-0">
              <thead className="sticky top-0 z-10 bg-base-100">
                <tr>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span
                        className="cursor-pointer hover:bg-base-200"
                        onClick={() => toggleSort('alpha')}
                      >
                        Cruise {getSortIcon('alpha')}
                      </span>
                      <IdColumnFilterDropdown search={search} setSearch={setSearch} />
                    </div>
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
                      <span>Location</span>
                      <AreaColumnFilter search={search} setSearch={setSearch} onEditArea={editArea} />
                    </div>
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
                      <td className="align-top">
                        <b>{match._source._osuid}</b>
                        {match._source.collection && <><br/><span className="font-normal" title={getCollectionLabel(match._source.collection)}>{match._source.collection}</span></>}
                        {match._source._coreOSUIDs?.length > 0 && <><br/><b>Cores:</b> {numeral(match._source._coreOSUIDs.length).format(0)}</>}
                        {match._source._diveOSUIDs?.length > 0 && <><br/><b>Dredges/Dives:</b> {numeral(match._source._diveOSUIDs.length).format(0)}</>}
                        {SHOW_PUBLICATIONS && match._source._publications?.length > 0 && <><br/><b>Publications:</b> {numeral(match._source._publications.length).format(0)}</>}
                        {match._source._moratorium && <div><span className="badge btn-primary badge-tag">Moratorium</span></div>}
                        <DataIssueBadges doc={match._source} />
                      </td>
                      <td className="align-top">
                        {shown(match._source.rvName)}
                        {r2rCruiseLinks[match._source._osuid] && (
                          <div className="mt-1 flex flex-row flex-wrap gap-1">
                            {r2rCruiseLinks[match._source._osuid].map((link: string, idx: number) => (
                              <a
                                key={idx}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="badge badge-ghost badge-tag hover:badge-ghost no-underline flex items-center gap-1"
                              >
                                R2R
                                <Icon name="BiLinkExternal" size="xxs" />
                                <span className="font-normal">{link.split('/').pop()}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="align-top">
                        {!isPlaceholder(match._source.pi) && <><b>{match._source.pi}</b><br/></>}
                        {!isPlaceholder(match._source.piInstitution) && <>{match._source.piInstitution}<br/></>}
                      </td>
                      <td className="align-top">
                        <CollectionMapThumbnail locations={match._source._locations} />
                      </td>
                      <td className="align-top">
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
                            if (hasFileTypeLabel(file.type)) {
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
                                    {moratoriumCount > 0 && <span className="text-gray-500"> ({moratoriumCount})</span>}
                                  </div>
                                );
                              })}
                              {Object.entries(moratoriumFileCounts).filter(([type]) => !fileTypeCounts[type]).map(([fileType, count]) => (
                                <div key={fileType} className="text-sm">
                                  <span className="font-bold">{getFileTypeLabel(fileType)}:</span> <span className="text-gray-500">({count})</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="align-top">
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
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span
                        className="cursor-pointer hover:bg-base-200"
                        onClick={() => toggleSort('alpha')}
                      >
                        Core {getSortIcon('alpha')}
                      </span>
                      <IdColumnFilterDropdown search={search} setSearch={setSearch} />
                    </div>
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
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Location</span>
                      <AreaColumnFilter search={search} setSearch={setSearch} onEditArea={editArea} />
                    </div>
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
                      <td className="align-top">
                        <b>{match._source._osuid}</b>
                        {match._source.collection && <><br/><span className="font-normal" title={getCollectionLabel(match._source.collection)}>{match._source.collection}</span></>}
                        {match._source.nSections != null && <><br/><b>Sections:</b> {numeral(match._source.nSections).format(0)}</>}
                        {SHOW_PUBLICATIONS && match._source._publications?.length > 0 && <><br/><b>Publications:</b> {numeral(match._source._publications.length).format(0)}</>}
                        {match._source._moratorium && <div><span className="badge btn-primary badge-tag">Moratorium</span></div>}
                        <DataIssueBadges doc={match._source} />
                      </td>
                      <td className="align-top">
                        {match._source.length != null && <><b>Length:</b><br/>{formatField('length', match._source.length)} cm<br /></>}
                        {match._source.diameter != null && <><b>Diameter:</b><br/>{formatField('diameter', match._source.diameter)} cm<br /></>}
                      </td>
                      <td className="align-top">
                        {(match._source.waterDepthStart != null || match._source.waterDepthEnd != null) &&
                          <>
                            <b>Water Depth:</b><br />
                            {match._source.waterDepthStart && formatField('waterDepthStart', match._source.waterDepthStart) || ""} {match._source.waterDepthStart && match._source.waterDepthEnd && match._source.waterDepthStart !== match._source.waterDepthEnd && "-" || ""} {match._source.waterDepthEnd && match._source.waterDepthStart !== match._source.waterDepthEnd && formatField('waterDepthEnd', match._source.waterDepthEnd) || ""} m<br />
                          </>
                        }
                      </td>
                      <td className="align-top">
                        {!isPlaceholder(match._source.method) && <><b>Method:</b><br/>{match._source.method}<br/></>}
                        {!isPlaceholder(match._source.material) && <><b>Material:</b><br/>{match._source.material}<br /></>}
                      </td>
                      <DateTimeCell source={match._source} />
                      <td className="align-top">
                        <CollectionMapThumbnail
                          lat={match._source.latitudeStart || match._source.latitudeEnd}
                          lon={match._source.longitudeStart || match._source.longitudeEnd}
                        />
                      </td>
                      <td className="align-top">
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
                            if (hasFileTypeLabel(file.type)) {
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
                                    {moratoriumCount > 0 && <span className="text-gray-500"> ({moratoriumCount})</span>}
                                  </div>
                                );
                              })}
                              {Object.entries(moratoriumFileCounts).filter(([type]) => !fileTypeCounts[type]).map(([fileType, count]) => (
                                <div key={fileType} className="text-sm">
                                  <span className="font-bold">{getFileTypeLabel(fileType)}:</span> <span className="text-gray-500">({count})</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="align-top">
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
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span
                        className="cursor-pointer hover:bg-base-200"
                        onClick={() => toggleSort('alpha')}
                      >
                        Section {getSortIcon('alpha')}
                      </span>
                      <IdColumnFilterDropdown search={search} setSearch={setSearch} />
                    </div>
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
                      <span>Location</span>
                      <AreaColumnFilter search={search} setSearch={setSearch} onEditArea={editArea} />
                    </div>
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
                      <td className="align-top">
                        <b>{match._source._osuid}</b>
                        {match._source.collection && <><br/><span className="font-normal" title={getCollectionLabel(match._source.collection)}>{match._source.collection}</span></>}
                        {match._source.nSections != null && <><br/><b>Sections:</b> {numeral(match._source.nSections).format(0)}</>}
                        {SHOW_PUBLICATIONS && match._source._publications?.length > 0 && <><br/><b>Publications:</b> {numeral(match._source._publications.length).format(0)}</>}
                        {match._source._moratorium && <div><span className="badge btn-primary badge-tag">Moratorium</span></div>}
                        <DataIssueBadges doc={match._source} />
                      </td>
                      <td className="align-top">
                        {match._source.depthTop != null && match._source.depthBottom != null &&
                          <>
                            <b>Length:</b><br />
                            {formatField('length', parseFloat(match._source.depthBottom) - parseFloat(match._source.depthTop))} cm<br />
                          </>
                        }
                      </td>
                      <td className="align-top">
                        {(match._source.depthTop != null || match._source.depthBottom != null) &&
                          <>
                            <b>Core Depth:</b><br />
                            {match._source.depthTop && formatField('depthTop', match._source.depthTop) || ""} {match._source.depthTop && match._source.depthBottom && "-" || ""} {match._source.depthBottom && formatField('depthBottom', match._source.depthBottom) || ""} cm<br />
                          </>
                        }
                      </td>
                      <td className="align-top">
                        <CollectionMapThumbnail
                          lat={match._source.latitudeStart || match._source.latitudeEnd}
                          lon={match._source.longitudeStart || match._source.longitudeEnd}
                        />
                      </td>
                      <td className="align-top">
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
                            if (hasFileTypeLabel(file.type)) {
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
                                    {moratoriumCount > 0 && <span className="text-gray-500"> ({moratoriumCount})</span>}
                                  </div>
                                );
                              })}
                              {Object.entries(moratoriumFileCounts).filter(([type]) => !fileTypeCounts[type]).map(([fileType, count]) => (
                                <div key={fileType} className="text-sm">
                                  <span className="font-bold">{getFileTypeLabel(fileType)}:</span> <span className="text-gray-500">({count})</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="align-top">
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
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span
                        className="cursor-pointer hover:bg-base-200"
                        onClick={() => toggleSort('alpha')}
                      >
                        Section Half {getSortIcon('alpha')}
                      </span>
                      <IdColumnFilterDropdown search={search} setSearch={setSearch} />
                    </div>
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
                          <td className="align-top">
                            <b>{match._source._osuid}</b>
                            {match._source.collection && <><br/><span className="font-normal" title={getCollectionLabel(match._source.collection)}>{match._source.collection}</span></>}
                            {match._source.nSections != null && <><br /><b>Sections:</b> {numeral(match._source.nSections).format(0)}</>}
                            {SHOW_PUBLICATIONS && match._source._publications?.length > 0 && <><br/><b>Publications:</b> {numeral(match._source._publications.length).format(0)}</>}
                            {match._source._moratorium && <div><span className="badge btn-primary badge-tag">Moratorium</span></div>}
                        <DataIssueBadges doc={match._source} />
                          </td>
                          <td className="align-top">
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
                                if (hasFileTypeLabel(file.type)) {
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
                                        {moratoriumCount > 0 && <span className="text-gray-500"> ({moratoriumCount})</span>}
                                      </div>
                                    );
                                  })}
                                  {Object.entries(moratoriumFileCounts).filter(([type]) => !fileTypeCounts[type]).map(([fileType, count]) => (
                                    <div key={fileType} className="text-sm">
                                      <span className="font-bold">{getFileTypeLabel(fileType)}:</span> <span className="text-gray-500">({count})</span>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </td>
                          <td className="align-top">
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
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span
                        className="cursor-pointer hover:bg-base-200"
                        onClick={() => toggleSort('alpha')}
                      >
                        Rock {getSortIcon('alpha')}
                      </span>
                      <IdColumnFilterDropdown search={search} setSearch={setSearch} />
                    </div>
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
                      <span>Location</span>
                      <AreaColumnFilter search={search} setSearch={setSearch} onEditArea={editArea} />
                    </div>
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
                  {matches.map((match, key) => (
                  <>
                    <tr key={key} className="hover cursor-pointer" onClick={() => {
                      openLandingModal(match._source._osuid);
                    }}>
                      <td className="align-top">
                        <b>{match._source._osuid}</b>
                        {match._source.collection && <><br/><span className="font-normal" title={getCollectionLabel(match._source.collection)}>{match._source.collection}</span></>}
                        {SHOW_PUBLICATIONS && match._source._publications?.length > 0 && <><br/><b>Publications:</b> {numeral(match._source._publications.length).format(0)}</>}
                        {match._source._moratorium && <div><span className="badge btn-primary badge-tag">Moratorium</span></div>}
                        <DataIssueBadges doc={match._source} />
                      </td>
                      <td className="align-top">
                        {!isPlaceholder(match._source.method) && <><b>Method:</b><br/>{match._source.method}<br/></>}
                        {!isPlaceholder(match._source.material) && <><b>Material:</b><br/>{match._source.material}<br /></>}
                      </td>
                      <td className="align-top">
                        <CollectionMapThumbnail locations={match._source._locations} lat={match._source.latitudeStart || match._source.latitudeEnd} lon={match._source.longitudeStart || match._source.longitudeEnd} />
                      </td>
                      <td className="align-top">
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
                            if (hasFileTypeLabel(file.type)) {
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
                                    {moratoriumCount > 0 && <span className="text-gray-500"> ({moratoriumCount})</span>}
                                  </div>
                                );
                              })}
                              {Object.entries(moratoriumFileCounts).filter(([type]) => !fileTypeCounts[type]).map(([fileType, count]) => (
                                <div key={fileType} className="text-sm">
                                  <span className="font-bold">{getFileTypeLabel(fileType)}:</span> <span className="text-gray-500">({count})</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="align-top">
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
          {viewRawData && matches.length > 0 && search.types.includes('file') &&
            <table className="table table-compact w-full mt-0">
              <thead className="sticky top-0 z-10 bg-base-100">
                <tr>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span
                        className="cursor-pointer hover:bg-base-200"
                        onClick={() => toggleSort('alpha')}
                      >
                        OSU-ID referenced {getSortIcon('alpha')}
                      </span>
                      <IdColumnFilterDropdown search={search} setSearch={setSearch} />
                    </div>
                  </th>
                  <th className="rounded-none">Cruise</th>
                  <th className="rounded-none">File / Storage location</th>
                  <th className="rounded-none">Issues</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match, key) => {
                  const files = [
                    ...(match._source._files || []).map((f: any) => ({ ...f, moratorium: false })),
                    ...(match._source._moratorium_files || []).map((f: any) => ({ ...f, moratorium: true })),
                  ];
                  return (
                    <tr key={key}>
                      <td className="align-top overflow-hidden text-ellipsis max-w-0">
                        <b>{match._source._osuid}</b>
                        {match._source.collection && <><br/><span className="font-normal" title={getCollectionLabel(match._source.collection)}>{match._source.collection}</span></>}
                        {SHOW_PUBLICATIONS && match._source._publications?.length > 0 && <><br/><b>Publications:</b> {numeral(match._source._publications.length).format(0)}</>}
                        {match._source._moratorium && <div><span className="badge btn-primary badge-tag">Moratorium</span></div>}
                        <DataIssueBadges doc={match._source} />
                      </td>
                      <td className="align-top">
                        {match._source._cruiseID
                          ? <a className="link" onClick={(e) => { e.stopPropagation(); openLandingModal(`OSU-${match._source._cruiseID}`); }}>OSU-{match._source._cruiseID}</a>
                          : <span className="text-gray-500">—</span>}
                      </td>
                      <td className="align-top break-all">
                        {files.map((f: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            <span className="font-bold">{getFileTypeLabel(f.type)}:</span>{' '}
                            <span className="font-mono text-xs">{f.path}</span>
                            {f.moratorium && <span className="badge badge-ghost badge-tag ml-1">moratorium</span>}
                          </div>
                        ))}
                        {match._source._docType === 'location' && (() => {
                          // storageLocation is a list of "<rack slot>-<tote>" strings with
                          // parallel toteId / palletName lists (single strings in old indexes).
                          const asList = (v: any) => (Array.isArray(v) ? v : v ? [v] : []);
                          const slots = asList(match._source.storageLocation);
                          const totes = asList(match._source.toteId);
                          const pallets = asList(match._source.palletName);
                          return (slots.length ? slots : ['—']).map((slot: string, idx: number) => (
                            <div key={`loc-${idx}`} className="text-sm">
                              <span className="font-bold">Location:</span>{' '}
                              <span className="font-mono text-xs">{slot}</span>
                              {pallets[idx] && <span className="ml-2">pallet <span className="font-mono text-xs">{pallets[idx]}</span></span>}
                              {totes[idx] && <span className="ml-2">tote <span className="font-mono text-xs">{totes[idx]}</span></span>}
                            </div>
                          ));
                        })()}
                        {match._source._docType === 'location' && match._source.weight != null && (
                          <div className="text-sm"><span className="font-bold">Weight:</span> {formatField('weight', match._source.weight)}</div>
                        )}
                      </td>
                      <td className="align-top text-sm">
                        {(match._source._errors || []).map((m: string, idx: number) => (
                          <div key={`e-${idx}`} className="text-error">{m}</div>
                        ))}
                        {(match._source._warnings || []).map((m: string, idx: number) => (
                          <div key={`w-${idx}`} className="text-warning">{m}</div>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          }

          {matches.length > 0 && search.types.includes('diveSample') &&
            <table className="table table-compact w-full mt-0">
              <thead className="sticky top-0 z-10 bg-base-100">
                <tr>
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span
                        className="cursor-pointer hover:bg-base-200"
                        onClick={() => toggleSort('alpha')}
                      >
                        Rock Sample {getSortIcon('alpha')}
                      </span>
                      <IdColumnFilterDropdown search={search} setSearch={setSearch} />
                    </div>
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
                  <th className="rounded-none">
                    <div className="flex items-center gap-1">
                      <span>Location</span>
                      <AreaColumnFilter search={search} setSearch={setSearch} onEditArea={editArea} />
                    </div>
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
                  {matches.map((match, key) => (
                  <>
                    <tr key={key} className="hover cursor-pointer" onClick={() => {
                      openLandingModal(match._source._osuid);
                    }}>
                      <td className="align-top">
                        <b>{match._source._osuid}</b>
                        {match._source.collection && <><br/><span className="font-normal" title={getCollectionLabel(match._source.collection)}>{match._source.collection}</span></>}
                        {SHOW_PUBLICATIONS && match._source._publications?.length > 0 && <><br/><b>Publications:</b> {numeral(match._source._publications.length).format(0)}</>}
                        {match._source._moratorium && <div><span className="badge btn-primary badge-tag">Moratorium</span></div>}
                        <DataIssueBadges doc={match._source} />
                      </td>
                      <DateTimeCell source={match._source} />
                      <td className="align-top">
                        {(() => {
                          const ws = match._source.waterDepthStart;
                          const we = match._source.waterDepthEnd;
                          if (ws != null || we != null) {
                            const left = ws != null ? formatField('waterDepthStart', ws) : '';
                            const right = we != null && ws !== we ? formatField('waterDepthEnd', we) : '';
                            return <span>{left}{(ws != null && we != null && ws !== we) ? ' to ' : ''}{right} m</span>;
                          }
                          return <span className="text-gray-500">—</span>;
                        })()}
                      </td>
                      <td className="align-top">{shown(match._source.texture) || <span className="text-gray-500">—</span>}</td>
                      <td className="align-top">
                        <CollectionMapThumbnail
                          lat={match._source.latitudeStart || match._source.latitudeEnd}
                          lon={match._source.longitudeStart || match._source.longitudeEnd}
                        />
                      </td>
                      <td className="align-top">
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
                            if (hasFileTypeLabel(file.type)) {
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
                                    {moratoriumCount > 0 && <span className="text-gray-500"> ({moratoriumCount})</span>}
                                  </div>
                                );
                              })}
                              {Object.entries(moratoriumFileCounts).filter(([type]) => !fileTypeCounts[type]).map(([fileType, count]) => (
                                <div key={fileType} className="text-sm">
                                  <span className="font-bold">{getFileTypeLabel(fileType)}:</span> <span className="text-gray-500">({count})</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="align-top">
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
              search.filters?.textures?.length > 0 ||
              search.filters?.dataIssues?.length > 0 ||
              search.filters?.links?.length > 0 ||
              search.filters?.collections?.length > 0) && (
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
                                textures: [],
                                dataIssues: [],
                                links: [],
                                collections: []
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

                    {/* Collections Filters */}
                    {search.filters?.collections?.map((code: string) => (
                      <div key={`collection-${code}`} className="form-control">
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
                                  collections: search.filters.collections.filter((c: string) => c !== code)
                                }
                              });
                            }}
                          />
                          <span className="label-text text-sm flex-1 break-words"><strong>Collection:</strong> {getCollectionLabel(code)}</span>
                        </label>
                      </div>
                    ))}

                    {/* Links Filters */}
                    {search.filters?.links?.map((link: string) => (
                      <div key={`link-${link}`} className="form-control">
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
                                  links: search.filters.links.filter((l: string) => l !== link)
                                }
                              });
                            }}
                          />
                          <span className="label-text text-sm flex-1 break-words"><strong>Links:</strong> {getLinkLabel(link)}</span>
                        </label>
                      </div>
                    ))}

                    {/* Data Issues Filters (dev only) */}
                    {search.filters?.dataIssues?.map((issue: string) => (
                      <div key={`dataIssue-${issue}`} className="form-control">
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
                                  dataIssues: search.filters.dataIssues.filter((i: string) => i !== issue)
                                }
                              });
                            }}
                          />
                          <span className="label-text text-sm flex-1 break-words"><strong>Data Issues:</strong> {issue === 'errors' ? 'Has errors' : 'Has warnings'}</span>
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
          </>)}
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
          <div className="flex items-center justify-center min-h-screen px-2 pt-24 pb-4 sm:px-8 sm:py-24">
            <div
              className="relative bg-base-100 rounded-2xl shadow-2xl max-w-7xl w-full h-[calc(100vh-7rem)] sm:h-[calc(100vh-12rem)] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Title and Close Button */}
              <div className="relative border-b border-base-300">
                <div className="flex justify-between items-start gap-2 p-4 sm:p-6">
                  {/* On narrow screens the h2 takes the full width so Copy Link wraps
                      onto its own line, right-aligned under the title; from sm up the
                      two sit side by side on the left as before. */}
                  <div className="flex flex-wrap items-center justify-end sm:justify-start gap-x-3 gap-y-1 flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-primary m-0 w-full sm:w-auto break-words">
                      {getDocTypeLabel(currentDoc?._docType, currentDoc?.method)} {osuId || currentDoc?._osuid}
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
              {/* Body: the tab panel scrolls on its own, between the tabs and the
                  download footer. */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Content */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <LandingPage
                    data={{}}
                    osuId={osuId}
                    compact
                    onDocumentLoaded={(doc) => setCurrentDoc(doc)}
                    onNavigateToChild={(childOsuId) => {
                      setOsuId(childOsuId);
                    }}
                    onFilter={applyDetailFilter}
                  />
                </div>
              </div>

              {/* Footer: download menus scoped to this record and everything
                  under it (an OSU ID search matches the record and its
                  descendants by ID prefix), with no other filters applied. */}
              {osuId && (
                <div className="shrink-0 border-t border-base-300 px-4 py-3 flex flex-wrap justify-end gap-2 bg-base-100">
                  <DownloadRowsButton
                    search={{
                      ...search,
                      searchString: osuId,
                      filters: Object.fromEntries(Object.keys(search.filters || {}).map((k) => [k, []])),
                    }}
                    searchString={osuId}
                    dropUp
                  />
                  <DownloadFilesButton
                    search={{
                      ...search,
                      searchString: osuId,
                      filters: Object.fromEntries(Object.keys(search.filters || {}).map((k) => [k, []])),
                    }}
                    searchString={osuId}
                    dropUp
                  />
                </div>
              )}
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
