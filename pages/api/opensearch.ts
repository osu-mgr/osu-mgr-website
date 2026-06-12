import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@opensearch-project/opensearch';

const client: Client = new Client({
  node: process.env.OS_NODE,
});
const index = 'osu-mgr-ldeo-test1';

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

function buildShould(searchString: string) {
  const upper = searchString.toUpperCase();
  return [
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

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'POST') return res.status(405).send({ message: 'Only POST requests allowed' });
  const search = req.body;
  if (!search) return res.status(500).send('Missing search query');

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
      query
    };

    // Add sort only if size > 0 (not for aggregation-only queries)
    if (search.size !== 0) {
      body.sort = sortOrders[search.sortOrder];
      body.highlight = {
        pre_tags: '',
        post_tags: '',
        fields: { '*.substring': {} },
      };
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
        query,
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
            query: fileTypeQuery,
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
          query: baseQuery,
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
          query: baseQuery,
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
          query: baseQuery,
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
          query: baseQuery,
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
          query: baseQuery,
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
  else if (req.query.perCruiseCollection !== undefined && search.cruiseIds !== undefined) {
    // Returns { [cruiseOsuid]: { methods: string[], materialTypes: string[] } }
    // by running a single terms-aggregation query over cores filtered to the given cruise IDs.
    const result: { [cruiseId: string]: { methods: string[]; materialTypes: string[] } } = {};
    try {
      const aggResp = await client.search({
        index,
        body: {
          size: 0,
          query: {
            bool: {
              must: [
                { terms: { '_docType.keyword': ['core'] } },
                { terms: { 'cruise.keyword': search.cruiseIds } },
              ],
            },
          },
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
          query: baseQuery,
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
