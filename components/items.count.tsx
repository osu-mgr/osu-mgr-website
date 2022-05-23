import numeral from 'numeral';
import { FunctionComponent } from 'react';
import { Loader } from 'semantic-ui-react';
import { ItemType, itemTypesPlural, itemTypesSingular } from '../common/items';
import useSWRImmutable from 'swr/immutable';
import css from 'styled-jsx/css'

const { className, styles } = css.resolve`
  .ui.loader {
    margin-left: .25em !important;
    width: 1em !important;
    height: .5em !important;
  }
  .ui.loader::before,
  .ui.loader::after {
    width: 1em;
    height: 1em;
    margin-top: -.35em;
    margin-left: -.5em;
    border-width: .15em;
  }
`;

const ItemsCount: FunctionComponent<{
  types: ItemType[];
  searchString: string;
  inverted?: boolean;
  singularLabel?: string;
  pluralLabel?: string;
}> = ({ types, searchString, inverted, singularLabel, pluralLabel }) => {
	const { data: count } = useSWRImmutable(
    () => ({ url: `/api/es?count`, payload: { types, searchString } }),
		async ({ url, payload }) => {
			const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
      const data = await res.json();

			if (res.status !== 200) {
				throw new Error(data.message)
			}
			return data
		}
  );
  const singular = itemTypesSingular[types[0]];
  const plural = itemTypesPlural[types[0]];
  return (
    <>
      {count === undefined ? (
        <>
          <Loader active inline className={className} inverted={inverted} />{' '}
          {pluralLabel !== undefined ? pluralLabel : plural}
        </>
      ) : (
        <>
          <b>{numeral(count.count).format('0,0')}</b>
          {` ${
            count.count === 1 ? singularLabel !== undefined ? singularLabel : singular : pluralLabel !== undefined ? pluralLabel : plural
          }`}
        </>
      )}
      {styles}
    </>
  );
};

export default ItemsCount;
