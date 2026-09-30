import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@opensearch-project/opensearch';
import { r2rCruiseLinks } from '../../components/search/search-data';

const client: Client = new Client({
  node: process.env.OS_NODE,
});
const isProd = process.env.NEXT_PUBLIC_TINA_BRANCH === 'prod';
const index = isProd ? 'osu-mgr' : 'osu-mgr-dev';
// Publications are non-prod only for now (see SHOW_PUBLICATIONS in
// components/search/search-data.ts): prod neither filters, matches nor
// suggests them.
const showPublications = !isProd;

// Records the pipeline flagged with data-quality errors (e.g. "Not in any
// metadata sheet") are only surfaced on non-prod deployments, where the
// Data Issues filter lets curators find and fix them. On prod they are
// hidden from every query (results, counts and facet aggregations).
const HIDE_FLAGGED_ON_PROD = [{ exists: { field: '_errors' } }];
function guardQuery(query: any): any {
  if (!isProd) return query;
  return { bool: { must: [query], must_not: HIDE_FLAGGED_ON_PROD } };
}

// Dev-only "Data Issues" filter: errors | warnings (OR between selected)
function dataIssuesFilter(search: any): any | null {
  const issues: string[] = search?.filters?.dataIssues || [];
  if (isProd || issues.length === 0) return null;
  const should = [];
  if (issues.includes('errors')) should.push({ exists: { field: '_errors' } });
  if (issues.includes('warnings')) should.push({ exists: { field: '_warnings' } });
  if (should.length === 0) return null;
  return { bool: { should, minimum_should_match: 1 } };
}

// "Links" filter: records with a link to outside data. R2R links are keyed by
// cruise OSU ID (see r2rCruiseLinks) and apply to every record from that cruise,
// which children store without the "OSU-" prefix in `cruise`.
const R2R_CRUISES = Object.keys(r2rCruiseLinks);
const LINK_QUERIES: { [link: string]: any } = {
  r2r: { bool: { should: [
    { terms: { '_osuid.keyword': R2R_CRUISES } },
    { terms: { 'cruise.keyword': R2R_CRUISES.map(id => id.replace(/^OSU-/, '')) } },
  ], minimum_should_match: 1 } },
  ...(showPublications ? { publication: { exists: { field: '_publications.doi' } } } : {}),
};

// Links filter: r2r | publication, combined with the Links AND/OR logic.
function linksFilter(search: any): any | null {
  const links: string[] = (search?.filters?.links || []).filter((l: string) => LINK_QUERIES[l]);
  if (links.length === 0) return null;
  const queries = links.map(l => LINK_QUERIES[l]);
  if (search.filterLogic?.links === 'AND') return { bool: { must: queries } };
  return { bool: { should: queries, minimum_should_match: 1 } };
}

// Collection filter: records in any of the selected collections (MGG, ACC, ...).
// A record belongs to one collection, so there is no AND logic.
function collectionsFilter(search: any): any | null {
  const collections: string[] = search?.filters?.collections || [];
  if (collections.length === 0) return null;
  return { terms: { 'collection.keyword': collections } };
}

// Maps tab: restrict to records the map can plot (a start or end lat/lon).
function hasCoordinatesFilter(search: any): any | null {
  if (!search?.hasCoordinates) return null;
  return { bool: { must: [
    { bool: { should: [{ exists: { field: 'latitudeStart' } }, { exists: { field: 'latitudeEnd' } }], minimum_should_match: 1 } },
    { bool: { should: [{ exists: { field: 'longitudeStart' } }, { exists: { field: 'longitudeEnd' } }], minimum_should_match: 1 } },
  ] } };
}

// Geospatial filter: filters.area is [west, south, east, north] in degrees,
// with east past 180 when the area crosses the antimeridian. A record matches
// when its Start or End position is inside. Coordinates are text in the index,
// so a script parses them. A cruise's own coordinates span its whole voyage,
// so a cruise matches when any of its cores or dives does (areaCruiseUUIDs).
const AREA_SCRIPT = `
boolean inArea(def lats, def lons, def area) {
  if (lats.size() == 0 || lons.size() == 0) return false;
  double lat;
  double lon;
  try {
    lat = Double.parseDouble(lats.value.trim().replace(',', '.'));
    lon = Double.parseDouble(lons.value.trim().replace(',', '.'));
  } catch (NumberFormatException e) {
    return false;
  }
  if (lon > 180) lon -= 360;
  if (lat < area.south || lat > area.north) return false;
  return (lon >= area.west && lon <= area.east) || (lon + 360 >= area.west && lon + 360 <= area.east);
}
return inArea(doc['latitudeStart.keyword'], doc['longitudeStart.keyword'], params)
  || inArea(doc['latitudeEnd.keyword'], doc['longitudeEnd.keyword'], params);
`;
function areaOf(search: any): { west: number; south: number; east: number; north: number } | null {
  const area = search?.filters?.area;
  if (!Array.isArray(area) || area.length !== 4 || !area.every((v: any) => Number.isFinite(v))) return null;
  const [west, south, east, north] = area;
  return south <= north && west <= east ? { west, south, east, north } : null;
}
const areaScript = (area: object) => ({ script: { script: { source: AREA_SCRIPT, lang: 'painless', params: area } } });
async function areaCruiseUUIDs(search: any): Promise<string[] | null> {
  const area = areaOf(search);
  if (!area || !search.types?.includes('cruise')) return null;
  const response = await client.search({ index, body: {
    size: 0,
    query: guardQuery({ bool: { filter: [{ terms: { '_docType.keyword': ['core', 'dive'] } }, areaScript(area)] } }),
    aggs: { cruises: { terms: { field: '_cruiseUUID.keyword', size: 10000 } } },
  } } as any);
  return ((response.body.aggregations?.cruises as any)?.buckets || []).map((b: any) => b.key);
}
function areaFilter(search: any): any | null {
  const area = areaOf(search);
  if (!area) return null;
  const cruises: string[] | null = search._areaCruiseUUIDs;
  if (!cruises) return areaScript(area);
  return { bool: { should: [
    { bool: { must_not: [{ term: { '_docType.keyword': 'cruise' } }], filter: [areaScript(area)] } },
    { bool: { filter: [{ term: { '_docType.keyword': 'cruise' } }, { terms: { '_uuid.keyword': cruises } }] } },
  ], minimum_should_match: 1 } };
}

// Position filters: the Maps tab's (hasCoordinates) and the geospatial one.
function coordinatesFilter(search: any): any | null {
  const filters = [hasCoordinatesFilter(search), areaFilter(search)].filter(Boolean);
  if (filters.length === 0) return null;
  return filters.length === 1 ? filters[0] : { bool: { must: filters } };
}

