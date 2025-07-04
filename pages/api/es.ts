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
        query:
          search.terms !== undefined ? {
            bool: {
              must: [
                { terms: { '_docType.keyword': search.types } },
                { terms: search.terms }
              ]
            }
          } :
            search.searchString === '' ? {
              terms: { '_docType.keyword': search.types }
            } :
              {
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
              }
      }
    } as any);
  }
  else if (req.query.count !== undefined && (search.terms !== undefined || search.searchString !== undefined) && search.types !== undefined) {
    resp = await client.count({
      index,
      body: {
        query:
          search.terms !== undefined ? {
            bool: {
              must: [
                { terms: { '_docType.keyword': search.types } },
                { terms: search.terms }
              ]
            }
          } :
            search.searchString === '' ? {
              terms: { '_docType.keyword': search.types }
            } :
              {
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
              }
      }
    });
  }
  else {
    return res.status(204).send([]);
  }
  return res.status(200).send(resp.body);
};
