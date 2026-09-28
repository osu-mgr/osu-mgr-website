import numeral from 'numeral';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ItemType, itemTypesPlural, itemTypesSingular } from './items';
import { Icon } from './icon';


interface CountData {
  count: number;
}

export const ItemsCount: React.FC<{
  types: ItemType[];
  terms?: any;
  searchString?: string;
  filters?: any;
  filterLogic?: any;
  singularLabel?: string;
  pluralLabel?: string;
  // Count only records with a lat/lon (what the Maps tab plots).
  hasCoordinates?: boolean;
}> = ({ types, terms, searchString, filters, filterLogic, singularLabel, pluralLabel, hasCoordinates }) => {
  const { data: countData, isLoading } = useQuery({
    // Key on the whole filter objects so any filter (including dev-only data
    // issues) invalidates the cached count.
    // hasCoordinates is appended only when set, so plain counts keep the key the
    // search tabs share with their auto-tab check.
    queryKey: ['itemsCount', types, searchString, terms, filters, filterLogic, ...(hasCoordinates ? ['hasCoordinates'] : [])],
    queryFn: async (): Promise<CountData> => {
      const res = await fetch('/api/opensearch?count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ types, searchString, terms, filters, filterLogic, hasCoordinates }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || 'Failed to fetch count');
      }
      return res.json(); 
    }
  });

  const singular = itemTypesSingular[types[0]];
  const plural = itemTypesPlural[types[0]];
  return (
    <>
      {isLoading ? (
        <div className="text-sm">
          <Icon name="TbLoader2" size="1rem" className="animate-spin" />{' '}
          {pluralLabel !== undefined ? pluralLabel : plural}
        </div>
      ) : countData ? (
        <>
          <b>{numeral(countData.count).format('0,0')}</b>
          {` ${
            countData.count === 1
              ? singularLabel !== undefined
                ? singularLabel
                : singular
              : pluralLabel !== undefined
              ? pluralLabel
              : plural
          }`}
        </>
      ) : null} 
    </>
  );
};