const cruisesFirst = {
  "_script": {
    "order": "asc",
    "type": "number",
    "script": "return doc['_docType.keyword'].value == 'cruise' ? 0 : 1"
  }
};
const sortOrders = {
	'modified asc': [cruisesFirst, { _modified: 'asc' }],
  'modified desc': [cruisesFirst, { _modified: 'desc' }],
  'alpha asc': [cruisesFirst, { '_osuid.keyword': 'asc' }],
  'alpha desc': [cruisesFirst, { '_osuid.keyword': 'desc' }],
  'ids asc': [cruisesFirst, 
    { 'cruise.keyword': 'asc' },
    { _coreNumber: 'asc' },
    { _sectionNumber: 'asc' },
    { _diveNumber: 'asc' },
    { _diveSampleNumber: 'asc' },
    { '_osuid.keyword': 'asc' },
  ],
  'ids desc': [cruisesFirst, 
    { 'cruise.keyword': 'desc' },
    { _coreNumber: 'desc' },
    { _sectionNumber: 'desc' },
    { _diveNumber: 'desc' },
    { _diveSampleNumber: 'desc' },
    { '_osuid.keyword': 'desc' },
  ],
  // Additional sort orders for table columns
  'rvName asc': [cruisesFirst, { 'rvName.keyword': 'asc' }],
  'rvName desc': [cruisesFirst, { 'rvName.keyword': 'desc' }],
  'method asc': [cruisesFirst, { 'method.keyword': 'asc' }],
  'method desc': [cruisesFirst, { 'method.keyword': 'desc' }],
  'texture asc': [cruisesFirst, { 'texture.keyword': 'asc' }],
  'texture desc': [cruisesFirst, { 'texture.keyword': 'desc' }],
  'weight asc': [cruisesFirst, { 'weight': 'asc' }],
  'weight desc': [cruisesFirst, { 'weight': 'desc' }],
  'depth asc': [cruisesFirst, { 'depthTop.keyword': 'asc' }],
  'depth desc': [cruisesFirst, { 'depthTop.keyword': 'desc' }],
};

const OSUID_LIST_FIELDS = [
  '_coreOSUIDs', '_sectionOSUIDs', '_sectionHalfOSUIDs', '_coreSampleOSUIDs',
  '_diveOSUIDs', '_diveSampleOSUIDs', '_diveSubsampleOSUIDs',
  '_cruiseOSUID', '_coreOSUID', '_sectionOSUID', '_sectionHalfOSUID',
  '_diveOSUID', '_diveSampleOSUID',
];

// Strip DOI URL / "doi:" prefixes so https://doi.org/10.1016/x, doi:10.1016/x
// and 10.1016/x all search the same stored value.
function normalizeDoi(s: string): string {
  return s.trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '');
}

function buildPublicationShould(searchString: string) {
  const doi = normalizeDoi(searchString);
  return [
    // Citation text: authors, year, title, journal, volume/pages (all terms must appear).
    { match: { '_publications.citation': { query: searchString, operator: 'and' } } },
    ...(/^10\.\S+$/.test(doi) ? [
      { term: { '_publications.doi': { value: doi, case_insensitive: true } } },
      { prefix: { '_publications.doi': { value: doi, case_insensitive: true } } },
    ] : []),
  ];
}

function buildShould(searchString: string) {
  const upper = searchString.toUpperCase();
  return [
    ...(showPublications ? buildPublicationShould(searchString) : []),
    {
      multi_match: {
        query: searchString.toLowerCase(),
        type: 'bool_prefix',
        fields: ['*.substring'],
        operator: 'and',
        analyzer: 'whitespace',
      },
    },
    { prefix: { '_osuid.keyword': { value: upper } } },
    // Query both bare field (current keyword mapping) and .keyword sub-field (post-reindex text mapping)
    ...OSUID_LIST_FIELDS.flatMap(f => [
      { prefix: { [f]: { value: upper } } },
      { prefix: { [`${f}.keyword`]: { value: upper } } },
    ]),
  ];
}

