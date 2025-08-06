import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@opensearch-project/opensearch';

const client: Client = new Client({
  node: process.env.OS_NODE,
});
const index = 'osu-mgr';

const cruisesFirst = {
  "_script": {
    "order": "asc",
    "type": "number",
    "script": "return doc['_docType.keyword'].value == 'cruise' ? 0 : 1"
  }
};
const sortOrders = {
	//'modified asc': [cruisesFirst, { _modified: 'asc' }],
  //'modified desc': [cruisesFirst, { _modified: 'desc' }],
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
};

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
        should: [
          {
            multi_match: {
              query: search.searchString.toLowerCase(), //.replace('-', ' '),
              type: 'bool_prefix',
              fields: ['*.substring'],
              operator: 'and',
              analyzer: 'whitespace',
            },
          },
          {
            prefix: {
              '_osuid.keyword': {
                value: search.searchString.toUpperCase(),
              },
            },
          },
        ],
        minimum_should_match: 1,
      }
    };
  }

  // Apply filters
  if (search.filters) {
    const filters = [];
    
    // Handle file types filter
    if (search.filters.fileTypes && search.filters.fileTypes.length > 0) {
      const fileTypeLogic = search.filterLogic?.fileTypes || 'OR';
      if (fileTypeLogic === 'AND') {
        // For AND logic, each file type must be present
        search.filters.fileTypes.forEach((fileType: string) => {
          filters.push({
            terms: {
              '_files.type.keyword': [fileType]
            }
          });
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
    
    // Handle collection methods filter
    if (search.filters.methods && search.filters.methods.length > 0) {
      const methodLogic = search.filterLogic?.methods || 'OR';
      if (methodLogic === 'AND') {
        // For AND logic, this doesn't make sense for a single field, so treat as OR
        filters.push({
          terms: {
            'method.keyword': search.filters.methods
          }
        });
      } else {
        filters.push({
          terms: {
            'method.keyword': search.filters.methods
          }
        });
      }
    }
    
    // Handle material types filter
    if (search.filters.materialTypes && search.filters.materialTypes.length > 0) {
      const materialLogic = search.filterLogic?.materialTypes || 'OR';
      if (materialLogic === 'AND') {
        // For AND logic, this doesn't make sense for a single field, so treat as OR
        filters.push({
          terms: {
            'material.keyword': search.filters.materialTypes
          }
        });
      } else {
        filters.push({
          terms: {
            'material.keyword': search.filters.materialTypes
          }
        });
      }
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
    resp = await client.search({
      index: index,
      body: {
        from: search.from || 0,
        size: search.size || 10,
        sort: sortOrders[search.sortOrder],
        highlight: {
          pre_tags: '',
          post_tags: '',
          fields: { '*.substring': {} },
        },
        query
      }
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
      'dredge-log', 'field-image', 'igsn-sheet', 'imlgs-file',
      'itrax-image', 'itrax-xray-image', 'mst-data', 'ptmag-data',
      'publications-data', 'samples-data', 'thin-section-cross-polarized-foi-image',
      'thin-section-cross-polarized-image', 'thin-section-plane-polarized-foi-image',
      'thin-section-plane-polarized-image', 'whole-rock-foi-image',
      'whole-rock-image', 'xray-image', 'xrf-data'
    ];
    
    const counts: { [key: string]: number } = {};
    
    // Base query without file type filter
    let baseQuery: any = {};
    if (search.searchString === '') {
      baseQuery = { terms: { '_docType.keyword': search.types } };
    } else {
      baseQuery = {
        bool: {
          must: [
            { terms: { '_docType.keyword': search.types } }],
          should: [
            {
              multi_match: {
                query: search.searchString.toLowerCase(),
                type: 'bool_prefix',
                fields: ['*.substring'],
                operator: 'and',
                analyzer: 'whitespace',
              },
            },
            {
              prefix: {
                '_osuid.keyword': {
                  value: search.searchString.toUpperCase(),
                },
              },
            },
          ],
          minimum_should_match: 1,
        }
      };
    }
    
    // Get counts for each file type
    for (const fileType of fileTypes) {
      const fileTypeQuery = {
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
    // Return counts for each collection method (only for cores and dive types)
    const counts: { [key: string]: number } = {};
    
    // Base query without method filter
    let baseQuery: any = {};
    if (search.searchString === '') {
      baseQuery = { terms: { '_docType.keyword': search.types } };
    } else {
      baseQuery = {
        bool: {
          must: [
            { terms: { '_docType.keyword': search.types } }],
          should: [
            {
              multi_match: {
                query: search.searchString.toLowerCase(),
                type: 'bool_prefix',
                fields: ['*.substring'],
                operator: 'and',
                analyzer: 'whitespace',
              },
            },
            {
              prefix: {
                '_osuid.keyword': {
                  value: search.searchString.toUpperCase(),
                },
              },
            },
          ],
          minimum_should_match: 1,
        }
      };
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
              terms: {
                field: 'method.keyword',
                size: 100
              }
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
    // Return counts for each material type (only for cores)
    const counts: { [key: string]: number } = {};
    
    // Base query without material filter
    let baseQuery: any = {};
    if (search.searchString === '') {
      baseQuery = { terms: { '_docType.keyword': search.types } };
    } else {
      baseQuery = {
        bool: {
          must: [
            { terms: { '_docType.keyword': search.types } }],
          should: [
            {
              multi_match: {
                query: search.searchString.toLowerCase(),
                type: 'bool_prefix',
                fields: ['*.substring'],
                operator: 'and',
                analyzer: 'whitespace',
              },
            },
            {
              prefix: {
                '_osuid.keyword': {
                  value: search.searchString.toUpperCase(),
                },
              },
            },
          ],
          minimum_should_match: 1,
        }
      };
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
              terms: {
                field: 'material.keyword',
                size: 100
              }
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
          should: [
            {
              multi_match: {
                query: search.searchString.toLowerCase(),
                type: 'bool_prefix',
                fields: ['*.substring'],
                operator: 'and',
                analyzer: 'whitespace',
              },
            },
            {
              prefix: {
                '_osuid.keyword': {
                  value: search.searchString.toUpperCase(),
                },
              },
            },
          ],
          minimum_should_match: 1,
        }
      };
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
  else {
    return res.status(204).send([]);
  }
  return res.status(200).send(resp.body);
};
