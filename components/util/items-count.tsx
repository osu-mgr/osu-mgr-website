import numeral from 'numeral';
import { FunctionComponent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ItemType, itemTypesPlural, itemTypesSingular } from './items';
import { Icon } from './icon';


interface CountData {
  count: number;
}

export const ItemsCount: FunctionComponent<{
  types: ItemType[];
  searchString: string;
  singularLabel?: string;
  pluralLabel?: string;
}> = ({ types, searchString, singularLabel, pluralLabel }) => {
  const { data: countData, isLoading } = useQuery({
    queryKey: ['itemsCount', types, searchString],
    queryFn: async (): Promise<CountData> => {
      const res = await fetch('/api/es?count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ types, searchString }),
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