// Search-as-you-type suggestions for the search bar: matching OSU IDs, RV names
// and publications (citation text or DOI). Publications are flattened out of the
// matching docs and re-checked so only the publication that matched is suggested.
async function suggest(q: string) {
  const text = (q || '').trim();
  if (text.length < 2) return { ids: [], rvNames: [], publications: [] };
  const upper = text.toUpperCase();
  const lower = text.toLowerCase();
  const doi = normalizeDoi(text).toLowerCase();
  const isDoi = /^10\.\S+$/.test(doi);

  const [idResp, rvResp, pubResp] = await Promise.all([
    client.search({ index, body: {
      size: 6,
      _source: ['_osuid', '_docType'],
      // Any substring of the ID matches; IDs starting with the text (with or
      // without the "OSU-" prefix) rank first.
      query: guardQuery({ bool: { minimum_should_match: 1, should: [
        { constant_score: { boost: 3, filter: { prefix: { '_osuid.keyword': { value: upper } } } } },
        { constant_score: { boost: 2, filter: { prefix: { '_osuid.keyword': { value: `OSU-${upper}` } } } } },
        { constant_score: { boost: 1, filter: { match: { '_osuid.substring': { query: lower, operator: 'and', analyzer: 'whitespace' } } } } },
      ] } }),
      sort: ['_score', cruisesFirst, { '_osuid.keyword': 'asc' }],
    } } as any),
    client.search({ index, body: {
      size: 0,
      query: guardQuery({ match: { 'rvName.substring': { query: lower, operator: 'and', analyzer: 'whitespace' } } }),
      aggs: { rvNames: { terms: { field: 'rvName.keyword', size: 4 } } },
    } } as any),
    showPublications ? client.search({ index, body: {
      size: 20,
      _source: ['_publications'],
      query: guardQuery({ bool: { minimum_should_match: 1, should: [
        { match_bool_prefix: { '_publications.citation': { query: text, operator: 'and' } } },
        ...(isDoi ? [{ prefix: { '_publications.doi': { value: doi, case_insensitive: true } } }] : []),
      ] } }),
    } } as any) : Promise.resolve(null),
  ]);

  const ids = (idResp.body.hits.hits as any[]).map(h => ({ osuid: h._source._osuid, docType: h._source._docType }));
  const rvNames = ((rvResp.body.aggregations?.rvNames as any)?.buckets || []).map((b: any) => ({ name: b.key, count: b.doc_count }));

  const tokens = lower.split(/\s+/).filter(Boolean);
  const seen = new Set<string>();
  const publications: { doi: string; citation: string }[] = [];
  for (const hit of (pubResp?.body.hits.hits || []) as any[]) {
    for (const pub of hit._source._publications || []) {
      const key = (pub.doi || '').toLowerCase();
      if (!key || seen.has(key)) continue;
      const citation = (pub.citation || '').toLowerCase();
      const matches = (isDoi && key.startsWith(doi)) || tokens.every(t => citation.includes(t));
      if (!matches) continue;
      seen.add(key);
      publications.push({ doi: pub.doi, citation: pub.citation });
      if (publications.length >= 5) break;
    }
    if (publications.length >= 5) break;
  }
  return { ids, rvNames, publications };
}

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'POST') return res.status(405).send({ message: 'Only POST requests allowed' });
  const search = req.body;
  if (!search) return res.status(500).send('Missing search query');

  if (req.query.suggest !== undefined) {
    try {
      return res.status(200).send(await suggest(search.searchString));
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      return res.status(200).send({ ids: [], rvNames: [], publications: [] });
    }
  }

  // Cruises the geospatial filter matches, looked up once for every query below.
  try {
    search._areaCruiseUUIDs = await areaCruiseUUIDs(search);
  } catch (error) {
    console.error('Error finding cruises in the filter area:', error);
    return res.status(500).send('Failed to apply the area filter');
  }

  let query: any = {}
  if (search.terms !== undefined) {
    query = {
      bool: {
        must: [
          { terms: { '_docType.keyword': search.types } },
          { terms: search.terms }
        ]
      }
    };
  } else if (search.searchString === '') {
    query = { terms: { '_docType.keyword': search.types } };
  } else {
    query = {
      bool: {
        must: [
          { terms: { '_docType.keyword': search.types } }],
        should: buildShould(search.searchString),
        minimum_should_match: 1,
      }
    };
  }

  const isCruiseSearch = search.types?.includes('cruise');

  // Apply filters
  if (search.filters) {
    const filters = [];
    
    // Handle file types filter
    if (search.filters.fileTypes && search.filters.fileTypes.length > 0) {
      const fileTypeLogic = search.filterLogic?.fileTypes || 'OR';
      if (fileTypeLogic === 'AND') {
        // For AND logic, the document must have ALL selected file types
        // Use a script query to check that all selected file types are present
        filters.push({
          script: {
            script: {
              source: `
                def selectedTypes = params.fileTypes;
                def docFileTypes = new HashSet();
                if (doc['_files.type.keyword'].size() > 0) {
                  for (def fileType : doc['_files.type.keyword']) {
                    docFileTypes.add(fileType);
                  }
                }
                for (def selectedType : selectedTypes) {
                  if (!docFileTypes.contains(selectedType)) {
                    return false;
                  }
                }
                return true;
              `,
              params: {
                fileTypes: search.filters.fileTypes
              }
            }
          }
        });
      } else {
        // For OR logic, any file type can be present
        filters.push({
          terms: {
            '_files.type.keyword': search.filters.fileTypes
          }
        });
      }
    }
    
    // Handle related file types filter (_parentFiles or _childFiles)
    if (search.filters.relatedFileTypes && search.filters.relatedFileTypes.length > 0) {
      const relatedLogic = search.filterLogic?.relatedFileTypes || 'OR';
      if (relatedLogic === 'AND') {
        for (const ft of search.filters.relatedFileTypes) {
          filters.push({
            bool: {
              should: [
                { term: { '_parentFiles.type.keyword': ft } },
                { term: { '_childFiles.type.keyword': ft } },
              ],
              minimum_should_match: 1,
            }
          });
        }
      } else {
        filters.push({
          bool: {
            should: [
              { terms: { '_parentFiles.type.keyword': search.filters.relatedFileTypes } },
              { terms: { '_childFiles.type.keyword': search.filters.relatedFileTypes } },
            ],
            minimum_should_match: 1,
          }
        });
      }
    }

    // Handle collection methods filter
    if (search.filters.methods && search.filters.methods.length > 0) {
      // Cruises have a plural 'methods' field; cores/dives use singular 'method'
      const methodField = isCruiseSearch ? 'methods.keyword' : 'method.keyword';
      filters.push({
        terms: {
          [methodField]: search.filters.methods
        }
      });
    }

    // Handle material types filter
    if (search.filters.materialTypes && search.filters.materialTypes.length > 0) {
      // Cruises have a plural 'materials' field; cores/dives use singular 'material'
      const materialField = isCruiseSearch ? 'materials.keyword' : 'material.keyword';
      filters.push({
        terms: {
          [materialField]: search.filters.materialTypes
        }
      });
    }
    
    // Handle RV names filter
    if (search.filters.rvNames && search.filters.rvNames.length > 0) {
      const rvNameLogic = search.filterLogic?.rvNames || 'OR';
      if (rvNameLogic === 'AND') {
        // For AND logic, this doesn't make sense for a single field, so treat as OR
        filters.push({
          terms: {
            'rvName.keyword': search.filters.rvNames
          }
        });
      } else {
        filters.push({
          terms: {
            'rvName.keyword': search.filters.rvNames
          }
        });
      }
    }

    // Handle institutions filter
    if (search.filters.institutions && search.filters.institutions.length > 0) {
      const institutionLogic = search.filterLogic?.institutions || 'OR';
      if (institutionLogic === 'AND') {
        // For AND logic, this doesn't make sense for a single field, so treat as OR
        filters.push({
          terms: {
            'pi.keyword': search.filters.institutions
          }
        });
      } else {
        filters.push({
          terms: {
            'pi.keyword': search.filters.institutions
          }
        });
      }
    }

    // Handle textures filter
    if (search.filters.textures && search.filters.textures.length > 0) {
      filters.push({
        terms: {
          'texture.keyword': search.filters.textures
        }
      });
    }

    // Handle data issues filter (dev only)
    const dataIssues = dataIssuesFilter(search);
    if (dataIssues) filters.push(dataIssues);
    const dataIssues_links = linksFilter(search);
    if (dataIssues_links) filters.push(dataIssues_links);
    const dataIssues_collections = collectionsFilter(search);
    if (dataIssues_collections) filters.push(dataIssues_collections);
    const dataIssues_coordinates = coordinatesFilter(search);
    if (dataIssues_coordinates) filters.push(dataIssues_coordinates);

    // Apply all filters
    if (filters.length > 0) {
      // Wrap existing query in a bool query if it's not already
      if (query.bool) {
        query.bool.must = query.bool.must || [];
        query.bool.must.push(...filters);
      } else {
        query = {
          bool: {
            must: [query, ...filters]
          }
        };
      }
    }
  }

  let resp = { body: {} };

  if (req.query.search !== undefined && (search.terms !== undefined || search.searchString !== undefined) && search.types !== undefined) {
    const body: any = {
      from: search.from || 0,
      size: search.size || 10,
      query: guardQuery(query)
    };

    // Add sort only if size > 0 (not for aggregation-only queries)
    if (search.size !== 0) {
      body.sort = sortOrders[search.sortOrder];
    }
    // Highlights are only used by the result tables, not field-limited requests.
    if (search.size !== 0 && search._source === undefined) {
      body.highlight = {
        pre_tags: '',
        post_tags: '',
        fields: { '*.substring': {} },
      };
    }

    // Optional field list (e.g. the Maps tab asks only for IDs and coordinates).
    if (Array.isArray(search._source) && search._source.every((f: unknown) => typeof f === 'string')) {
      body._source = search._source;
    }
    // Deep paging past the 10,000-hit window (sort values of the previous page's last hit).
    if (Array.isArray(search.search_after)) {
      body.search_after = search.search_after;
    }

    // Add aggregations if provided
    if (search.aggs) {
      body.aggs = search.aggs;
    }

    resp = await client.search({
      index: index,
      body
    } as any);
  }
  else if (req.query.count !== undefined && (search.terms !== undefined || search.searchString !== undefined) && search.types !== undefined) {
    resp = await client.count({
      index,
      body: {
        query: guardQuery(query),
      }
    } as any);
  }
  else if (req.query.fileTypeCounts !== undefined && search.types !== undefined) {
    // Return counts for each file type
    const fileTypes = [
      'core-description', 'core-image', 'coring-data-sheet', 'cruise-report',
      'ct-color-image', 'ct-density', 'ct-gray-image', 'ct-image',
      'dredge-log', 'field-image',
      'itrax-image', 'itrax-xray-image', 'mst-data', 'ptmag-data',
      'publications-data', 'samples-data', 'thin-section-cross-polarized-foi-image',
      'thin-section-cross-polarized-image', 'thin-section-plane-polarized-foi-image',
      'thin-section-plane-polarized-image', 'whole-rock-foi-image',
      'whole-rock-image', 'xray-image', 'xrf-data'
    ];
    
    const counts: { [key: string]: number } = {};
    const isCruiseFileTypeSearch = search.types?.includes('cruise');

    // Build base query and apply non-fileType filters
    let baseQuery: any = {};
    if (search.searchString === '') {
      baseQuery = { terms: { '_docType.keyword': search.types } };
    } else {
      baseQuery = {
        bool: {
          must: [
            { terms: { '_docType.keyword': search.types } }],
          should: buildShould(search.searchString),
          minimum_should_match: 1,
        }
      };
    }

    // Apply non-fileType filters if they exist (these should not be affected by fileType AND/OR logic)
    if (search.filters) {
      const nonFileTypeFilters = [];
      
      // Apply method filters
      if (search.filters.methods && search.filters.methods.length > 0) {
        const methodField = isCruiseFileTypeSearch ? 'methods.keyword' : 'method.keyword';
        nonFileTypeFilters.push({ terms: { [methodField]: search.filters.methods } });
      }

      // Apply material type filters
      if (search.filters.materialTypes && search.filters.materialTypes.length > 0) {
        const materialField = isCruiseFileTypeSearch ? 'materials.keyword' : 'material.keyword';
        nonFileTypeFilters.push({ terms: { [materialField]: search.filters.materialTypes } });
      }
      
      // Apply RV name filters
      if (search.filters.rvNames && search.filters.rvNames.length > 0) {
        nonFileTypeFilters.push({
          terms: { 'rvName.keyword': search.filters.rvNames }
        });
      }
      
      // Apply non-file type filters to base query
      const dataIssues_nonFileTypeFilters = dataIssuesFilter(search);
      if (dataIssues_nonFileTypeFilters) nonFileTypeFilters.push(dataIssues_nonFileTypeFilters);
      const dataIssues_nonFileTypeFilters_links = linksFilter(search);
      if (dataIssues_nonFileTypeFilters_links) nonFileTypeFilters.push(dataIssues_nonFileTypeFilters_links);
      const dataIssues_nonFileTypeFilters_collections = collectionsFilter(search);
      if (dataIssues_nonFileTypeFilters_collections) nonFileTypeFilters.push(dataIssues_nonFileTypeFilters_collections);
      const dataIssues_nonFileTypeFilters_coordinates = coordinatesFilter(search);
      if (dataIssues_nonFileTypeFilters_coordinates) nonFileTypeFilters.push(dataIssues_nonFileTypeFilters_coordinates);
      if (nonFileTypeFilters.length > 0) {
        if (baseQuery.bool) {
          baseQuery.bool.must = baseQuery.bool.must || [];
          baseQuery.bool.must.push(...nonFileTypeFilters);
        } else {
          baseQuery = {
            bool: {
              must: [baseQuery, ...nonFileTypeFilters]
            }
          };
        }
      }
    }
    
    // Get counts for each file type
    for (const fileType of fileTypes) {
      const fileTypeQuery: any = {
        bool: {
          must: [
            baseQuery,
            {
              terms: {
                '_files.type.keyword': [fileType]
              }
            }
          ]
        }
      };
      
      // If AND logic is selected for file types and there are other selected file types,
      // add those as additional requirements
      if (search.filters?.fileTypes && search.filters.fileTypes.length > 0) {
        const fileTypeLogic = search.filterLogic?.fileTypes || 'OR';
        if (fileTypeLogic === 'AND') {
          // For AND logic, add all selected file types as requirements
          // (the current fileType is already included above)
          const otherSelectedTypes = search.filters.fileTypes.filter((ft: string) => ft !== fileType);
          if (otherSelectedTypes.length > 0) {
            fileTypeQuery.bool.must.push({
              script: {
                script: {
                  source: `
                    def selectedTypes = params.fileTypes;
                    def docFileTypes = new HashSet();
                    if (doc['_files.type.keyword'].size() > 0) {
                      for (def docFileType : doc['_files.type.keyword']) {
                        docFileTypes.add(docFileType);
                      }
                    }
                    for (def selectedType : selectedTypes) {
                      if (!docFileTypes.contains(selectedType)) {
                        return false;
                      }
                    }
                    return true;
                  `,
                  params: {
                    fileTypes: otherSelectedTypes
                  }
                }
              }
            });
          }
        }
      }
      
      try {
        const countResp = await client.count({
          index,
          body: {
            query: guardQuery(fileTypeQuery),
          }
        } as any);
        counts[fileType] = countResp.body.count || 0;
      } catch (error) {
        counts[fileType] = 0;
      }
    }
    
    return res.status(200).send(counts);
  }
  else if (req.query.methodCounts !== undefined && search.types !== undefined) {
    // Return counts for each collection method.
    // Cruises now have a plural 'methods' field directly; other types use singular 'method'.
    const counts: { [key: string]: number } = {};
    const isCruiseSearch = search.types.includes('cruise');
    const methodField = isCruiseSearch ? 'methods.keyword' : 'method.keyword';
    const materialField = isCruiseSearch ? 'materials.keyword' : 'material.keyword';
    let baseQuery: any = {};
    if (search.searchString === '') {
      baseQuery = { terms: { '_docType.keyword': search.types } };
    } else {
      baseQuery = {
        bool: {
          must: [
            { terms: { '_docType.keyword': search.types } }],
          should: buildShould(search.searchString),
          minimum_should_match: 1,
        }
      };
    }

    // Apply non-method filters if they exist
    if (search.filters) {
      const nonMethodFilters = [];

      // Apply file type filters with their current logic
      if (search.filters.fileTypes && search.filters.fileTypes.length > 0) {
        const fileTypeLogic = search.filterLogic?.fileTypes || 'OR';
        if (fileTypeLogic === 'AND') {
          nonMethodFilters.push({
            script: {
              script: {
                source: `
                  def selectedTypes = params.fileTypes;
                  def docFileTypes = new HashSet();
                  if (doc['_files.type.keyword'].size() > 0) {
                    for (def fileType : doc['_files.type.keyword']) {
                      docFileTypes.add(fileType);
                    }
                  }
                  for (def selectedType : selectedTypes) {
                    if (!docFileTypes.contains(selectedType)) {
                      return false;
                    }
                  }
                  return true;
                `,
                params: {
                  fileTypes: search.filters.fileTypes
                }
              }
            }
          });
        } else {
          nonMethodFilters.push({
            terms: {
              '_files.type.keyword': search.filters.fileTypes
            }
          });
        }
      }

      // Apply material type filters
      if (search.filters.materialTypes && search.filters.materialTypes.length > 0) {
        nonMethodFilters.push({
          terms: { [materialField]: search.filters.materialTypes }
        });
      }

      // Apply RV name filters
      if (search.filters.rvNames && search.filters.rvNames.length > 0) {
        nonMethodFilters.push({
          terms: { 'rvName.keyword': search.filters.rvNames }
        });
      }

      // Apply texture filters
      if (search.filters.textures && search.filters.textures.length > 0) {
        nonMethodFilters.push({
          terms: { 'texture.keyword': search.filters.textures }
        });
      }
      const dataIssues_nonMethodFilters = dataIssuesFilter(search);
      if (dataIssues_nonMethodFilters) nonMethodFilters.push(dataIssues_nonMethodFilters);
      const dataIssues_nonMethodFilters_links = linksFilter(search);
      if (dataIssues_nonMethodFilters_links) nonMethodFilters.push(dataIssues_nonMethodFilters_links);
      const dataIssues_nonMethodFilters_collections = collectionsFilter(search);
      if (dataIssues_nonMethodFilters_collections) nonMethodFilters.push(dataIssues_nonMethodFilters_collections);
      const dataIssues_nonMethodFilters_coordinates = coordinatesFilter(search);
      if (dataIssues_nonMethodFilters_coordinates) nonMethodFilters.push(dataIssues_nonMethodFilters_coordinates);

      // Apply non-method filters to base query
      if (nonMethodFilters.length > 0) {
        if (baseQuery.bool) {
          baseQuery.bool.must = baseQuery.bool.must || [];
          baseQuery.bool.must.push(...nonMethodFilters);
        } else {
          baseQuery = {
            bool: {
              must: [baseQuery, ...nonMethodFilters]
            }
          };
        }
      }
    }

    // Get aggregation of method field values
    try {
      const aggResp = await client.search({
        index,
        body: {
          size: 0,
          query: guardQuery(baseQuery),
          aggs: {
            methods: {
              terms: { field: methodField, size: 200 }
            }
          }
        }
      } as any);
      const buckets = (aggResp.body.aggregations?.methods as any)?.buckets || [];
      buckets.forEach((bucket: any) => {
        counts[bucket.key] = bucket.doc_count;
      });
    } catch (error) {
      console.error('Error fetching method counts:', error);
    }

    return res.status(200).send(counts);
  }
  else if (req.query.materialCounts !== undefined && search.types !== undefined) {
    // Return counts for each material type.
    // Cruises now have a plural 'materials' field directly; other types use singular 'material'.
    const counts: { [key: string]: number } = {};
    const isCruiseSearch = search.types.includes('cruise');
    const methodField = isCruiseSearch ? 'methods.keyword' : 'method.keyword';
    const materialField = isCruiseSearch ? 'materials.keyword' : 'material.keyword';
    let baseQuery: any = {};
    if (search.searchString === '') {
      baseQuery = { terms: { '_docType.keyword': search.types } };
    } else {
      baseQuery = {
        bool: {
          must: [
            { terms: { '_docType.keyword': search.types } }],
          should: buildShould(search.searchString),
          minimum_should_match: 1,
        }
      };
    }

    // Apply non-material filters if they exist
    if (search.filters) {
      const nonMaterialFilters = [];

      // Apply file type filters with their current logic
      if (search.filters.fileTypes && search.filters.fileTypes.length > 0) {
        const fileTypeLogic = search.filterLogic?.fileTypes || 'OR';
        if (fileTypeLogic === 'AND') {
          nonMaterialFilters.push({
            script: {
              script: {
                source: `
                  def selectedTypes = params.fileTypes;
                  def docFileTypes = new HashSet();
                  if (doc['_files.type.keyword'].size() > 0) {
                    for (def fileType : doc['_files.type.keyword']) {
                      docFileTypes.add(fileType);
                    }
                  }
                  for (def selectedType : selectedTypes) {
                    if (!docFileTypes.contains(selectedType)) {
                      return false;
                    }
                  }
                  return true;
                `,
                params: {
                  fileTypes: search.filters.fileTypes
                }
              }
            }
          });
        } else {
          nonMaterialFilters.push({
            terms: {
              '_files.type.keyword': search.filters.fileTypes
            }
          });
        }
      }

      // Apply method filters
      if (search.filters.methods && search.filters.methods.length > 0) {
        nonMaterialFilters.push({
          terms: { [methodField]: search.filters.methods }
        });
      }

      // Apply RV name filters
      if (search.filters.rvNames && search.filters.rvNames.length > 0) {
        nonMaterialFilters.push({
          terms: { 'rvName.keyword': search.filters.rvNames }
        });
      }

      // Apply texture filters
      if (search.filters.textures && search.filters.textures.length > 0) {
        nonMaterialFilters.push({
          terms: { 'texture.keyword': search.filters.textures }
        });
      }
      const dataIssues_nonMaterialFilters = dataIssuesFilter(search);
      if (dataIssues_nonMaterialFilters) nonMaterialFilters.push(dataIssues_nonMaterialFilters);
      const dataIssues_nonMaterialFilters_links = linksFilter(search);
      if (dataIssues_nonMaterialFilters_links) nonMaterialFilters.push(dataIssues_nonMaterialFilters_links);
      const dataIssues_nonMaterialFilters_collections = collectionsFilter(search);
      if (dataIssues_nonMaterialFilters_collections) nonMaterialFilters.push(dataIssues_nonMaterialFilters_collections);
      const dataIssues_nonMaterialFilters_coordinates = coordinatesFilter(search);
      if (dataIssues_nonMaterialFilters_coordinates) nonMaterialFilters.push(dataIssues_nonMaterialFilters_coordinates);

      if (nonMaterialFilters.length > 0) {
        if (!baseQuery.bool) {
          baseQuery = {
            bool: {
              must: [baseQuery]
            }
          };
        }
        baseQuery.bool.filter = nonMaterialFilters;
      }
    }

    // Get aggregation of material field values
    try {
      const aggResp = await client.search({
        index,
        body: {
          size: 0,
          query: guardQuery(baseQuery),
          aggs: {
            materials: {
              terms: { field: materialField, size: 200 }
            }
          }
        }
      } as any);
      const buckets = (aggResp.body.aggregations?.materials as any)?.buckets || [];
      buckets.forEach((bucket: any) => {
        counts[bucket.key] = bucket.doc_count;
      });
    } catch (error) {
      console.error('Error fetching material counts:', error);
    }

    return res.status(200).send(counts);
  }
  else if (req.query.rvNameCounts !== undefined && search.types !== undefined) {
    // Return counts for each RV name (only for cruises)
    const counts: { [key: string]: number } = {};

    // Base query without RV name filter
    let baseQuery: any = {};
    if (search.searchString === '') {
      baseQuery = { terms: { '_docType.keyword': search.types } };
    } else {
      baseQuery = {
        bool: {
          must: [
            { terms: { '_docType.keyword': search.types } }],
          should: buildShould(search.searchString),
          minimum_should_match: 1,
        }
      };
    }

    // Apply non-RV name filters if they exist
    if (search.filters) {
      const nonRvFilters = [];

      // Apply file type filters with their current logic
      if (search.filters.fileTypes && search.filters.fileTypes.length > 0) {
        const fileTypeLogic = search.filterLogic?.fileTypes || 'OR';
        if (fileTypeLogic === 'AND') {
          nonRvFilters.push({
            script: {
              script: {
                source: `
                  def selectedTypes = params.fileTypes;
                  def docFileTypes = new HashSet();
                  if (doc['_files.type.keyword'].size() > 0) {
                    for (def fileType : doc['_files.type.keyword']) {
                      docFileTypes.add(fileType);
                    }
                  }
                  for (def selectedType : selectedTypes) {
                    if (!docFileTypes.contains(selectedType)) {
                      return false;
                    }
                  }
                  return true;
                `,
                params: {
                  fileTypes: search.filters.fileTypes
                }
              }
            }
          });
        } else {
          nonRvFilters.push({
            terms: {
              '_files.type.keyword': search.filters.fileTypes
            }
          });
        }
      }

      // Apply method filters — cruises use plural 'methods' field
      if (search.filters.methods && search.filters.methods.length > 0) {
        nonRvFilters.push({ terms: { 'methods.keyword': search.filters.methods } });
      }

      // Apply material type filters — cruises use plural 'materials' field
      if (search.filters.materialTypes && search.filters.materialTypes.length > 0) {
        nonRvFilters.push({ terms: { 'materials.keyword': search.filters.materialTypes } });
      }

      // Apply institution filters
      if (search.filters.institutions && search.filters.institutions.length > 0) {
        nonRvFilters.push({
          terms: { 'pi.keyword': search.filters.institutions }
        });
      }

      // Apply texture filters
      if (search.filters.textures && search.filters.textures.length > 0) {
        nonRvFilters.push({
          terms: { 'texture.keyword': search.filters.textures }
        });
      }
      const dataIssues_nonRvFilters = dataIssuesFilter(search);
      if (dataIssues_nonRvFilters) nonRvFilters.push(dataIssues_nonRvFilters);
      const dataIssues_nonRvFilters_links = linksFilter(search);
      if (dataIssues_nonRvFilters_links) nonRvFilters.push(dataIssues_nonRvFilters_links);
      const dataIssues_nonRvFilters_collections = collectionsFilter(search);
      if (dataIssues_nonRvFilters_collections) nonRvFilters.push(dataIssues_nonRvFilters_collections);
      const dataIssues_nonRvFilters_coordinates = coordinatesFilter(search);
      if (dataIssues_nonRvFilters_coordinates) nonRvFilters.push(dataIssues_nonRvFilters_coordinates);

      if (nonRvFilters.length > 0) {
        if (!baseQuery.bool) {
          baseQuery = {
            bool: {
              must: [baseQuery]
            }
          };
        }
        baseQuery.bool.filter = nonRvFilters;
      }
    }

    // Get aggregation of rvName field values
    try {
      const aggResp = await client.search({
        index,
        body: {
          size: 0,
          query: guardQuery(baseQuery),
          aggs: {
            rvNames: {
              terms: {
                field: 'rvName.keyword',
                size: 100
              }
            }
          }
        }
      } as any);

      const buckets = (aggResp.body.aggregations?.rvNames as any)?.buckets || [];
      buckets.forEach((bucket: any) => {
        counts[bucket.key] = bucket.doc_count;
      });
    } catch (error) {
      console.error('Error fetching RV name counts:', error);
    }

    return res.status(200).send(counts);
  }
  else if (req.query.institutionCounts !== undefined && search.types !== undefined) {
    // Return counts for each institution (only for cruises)
    const counts: { [key: string]: number } = {};
    const piInstitutions: { [key: string]: string } = {};

    // Base query without institution filter
    let baseQuery: any = {};
    if (search.searchString === '') {
      baseQuery = { terms: { '_docType.keyword': search.types } };
    } else {
      baseQuery = {
        bool: {
          must: [
            { terms: { '_docType.keyword': search.types } }],
          should: buildShould(search.searchString),
          minimum_should_match: 1,
        }
      };
    }

    // Apply non-institution filters if they exist
    if (search.filters) {
      const nonInstitutionFilters = [];

      // Apply file type filters with their current logic
      if (search.filters.fileTypes && search.filters.fileTypes.length > 0) {
        const fileTypeLogic = search.filterLogic?.fileTypes || 'OR';
        if (fileTypeLogic === 'AND') {
          nonInstitutionFilters.push({
            script: {
              script: {
                source: `
                  def selectedTypes = params.fileTypes;
                  def docFileTypes = new HashSet();
                  if (doc['_files.type.keyword'].size() > 0) {
                    for (def fileType : doc['_files.type.keyword']) {
                      docFileTypes.add(fileType);
                    }
                  }
                  for (def selectedType : selectedTypes) {
                    if (!docFileTypes.contains(selectedType)) {
                      return false;
                    }
                  }
                  return true;
                `,
                params: {
                  fileTypes: search.filters.fileTypes
                }
              }
            }
          });
        } else {
          nonInstitutionFilters.push({
            terms: {
              '_files.type.keyword': search.filters.fileTypes
            }
          });
        }
      }

      // Apply method filters — cruises use plural 'methods' field
      if (search.filters.methods && search.filters.methods.length > 0) {
        nonInstitutionFilters.push({ terms: { 'methods.keyword': search.filters.methods } });
      }

      // Apply material type filters — cruises use plural 'materials' field
      if (search.filters.materialTypes && search.filters.materialTypes.length > 0) {
        nonInstitutionFilters.push({ terms: { 'materials.keyword': search.filters.materialTypes } });
      }

      // Apply RV name filters
      if (search.filters.rvNames && search.filters.rvNames.length > 0) {
        nonInstitutionFilters.push({
          terms: { 'rvName.keyword': search.filters.rvNames }
        });
      }

      // Apply texture filters
      if (search.filters.textures && search.filters.textures.length > 0) {
        nonInstitutionFilters.push({
          terms: { 'texture.keyword': search.filters.textures }
        });
      }
      const dataIssues_nonInstitutionFilters = dataIssuesFilter(search);
      if (dataIssues_nonInstitutionFilters) nonInstitutionFilters.push(dataIssues_nonInstitutionFilters);
      const dataIssues_nonInstitutionFilters_links = linksFilter(search);
      if (dataIssues_nonInstitutionFilters_links) nonInstitutionFilters.push(dataIssues_nonInstitutionFilters_links);
      const dataIssues_nonInstitutionFilters_collections = collectionsFilter(search);
      if (dataIssues_nonInstitutionFilters_collections) nonInstitutionFilters.push(dataIssues_nonInstitutionFilters_collections);
      const dataIssues_nonInstitutionFilters_coordinates = coordinatesFilter(search);
      if (dataIssues_nonInstitutionFilters_coordinates) nonInstitutionFilters.push(dataIssues_nonInstitutionFilters_coordinates);

      // Do NOT apply PI/institution filters here - we're getting counts for ALL institutions

      if (nonInstitutionFilters.length > 0) {
        if (!baseQuery.bool) {
          baseQuery = {
            bool: {
              must: [baseQuery]
            }
          };
        }
        baseQuery.bool.filter = nonInstitutionFilters;
      }
    }

    // Get aggregation of piInstitution field values
    try {
      const aggResp = await client.search({
        index,
        body: {
          size: 0,
          query: guardQuery(baseQuery),
          aggs: {
            institutions: {
              terms: {
                field: 'pi.keyword',
                size: 100
              }
            }
          }
        }
      } as any);

      const buckets = (aggResp.body.aggregations?.institutions as any)?.buckets || [];
      buckets.forEach((bucket: any) => {
        counts[bucket.key] = bucket.doc_count;
      });

      // Get a sample document for each PI to retrieve their institution
      for (const pi of Object.keys(counts)) {
        try {
          const sampleDoc = await client.search({
            index,
            body: {
              size: 1,
              query: {
                bool: {
                  must: [
                    baseQuery,
                    { term: { 'pi.keyword': pi } }
                  ]
                }
              },
              _source: ['piInstitution']
            }
          } as any);

          const hits = sampleDoc.body.hits?.hits || [];
          if (hits.length > 0 && hits[0]._source?.piInstitution) {
            piInstitutions[pi] = hits[0]._source.piInstitution;
          }
        } catch (error) {
          console.error(`Error fetching institution for PI ${pi}:`, error);
        }
      }
    } catch (error) {
      console.error('Error fetching institution counts:', error);
    }

    return res.status(200).send({ counts, piInstitutions });
  }
  else if (req.query.textureCounts !== undefined && search.types !== undefined) {
    // Return counts for each texture (only for rocks/dives)
    const counts: { [key: string]: number } = {};

    // Base query without texture filter
    let baseQuery: any = {};
    if (search.searchString === '') {
      baseQuery = { terms: { '_docType.keyword': search.types } };
    } else {
      baseQuery = {
        bool: {
          must: [
            { terms: { '_docType.keyword': search.types } }],
          should: buildShould(search.searchString),
          minimum_should_match: 1,
        }
      };
    }

    // Apply non-texture filters if they exist
    if (search.filters) {
      const nonTextureFilters = [];

      // Apply file type filters
      if (search.filters.fileTypes && search.filters.fileTypes.length > 0) {
        const fileTypeLogic = search.filterLogic?.fileTypes || 'OR';
        if (fileTypeLogic === 'AND') {
          nonTextureFilters.push({
            script: {
              script: {
                source: `
                  def selectedTypes = params.fileTypes;
                  def docFileTypes = new HashSet();
                  if (doc['_files.type.keyword'].size() > 0) {
                    for (def fileType : doc['_files.type.keyword']) {
                      docFileTypes.add(fileType);
                    }
                  }
                  for (def selectedType : selectedTypes) {
                    if (!docFileTypes.contains(selectedType)) {
                      return false;
                    }
                  }
                  return true;
                `,
                params: {
                  fileTypes: search.filters.fileTypes
                }
              }
            }
          });
        } else {
          nonTextureFilters.push({
            terms: {
              '_files.type.keyword': search.filters.fileTypes
            }
          });
        }
      }

      // Apply method filters
      if (search.filters.methods && search.filters.methods.length > 0) {
        nonTextureFilters.push({
          terms: { 'method.keyword': search.filters.methods }
        });
      }

      // Apply material type filters
      if (search.filters.materialTypes && search.filters.materialTypes.length > 0) {
        nonTextureFilters.push({
          terms: { 'material.keyword': search.filters.materialTypes }
        });
      }

      const dataIssues_nonTextureFilters = dataIssuesFilter(search);
      if (dataIssues_nonTextureFilters) nonTextureFilters.push(dataIssues_nonTextureFilters);
      const dataIssues_nonTextureFilters_links = linksFilter(search);
      if (dataIssues_nonTextureFilters_links) nonTextureFilters.push(dataIssues_nonTextureFilters_links);
      const dataIssues_nonTextureFilters_collections = collectionsFilter(search);
      if (dataIssues_nonTextureFilters_collections) nonTextureFilters.push(dataIssues_nonTextureFilters_collections);
      const dataIssues_nonTextureFilters_coordinates = coordinatesFilter(search);
      if (dataIssues_nonTextureFilters_coordinates) nonTextureFilters.push(dataIssues_nonTextureFilters_coordinates);
      if (nonTextureFilters.length > 0) {
        if (!baseQuery.bool) {
          baseQuery = {
            bool: {
              must: [baseQuery]
            }
          };
        }
        baseQuery.bool.filter = nonTextureFilters;
      }
    }

    // Get aggregation of texture field values
    try {
      const aggResp = await client.search({
        index,
        body: {
          size: 0,
          query: guardQuery(baseQuery),
          aggs: {
            textures: {
              terms: {
                field: 'texture.keyword',
                size: 100
              }
            }
          }
        }
      } as any);

      const buckets = (aggResp.body.aggregations?.textures as any)?.buckets || [];
      buckets.forEach((bucket: any) => {
        counts[bucket.key] = bucket.doc_count;
      });
    } catch (error) {
      console.error('Error fetching texture counts:', error);
    }

    return res.status(200).send(counts);
  }
  else if ((req.query.dataIssueCounts !== undefined || req.query.linkCounts !== undefined || req.query.collectionCounts !== undefined) && search.types !== undefined) {
    // Facet counts for the Data Issues (dev only), Links and Collection filters: how
    // many records in the current search (all other filters applied) match each option.
    const isLinkCounts = req.query.linkCounts !== undefined;
    const isCollectionCounts = req.query.collectionCounts !== undefined;
    if (!isLinkCounts && !isCollectionCounts && isProd) return res.status(200).send({ errors: 0, warnings: 0 });

    let baseQuery: any = {};
    if (search.searchString === '') {
      baseQuery = { terms: { '_docType.keyword': search.types } };
    } else {
      baseQuery = {
        bool: {
          must: [
            { terms: { '_docType.keyword': search.types } }],
          should: buildShould(search.searchString),
          minimum_should_match: 1,
        }
      };
    }

    if (search.filters) {
      const isCruise = search.types.includes('cruise');
      const otherFilters: any[] = [];
      if (search.filters.fileTypes?.length > 0) {
        otherFilters.push({ terms: { '_files.type.keyword': search.filters.fileTypes } });
      }
      if (search.filters.relatedFileTypes?.length > 0) {
        otherFilters.push({
          bool: {
            should: [
              { terms: { '_parentFiles.type.keyword': search.filters.relatedFileTypes } },
              { terms: { '_childFiles.type.keyword': search.filters.relatedFileTypes } },
            ],
            minimum_should_match: 1,
          }
        });
      }
      if (search.filters.methods?.length > 0) {
        otherFilters.push({ terms: { [isCruise ? 'methods.keyword' : 'method.keyword']: search.filters.methods } });
      }
      if (search.filters.materialTypes?.length > 0) {
        otherFilters.push({ terms: { [isCruise ? 'materials.keyword' : 'material.keyword']: search.filters.materialTypes } });
      }
      if (search.filters.rvNames?.length > 0) {
        otherFilters.push({ terms: { 'rvName.keyword': search.filters.rvNames } });
      }
      if (search.filters.institutions?.length > 0) {
        otherFilters.push({ terms: { 'pi.keyword': search.filters.institutions } });
      }
      if (search.filters.textures?.length > 0) {
        otherFilters.push({ terms: { 'texture.keyword': search.filters.textures } });
      }
      // Apply the other facets, leaving out the one being counted.
      const otherFacets = [
        isLinkCounts ? null : linksFilter(search),
        isCollectionCounts ? null : collectionsFilter(search),
        isLinkCounts || isCollectionCounts ? dataIssuesFilter(search) : null,
        coordinatesFilter(search),
      ].filter(Boolean);
      otherFilters.push(...otherFacets);
      if (otherFilters.length > 0) {
        baseQuery = { bool: { must: [baseQuery], filter: otherFilters } };
      }
    }

    if (isCollectionCounts) {
      const collectionCounts: { [collection: string]: number } = {};
      try {
        const aggResp = await client.search({
          index,
          body: {
            size: 0,
            query: guardQuery(baseQuery),
            aggs: { collections: { terms: { field: 'collection.keyword', size: 50 } } },
          }
        } as any);
        for (const b of (aggResp.body.aggregations?.collections as any)?.buckets || []) collectionCounts[b.key] = b.doc_count;
      } catch (error) {
        console.error('Error fetching collection counts:', error);
      }
      return res.status(200).send(collectionCounts);
    }

    if (isLinkCounts) {
      const linkCounts: { [link: string]: number } = {};
      try {
        const aggResp = await client.search({
          index,
          body: {
            size: 0,
            query: guardQuery(baseQuery),
            aggs: { links: { filters: { filters: LINK_QUERIES } } },
          }
        } as any);
        const buckets = (aggResp.body.aggregations?.links as any)?.buckets || {};
        for (const link of Object.keys(LINK_QUERIES)) linkCounts[link] = buckets[link]?.doc_count || 0;
      } catch (error) {
        console.error('Error fetching link counts:', error);
      }
      return res.status(200).send(linkCounts);
    }

    const counts = { errors: 0, warnings: 0 };
    try {
      const aggResp = await client.search({
        index,
        body: {
          size: 0,
          query: baseQuery,
          aggs: {
            errors: { filter: { exists: { field: '_errors' } } },
            warnings: { filter: { exists: { field: '_warnings' } } },
          }
        }
      } as any);
      const aggs: any = aggResp.body.aggregations || {};
      counts.errors = aggs.errors?.doc_count || 0;
      counts.warnings = aggs.warnings?.doc_count || 0;
    } catch (error) {
      console.error('Error fetching data issue counts:', error);
    }
    return res.status(200).send(counts);
  }
  else if (req.query.perCruiseCollection !== undefined && search.cruiseIds !== undefined) {
    // Returns { [cruiseOsuid]: { methods: string[], materialTypes: string[] } }
    // by running a single terms-aggregation query over cores filtered to the given cruise IDs.
    const result: { [cruiseId: string]: { methods: string[]; materialTypes: string[] } } = {};
    try {
      const aggResp = await client.search({
        index,
        body: {
          size: 0,
          query: guardQuery({
            bool: {
              must: [
                { terms: { '_docType.keyword': ['core'] } },
                { terms: { 'cruise.keyword': search.cruiseIds } },
              ],
            },
          }),
          aggs: {
            byCruise: {
              terms: { field: 'cruise.keyword', size: 1000 },
              aggs: {
                methods: { terms: { field: 'method.keyword', size: 100 } },
                materials: { terms: { field: 'material.keyword', size: 100 } },
              },
            },
          },
        },
      } as any);

      const buckets = (aggResp.body.aggregations?.byCruise as any)?.buckets || [];
      for (const bucket of buckets) {
        const cruiseId = bucket.key as string;
        const methods = (bucket.methods?.buckets || []).map((b: any) => b.key as string).filter(Boolean);
        const materialTypes = (bucket.materials?.buckets || []).map((b: any) => b.key as string).filter(Boolean);
        result[cruiseId] = { methods, materialTypes };
      }
    } catch (error) {
      console.error('Error fetching per-cruise collection data:', error);
    }
    return res.status(200).send(result);
  }
  else if (req.query.relatedFileTypeCounts !== undefined && search.types !== undefined) {
    // Count documents per related file type (parent or child files), excluding the relatedFileTypes
    // filter itself so the sidebar counts represent "how many would match if you added this filter".
    const relatedFileTypeList = [
      'core-description', 'core-image', 'coring-data-sheet', 'cruise-report',
      'ct-color-image', 'ct-density', 'ct-gray-image', 'ct-image',
      'dredge-log', 'field-image',
      'itrax-image', 'mst-data', 'ptmag-data',
      'publications-data', 'samples-data', 'thin-section-cross-polarized-foi-image',
      'thin-section-cross-polarized-image', 'thin-section-plane-polarized-foi-image',
      'thin-section-plane-polarized-image', 'whole-rock-foi-image',
      'whole-rock-image', 'xray-image', 'xrf-data'
    ];

    // Build base query applying all filters EXCEPT relatedFileTypes
    let baseQuery: any = {};
    if (search.searchString === '') {
      baseQuery = { terms: { '_docType.keyword': search.types } };
    } else {
      baseQuery = {
        bool: {
          must: [{ terms: { '_docType.keyword': search.types } }],
          should: buildShould(search.searchString),
          minimum_should_match: 1,
        }
      };
    }

    if (search.filters) {
      const otherFilters: any[] = [];

      if (search.filters.fileTypes && search.filters.fileTypes.length > 0) {
        const logic = search.filterLogic?.fileTypes || 'OR';
        if (logic === 'AND') {
          otherFilters.push({
            script: {
              script: {
                source: `
                  def sel = params.fileTypes; def s = new HashSet();
                  if (doc['_files.type.keyword'].size() > 0) { for (def t : doc['_files.type.keyword']) { s.add(t); } }
                  for (def t : sel) { if (!s.contains(t)) { return false; } } return true;
                `,
                params: { fileTypes: search.filters.fileTypes }
              }
            }
          });
        } else {
          otherFilters.push({ terms: { '_files.type.keyword': search.filters.fileTypes } });
        }
      }
      const isCruise = search.types?.includes('cruise');
      if (search.filters.methods?.length > 0) {
        otherFilters.push({ terms: { [isCruise ? 'methods.keyword' : 'method.keyword']: search.filters.methods } });
      }
      if (search.filters.materialTypes?.length > 0) {
        otherFilters.push({ terms: { [isCruise ? 'materials.keyword' : 'material.keyword']: search.filters.materialTypes } });
      }
      if (search.filters.rvNames?.length > 0) {
        otherFilters.push({ terms: { 'rvName.keyword': search.filters.rvNames } });
      }
      if (search.filters.institutions?.length > 0) {
        otherFilters.push({ terms: { 'pi.keyword': search.filters.institutions } });
      }
      if (search.filters.textures?.length > 0) {
        otherFilters.push({ terms: { 'texture.keyword': search.filters.textures } });
      }
      const dataIssues = dataIssuesFilter(search);
      if (dataIssues) otherFilters.push(dataIssues);
      const dataIssues_links = linksFilter(search);
      if (dataIssues_links) otherFilters.push(dataIssues_links);
      const dataIssues_collections = collectionsFilter(search);
      if (dataIssues_collections) otherFilters.push(dataIssues_collections);
      const dataIssues_coordinates = coordinatesFilter(search);
      if (dataIssues_coordinates) otherFilters.push(dataIssues_coordinates);

      if (otherFilters.length > 0) {
        if (!baseQuery.bool) { baseQuery = { bool: { must: [baseQuery] } }; }
        baseQuery.bool.must = baseQuery.bool.must || [];
        baseQuery.bool.must.push(...otherFilters);
      }
    }

    // Use a single filters-aggregation query to get per-type document counts in one round-trip
    const aggFilters: any = {};
    for (const ft of relatedFileTypeList) {
      aggFilters[ft] = {
        bool: {
          should: [
            { term: { '_parentFiles.type.keyword': ft } },
            { term: { '_childFiles.type.keyword': ft } },
          ],
          minimum_should_match: 1,
        }
      };
    }

    const counts: { [key: string]: number } = {};
    try {
      const aggResp = await client.search({
        index,
        body: {
          size: 0,
          query: guardQuery(baseQuery),
          aggs: { relatedFileTypes: { filters: { filters: aggFilters } } }
        }
      } as any);
      const buckets = (aggResp.body.aggregations?.relatedFileTypes as any)?.buckets || {};
      for (const [ft, bucket] of Object.entries(buckets)) {
        counts[ft] = (bucket as any).doc_count || 0;
      }
    } catch (error) {
      console.error('Error fetching related file type counts:', error);
    }

    return res.status(200).send(counts);
  }
  else {
    return res.status(204).send([]);
  }
  return res.status(200).send(resp.body);
};
