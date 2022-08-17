import _ from 'lodash';
import { FunctionComponent, useState, useCallback, useEffect } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import useSWRInfinite from 'swr/infinite';
import { useInView } from 'react-hook-inview';
import { usePlugin, useFormScreenPlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import {
	InlineForm
} from 'react-tinacms-inline';
import { Input, Icon, Button, Dropdown, List, Label, Loader, Segment } from 'semantic-ui-react';
import { useGitHubSiteForm } from '../common/site';
import Head from '../components/head';
import Link from '../components/link';
import Layout from '../components/layout';
import ItemsCount from '../components/items.count';
import useLocalStorage from '../common/useLocalStorage';
import { itemFieldNames, itemTypesSingular, formatField } from '../common/items';
import CollectionFileButton from '../components/search.collectionFilesButton';
import CollectionMapThumbnail from '../components/search.collectionMapThumbnail';

const MatchListItem: FunctionComponent<{ match, search }> = ({ match, search }) => {
	const searchStrings = search.searchString.toLowerCase().split(/\s+/);
	const reMatchSplit = new RegExp(
    `(${searchStrings
      .map((x) => x.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'))
      .join('|')})`,
    'ig'
	);
	return (<>
		<List.Item key={match._source._osuid}>
			<Link href={`${match._source._osuid}`}>
				<List.Content style={{ padding: '.25rem 0 .5rem' }}>
					<List.Header as='h3'>
						{itemTypesSingular[match._source._docType]}
						{" "}
						{match._source._osuid.replace('OSU-', '')}
					</List.Header>
					<List.Description>
						{match.highlight &&	_.keys(match.highlight).map((field) => (
							itemFieldNames[field] && <Label
								circular
								size='tiny'
								key={field}
								style={{ margin: '.5rem .5rem 0 0' }}
							>
								<Icon name='search' />
								{itemFieldNames[field]}:
								<Label.Detail>
									{match.highlight[field][0]
										.split(reMatchSplit)
										.map((x: string, i: number) =>
											searchStrings.includes(x.toLowerCase()) ? (
												<span key={i} className='highlight'>
													{x}
												</span>
											) : (
												<span key={i}>{x}</span>
											)
										)}
								</Label.Detail>
							</Label> || undefined
						))}
						{match._source._docType === 'core' &&
							<Label
									basic
									circular
									size='tiny'
									style={{
										margin: '.5rem .5rem 0 0',
									}}
							>
								Sections:
								<Label.Detail><ItemsCount
									searchString={match._source._osuid}
									types={['section']}
									pluralLabel=''
									singularLabel=''
								/></Label.Detail>
							</Label>
						}
						{match._source._docType === 'dive' &&
							<Label
									basic
									circular
									size='tiny'
									style={{
										margin: '.5rem .5rem 0 0',
									}}
							>
								Samples:
								<Label.Detail><ItemsCount
									searchString={match._source._osuid}
									types={['diveSample']}
									pluralLabel=''
									singularLabel=''
								/></Label.Detail>
							</Label>
						}
						{_.keys(itemFieldNames).map((label, i) =>
							label[0] !== '_' &&
								label !== 'id.substring' &&
								itemFieldNames[label] &&
								match._source[label.replace('.substring', '')] &&
								(!match.highlight || !match.highlight[label]) ? (
								<Label
									key={i}
									basic
									circular
									size='tiny'
									style={{
										margin: '.5rem .5rem 0 0',
									}}
								>
									&nbsp;&nbsp;{itemFieldNames[label]}:
										<Label.Detail>
											{formatField(match._source, label)}
									</Label.Detail>
								</Label>
							) : undefined
						)}
					</List.Description>
					{match._source._cruiseID && 
						<List.Description style={{ margin: '0.5rem 0 -0.5rem' }}>
							<CollectionMapThumbnail lat={match._source.latitudeStart}  lon={match._source.longitudeStart} />
							<CollectionFileButton name='Cruise Report' icon='file pdf outline' file={`${match._source._cruiseID}/cruisereport/OSU-${match._source._cruiseID}-cruisereport.pdf`} />
							<CollectionFileButton name='Publications' icon='file pdf outline' file={`${match._source._cruiseID}/publications/OSU-${match._source._cruiseID}-publications.pdf`} />
							<CollectionFileButton name='Coring Data Sheet' icon='file pdf outline' file={`${match._source._cruiseID}/coringdatasheet/OSU-${match._source._cruiseID}-${match._source._coreNumber}-coringdatasheet.pdf`} />
							<CollectionFileButton name='MST Data' icon='file pdf outline' file={`${match._source._cruiseID}/mstdata/${match._source._osuid}-mstdata.csv`} />
						</List.Description> || undefined
					}
				</List.Content>
			</Link>
		</List.Item>
		<style jsx>{`
			.map {
				display: inline-block;
				margin-right: 0.5rem;
				height: 100px;
				width: 100px;
			}
			.file {
				display: inline-block;
				margin-right: 0.5rem;
				height: 100px;
				width: 150px;
			}
			.highlight {
				color: #D73F09 !important;
			}
		`}</style>
	</>)
}

export const Page: FunctionComponent<{ page: any; site: any }> = ({
	page,
	site,
}) => {
	const pageSize = 10;
  const [search, setSearch] = useLocalStorage('search', {
		sortOrder: 'alpha asc',
		searchString: '',
	});
	const [searchString, setSearchString] = useState(search.searchString || '');
  const [ref, isVisible] = useInView({
    threshold: 0,
	});
	const [pageData, pageForm] = useGithubJsonForm(page, {
		label: 'Page',
		fields: [
			{
				label: 'Page Title',
				name: 'htmlTitle',
				component: 'text',
				description: 'Displayed in the browser tab.',
			},
		],
	});
  const debounce = useCallback(
    _.debounce((x: string) => {
      x = x.replace(/^http(s?):\/\/osu-mgr.org\//i, '');
			setSearch({ ...search, searchString: x });
			setSize(0);
    }, 500),
    [setSearch, search]
	);
	
	const { data: pages, size, setSize } = useSWRInfinite(
		(pageIndex) => {
			return {
				url: `/api/es?search`, payload: {
					...search,
					from: search.size * pageIndex,
					size: pageSize,
					types: ['cruise', 'core', 'dive']
				}
			};
		},
		async ({ url, payload }) => {
			const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
			const data = await res.json();
			if (res.status !== 200) {
				throw new Error(data.message)
			}
			return data
		}
	);
	const matches = pages && _.flatten(pages.map(results =>
		(results && results.hits && results.hits.hits || [])
	)) || [];
	const isLoading = pages === undefined || pages.length && pages.length < (pages[0].hits.total.value / pageSize);
	useEffect(() => {
		if (isLoading && isVisible && pages !== undefined && size < pages.length + 1)
			setSize(size + 1);
  });
	
	usePlugin(pageForm);
	const [siteData, siteForm] = useGitHubSiteForm(site);
	useFormScreenPlugin(siteForm);

	return <>
		<Layout navigation={siteData.navigation}>
			<Head
				siteTitle={siteData['siteTitle']}
				pageTitle={pageData['htmlTitle']}
			/>
			<InlineForm form={pageForm}>
				<h1>Search OSU-MGR Collections</h1>
				<Input
					fluid
					action
					iconPosition='left'
					type='search'
					value={searchString}
					placeholder='Search Collections...'
					onChange={(_event, data) => {
						setSearchString(data.value);
						debounce(data.value);
					}}
				>
					<Icon name='search' />
					<input />
					<Button
						basic={searchString !== ''}
						icon='close'
						disabled={searchString === ''}
						onClick={() => {
							setSearch({ ...search, searchString: '' });
							setSize(0);
							setSearchString('');
						}}
					/>
					<Dropdown
						button
						options={[
							{
								key: 'alpha asc',
								value: 'alpha asc',
								text: 'Names (Ordered)',
							},
							{
								key: 'alpha desc',
								value: 'alpha desc',
								text: 'Names (Reverse)',
							},
							{
								key: 'ids asc',
								value: 'ids asc',
								text: 'IDs (Ordered)',
							},
							{
								key: 'ids desc',
								value: 'ids desc',
								text: 'IDs (Reverse)',
							},
							/*{
								key: 'modified desc',
								value: 'modified desc',
								text: 'Recent First',
							},
							{
								key: 'modified asc',
								value: 'modified asc',
								text: 'Recent Last',
							},*/
						]}
						value={search.sortOrder}
							onChange={(_event, data) => {
								setSearch({
									...search,
									sortOrder: `${data.value}`,
								});
								setSize(0);
							}
						}
					/>
				</Input>
			</InlineForm>
			<List divided>
				<List.Item>
					<ItemsCount
						searchString={search.searchString}
						types={['cruise']}
					/>
					{" and "}
					<ItemsCount
						searchString={search.searchString}
						types={['core', 'dive']}
						pluralLabel='Cores/Dives'
						singularLabel='Core/Dive'
					/>
				</List.Item>
				{matches.map((match: any, key) => <MatchListItem key={ key } match={ match } search={ search }/>)}
			</List>
			{isLoading &&
				<>
					<Segment basic padded='very'>
						<Loader active>
							Loading Results
						</Loader>
					</Segment>
				</> || undefined
			}
			{matches.length && <div ref={ref} /> || undefined}
		</Layout>
	</>;
};

export default Page;

export const getStaticProps: GetStaticProps = async function ({
	preview,
	previewData,
}) {
	if (preview) {
		const page = await getGithubPreviewProps({
			...previewData,
			fileRelativePath: 'content/search.json',
			parse: parseJson,
		});
		const site = await getGithubPreviewProps({
			...previewData,
			fileRelativePath: 'content/site.json',
			parse: parseJson,
		});

		return {
			props: {
				preview,
				page: page.props.file,
				site: site.props.file,
				error: page.props.error || site.props.error || null,
			},
		};
	}
	return {
		props: {
			sourceProvider: null,
			error: null,
			preview: false,
			page: {
				fileRelativePath: 'content/search.json',
				data: (await import('../content/search.json')).default,
			},
			site: {
				fileRelativePath: 'content/site.json',
				data: (await import('../content/site.json')).default,
			},
		},
	};
};
