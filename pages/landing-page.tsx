import _ from 'lodash';
import { FunctionComponent } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { usePlugin, useFormScreenPlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import { Image, Loader } from 'semantic-ui-react';
import useSWR from 'swr';
import { useGitHubSiteForm } from '../common/site';
import Head from '../components/head';
import Layout from '../components/layout';
import { itemFieldNames } from '../common/items';

export const Page: FunctionComponent<{ page: any; site: any }> = ({
	page,
	site,
}) => {
	const { query } = useRouter()
	const osuID = _.keys(query)[0];
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
	usePlugin(pageForm);
	const [siteData, siteForm] = useGitHubSiteForm(site);
	useFormScreenPlugin(siteForm);
	
	const { data } = useSWR(
		() => {
			return { url: `/api/es?search`, payload: {
				sortOrder: 'modified desc',
				searchString: osuID,
				from: 0,
				size: 1,
				types: ['core', 'dive'],
			}};
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
	const doc = data && data.hits.hits[0]._source;
	return (
		<Layout navigation={siteData.navigation}>
			<Head
				siteTitle={siteData['siteTitle']}
				pageTitle={pageData['htmlTitle']}
      />
			<h1>{osuID}</h1>
			{data && <Image bordered size='tiny' floated='right' style={{ border: '2px solid white', zIndex: 1, margin: '-2px -2px 0 -100%' }}
				src={
					`https://maps.google.com/maps/api/staticmap?maptype=hybrid&center=${doc.latitudeStart},${doc.longitudeStart}&` +
					`zoom=2&size=640x640&markers=color:0xD73F09|${doc.latitudeStart},${doc.longitudeStart}&key=AIzaSyCINNnWmAK07o0DG3DYEAKx6Bf1SHrSMHw`
				} />}
			{data && <Image bordered size='medium' floated='right'
				src={
					`https://maps.google.com/maps/api/staticmap?maptype=hybrid&center=${doc.latitudeStart},${doc.longitudeStart}&` +
					`zoom=5&size=640x640&markers=color:0xD73F09|${doc.latitudeStart},${doc.longitudeStart}&key=AIzaSyCINNnWmAK07o0DG3DYEAKx6Bf1SHrSMHw`
				} />}
			{data && _.keys(itemFieldNames).map((label, i) =>
				label[0] != '_' &&
				doc[label.replace('.substring', '')] ? (
					<div
						key={i}
					>
						<b>{itemFieldNames[label]}:</b> {doc[label.replace('.substring', '')]} 
					</div>
				) : undefined
			)}
			{data && (
				<>
					<br /><br /><br /><br />
					<h3>Cruise Files</h3>
					<hr /><br/><br/>
					
					<h3>{doc._docType === 'core' ? 'Core' : 'Dive'} Files</h3>
					<hr /><br/><br/>
				</>
			)}
			{data === undefined && <Loader active /> || undefined}
		</Layout>
	);
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
