import _ from 'lodash';
import numeral from 'numeral';
import React, { useState, useCallback, useEffect } from "react";
import useLocalStorage from '../hooks/useLocalStorage';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-hook-inview';
import { Section } from "../util/section";
import { Container } from "../util/container";
import { ItemsCount } from '../util/items-count';
import { CollectionFileButton } from '../util/collection-file-button';
import { CollectionMapThumbnail } from '../util/collection-map-thumbnail';
import { Icon } from "../util/icon";

const viewRawData = false; // Set to true to view raw data in the search results

export const Search: React.FC<{ data: any }> = ({
    data
}) => {
  const pageSize = 10;
  const [search, setSearch] = useLocalStorage('search-2025-06-11', {
    sortOrder: 'alpha asc',
    searchString: '',
    types: ['cruise'],
  });
  const [searchString, setSearchString] = useState(search.searchString || '');
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
      const res = await fetch('/api/es?search', {
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
  
  useEffect(() => {
    if (isVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

  console.log('Search State:', {
    types: search.types,
    matchesCount: matches.length,
    isLoadingQuery,
    isFetchingNextPage,
    hasNextPage,
    currentSearchString: searchString,
    currentSearchStringLength: searchString.length,
    searchParams: search
  });
  
    return <>
    <Section>
      <Container className="my-4 prose" width="medium">
        <h3>Search OSU-MGR Collections</h3>
        <div className="form-control">
          <div className="input-group flex">
            <input type="text"
              placeholder="Search Collections..." className="input input-bordered flex-grow"
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
          <div
            className={"tab tab-lg tab-bordered" + (search.types.includes('cruise') ? ' tab-active text-primary' : '')}
            onClick={() => {
              setSearch({ ...search, types: ['cruise'] });
            }}
          >
            <b>Cruises/Programs</b>
              <span className={"badge badge-md mx-2 " + (search.types.includes('cruise') ? 'badge-primary' : 'badge-outline')}>
              <ItemsCount
                searchString={search.searchString}
                types={['cruise']}
                singularLabel=""
                pluralLabel=""
              />
            </span>
          </div>
          <div
            className={"tab tab-lg tab-bordered" + (search.types.includes('core') ? ' tab-active text-primary' : '')}
            onClick={() => {
              setSearch({ ...search, types: ['core'] });
            }}
          >
            <b>Cores</b>
            <span className={"badge badge-md mx-2 " + (search.types.includes('core') ? 'badge-primary' : 'badge-outline')}>
              <ItemsCount
                searchString={search.searchString}
                types={['core']}
                singularLabel=""
                pluralLabel=""
              />
            </span>
          </div>
          <div
            className={"tab tab-lg tab-bordered" + (search.types.includes('dive') ? ' tab-active text-primary' : '')}
            onClick={() => {
              setSearch({ ...search, types: ['dive'] });
            }}
          >
            <b>Rocks</b>
              <span className={"badge badge-md mx-2 " + (search.types.includes('dive') ? 'badge-primary' : 'badge-outline')}>
              <ItemsCount
                searchString={search.searchString}
                types={['dive']}
                singularLabel=""
                pluralLabel=""
              />
            </span>
          </div>
          <div className="tab tab-lg tab-bordered flex-grow"></div>  
        </div>
        <div className="min-h-[500px]">
          {matches.length > 0 && search.types.includes('cruise') &&
            <table className="table table-compact w-full mt-0">
              <thead>
                <tr>
                  <th className="rounded-none">Cruise</th> 
                  <th className="rounded-none">RV Name</th> 
                  <th className="rounded-none">Documents</th>
                </tr>
              </thead> 
              <tbody>
                { matches.map((match, key) => (
                  <>
                    <tr key={key} className="hover cursor-pointer" onClick={() => {
                      window.location.href = `/${match._source._osuid}`;
                    }}>
                      <td><b>{match._source._osuid}</b></td>
                      <td>{match._source.rvName}</td>
                      <td>
                        <CollectionFileButton
                          name="Cruise Report"
                          icon="TbFileDescription"
                          file={`${match._source._cruiseID}/cruisereport/OSU-${match._source._cruiseID}-cruisereport.pdf`}
                        />
                      </td>
                    </tr>
                    {viewRawData &&
                      <tr key={`${key}-rawresults`}>
                        <td colSpan={3}>
                          <pre><code className="flex flex-col gap-2">
                            {JSON.stringify(match._source, null, 2)}
                          </code></pre>
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
                  <th className="rounded-none">Collection</th>
                  <th className="rounded-none">Location</th>
                </tr>
              </thead> 
              <tbody>
                  {matches.map((match, key) => (
                  <>
                    <tr key={key} className="hover cursor-pointer" onClick={() => {
                      window.location.href = `/${match._source._osuid}`;
                    }}>
                      <td>
                        <b>{match._source._osuid}</b>
                        {match._source.nSections != null && <><br/><b>Sections:</b> {numeral(match._source.nSections).format(0)}</>}
                      </td>
                      <td>
                        {match._source.length != null && <><b>Length:</b><br/>{numeral(match._source.length).format(0.00)} cm<br /></>}
                        {match._source.diameter != null && <><b>Diameter:</b><br/>{numeral(match._source.diameter).format(0.00)} cm<br /></>}
                      </td>
                      <td>
                        {match._source.material != null && <><b>Material:</b><br/>{match._source.material}<br /></>}
                        {match._source.method != null && <><b>Method:</b><br/>{match._source.method}<br/></>}
                      </td>
                      <td>
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
                    </tr>
                    { viewRawData &&
                      <tr key={`${key}-raw`}>
                        <td colSpan={4}>
                          <pre><code className="flex flex-col gap-2">
                            {JSON.stringify(match._source, null, 2)}
                          </code></pre>
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
                  <th className="rounded-none">Dive</th>
                  <th className="rounded-none">Method</th>
                  <th className="rounded-none">Weight (kg)</th>
                  <th className="rounded-none">Area</th>
                </tr>
              </thead> 
              <tbody>
                  {matches.map((match, key) => (
                  <>
                    <tr key={key} className="hover cursor-pointer" onClick={() => {
                      window.location.href = `/${match._source._osuid}`;
                    }}>
                      <td><b>{match._source._osuid}</b></td>
                      <td>{match._source.method}</td>
                      <td>{match._source.weight == null ? '' : numeral(match._source.weight).format('0.00')}</td>
                      <td>{match._source.area}</td>
                    </tr>
                    { viewRawData &&
                      <tr key={`${key}-rawresults`}>
                        <td colSpan={4}>
                          <pre><code className="flex flex-col gap-2">
                            {JSON.stringify(match._source, null, 2)}
                          </code></pre>
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
            <div className="flex justify-center items-center min-h-[200px]">
              <span className="text-gray-500">No results found for "{search.searchString}"</span>
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
        {/* Infinite scroll trigger: only show if there are more pages to load */}
        {hasNextPage && <div ref={ref} className="h-1" /> }
      </Container>
        </Section>
    </>;
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