import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@opensearch-project/opensearch';

const client: Client = new Client({
  node: process.env.OS_NODE,
});
const index = 'osu-mgr';

const sortOrders = {
	'modified asc': [{ _modified: 'asc' }],
  'modified desc': [{ _modified: 'desc' }],
  'alpha asc': [{ '_osuid.keyword': 'asc' }],
  'alpha desc': [{ '_osuid.keyword': 'desc' }],
  'ids asc': [
    { 'cruise.keyword': 'asc' },
    { _coreNumber: 'asc' },
    { _sectionNumber: 'asc' },
    { _diveNumber: 'asc' },
    { _diveSampleNumber: 'asc' },
    { '_osuid.keyword': 'asc' },
  ],
  'ids desc': [
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
  const search = JSON.parse(req.body);
  if (!search) return res.status(500).send('Missing search query');
  let resp = { body: {} };
  if (req.query.search !== undefined && search.searchString !== undefined && search.types !== undefined) {
    resp = await client.search({
      from: search.from,
      size: search.size,
      index,
      body: {
        sort: sortOrders[search.sortOrder],
        query: search.searchString === '' ? { terms: { '_docType.keyword': search.types } } : {
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
        },
        highlight: {
          pre_tags: '',
          post_tags: '',
          fields: { '*.substring': {} },
        }
      }
    });
  }
  else if (req.query.count !== undefined && search.searchString !== undefined && search.types !== undefined) {
    resp = await client.count({
      index,
      body: {
        query: search.searchString === '' ? { terms: { '_docType.keyword': search.types } } : {
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
        }
      }
    });
  }
  else {
    return res.status(500).send('Missing request parameters');
  }
  return res.status(200).send(resp.body);
};

