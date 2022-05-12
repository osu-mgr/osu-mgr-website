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
import { Input, Icon, Button, Dropdown, List, Label, Loader, Image, Header, Segment } from 'semantic-ui-react';
import { useGitHubSiteForm } from '../common/site';
import Head from '../components/head';
import Link from '../components/link';
import Layout from '../components/layout';
import ItemsCount from '../components/items.count';
import useLocalStorage from '../common/useLocalStorage';
import { itemFieldNames } from '../common/items';

export const Page: FunctionComponent<{ page: any; site: any }> = ({
	page,
	site,
}) => {
  const [search, setSearch] = useLocalStorage('search', {
		sortOrder: 'alpha asc',
		searchString: '',
		from: 0,
		size: 20,
		types: ['core', 'dive'],
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
			return { url: `/api/es?search`, payload: { ...search, from: search.size * pageIndex } };
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
	useEffect(() => {
    if (isVisible) setSize(size + 1);
  }, [isVisible]);
	usePlugin(pageForm);
	const [siteData, siteForm] = useGitHubSiteForm(site);
	useFormScreenPlugin(siteForm);
	const searchStrings = search.searchString.toLowerCase().split(/\s+/);
  const reMatchSplit = new RegExp(
    `(${searchStrings
      .map((x) => x.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'))
      .join('|')})`,
    'ig'
  );
	const matches = pages && _.flatten(pages.map(results =>
		(results && results.hits && results.hits.hits || [])
	)) || [];
	const matchesFields = _.keys(matches).map((x) => itemFieldNames[x]);
	console.log('matches', matches);
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
					iconPosition="left"
					type='search'
					value={searchString}
					placeholder='Search Collections...'
					onChange={(_event, data) => {
						setSearchString(data.value);
						debounce(data.value);
					}}
				>
					<Icon name="search" />
					<input />
					<Button
						basic={searchString !== ''}
						icon="close"
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
							key: 'ids asc',
							value: 'ids asc',
							text: 'Names (Ordered)',
						},
						{
							key: 'ids desc',
							value: 'ids desc',
							text: 'Names (Reverse)',
						},
						{
							key: 'alpha asc',
							value: 'alpha asc',
							text: 'IDs (Ordered)',
						},
						{
							key: 'alpha desc',
							value: 'alpha desc',
							text: 'IDs (Reverse)',
						},
						{
							key: 'modified desc',
							value: 'modified desc',
							text: 'Recent First',
						},
						{
							key: 'modified asc',
							value: 'modified asc',
							text: 'Recent Last',
						},
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
						types={search.types}
						pluralLabel="Cores and Dives"
						singularLabel="Core or Dive"
					/>
					{" from "}
					<ItemsCount
						searchString={search.searchString}
						types={['cruise']}
						pluralLabel="Cruises"
						singularLabel="Cruise"
					/>
				</List.Item>
				{matches.map((match: any) => (
					<List.Item key={match._source._osuid}>
						<Link href={`landing-page?${match._source._osuid}`}>
							<List.Content style={{ padding: '.25rem 0 .5rem' }}>
								<List.Header as="h3">{match._source._osuid}</List.Header>
								<List.Description>
									{match.highlight &&	_.keys(match.highlight).map((field) => (
										<Label
											circular
											size="mini"
											key={field}
											style={{ margin: '.5rem .5rem 0 0' }}
										>
											<Icon name="search" />
											{itemFieldNames[field]}:
											<Label.Detail>
												{match.highlight[field][0]
													.split(reMatchSplit)
													.map((x: string, i: number) =>
														searchStrings.includes(x.toLowerCase()) ? (
															<span key={i} className="highlight">
																{x}
															</span>
														) : (
															<span key={i}>{x}</span>
														)
													)}
											</Label.Detail>
										</Label>
									))}
									{match._source._docType === 'core' &&
										<Label
												basic
												circular
												size="mini"
												style={{
													margin: '.5rem .5rem 0 0',
												}}
										>
											Sections:
											<Label.Detail><ItemsCount
												searchString={match._source._osuid}
												types={['section']}
												pluralLabel=""
												singularLabel=""
											/></Label.Detail>
										</Label>
									}
									{match._source._docType === 'dive' &&
										<Label
												basic
												circular
												size="mini"
												style={{
													margin: '.5rem .5rem 0 0',
												}}
										>
											Samples:
											<Label.Detail><ItemsCount
												searchString={match._source._osuid}
												types={['diveSample']}
												pluralLabel=""
												singularLabel=""
											/></Label.Detail>
										</Label>
									}
									{_.keys(itemFieldNames).map((label, i) =>
										label[0] != '_' &&
										match._source[label.replace('.substring', '')] &&
										!matchesFields.includes(label.replace('.substring', '')) ? (
											<Label
												key={i}
												basic
												circular
												size="mini"
												style={{
													margin: '.5rem .5rem 0 0',
												}}
											>
												&nbsp;&nbsp;{itemFieldNames[label]}:
												<Label.Detail>
													{match._source[label.replace('.substring', '')]}
												</Label.Detail>
											</Label>
										) : undefined
									)}
								</List.Description>
								<List.Description style={{marginTop: '.5rem'}}>
									<div className='map'>
										<Image
											bordered
											src={`https://maps.google.com/maps/api/staticmap?maptype=hybrid&center=${match._source.latitudeStart},${match._source.longitudeStart}&zoom=4&size=640x640&markers=color:0xD73F09|${match._source.latitudeStart},${match._source.longitudeStart}&key=AIzaSyCINNnWmAK07o0DG3DYEAKx6Bf1SHrSMHw`}
										/>
									</div>
									<div className='file'>
										<Segment>
											<Header size='tiny' icon>
												<Icon name="file pdf outline" />
												Metadata Sheet
											</Header>
										</Segment>
									</div>
									<div className='file'>
										<Segment>
											<Header size='tiny' icon>
												<Icon name="file pdf outline" />
												Cruise Report
											</Header>
										</Segment>
									</div>
								</List.Description>
							</List.Content>
						</Link>
					</List.Item>
				))}
			</List>
			{matches.length && <div ref={ref} /> || undefined}
			{pages === undefined && <Loader active /> || undefined}
			<style jsx>{`
				.map {
					display: inline-block;
					float: left;
					margin: 0.5rem 0 0.5rem 0;
					height: 100px;
					width: 100px;
				}
				.file {
					display: inline-block;
					float: left;
					margin: 0.5rem 0 0.5rem 0.5rem;
					height: 100px;
					width: 150px;
				}
				.highlight {
					color: #D73F09 !important;
				}
			`}</style>
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
