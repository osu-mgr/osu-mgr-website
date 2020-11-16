import { FunctionComponent, useState } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { usePlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import { Portal, Segment, Header, Menu } from 'semantic-ui-react';
import { useGitHubSiteForm } from '../common/site';
import ReactMarkdown from 'react-markdown';
import Head from '../components/head';
import Layout from '../components/layout';

const Map: FunctionComponent = () => {
	return (
		<>
			<iframe
				className='map'
				scrolling='no'
				src='https://osugisci.maps.arcgis.com/apps/webappviewer/index.html?id=56819d2b62674659aab2f67d793cebc8'
			/>
			<style jsx>{`
				.map {
					border: none;
					position: absolute;
					width: 100%;
					height: 100%;
				}
			`}</style>
		</>
	);
};

export const Page: FunctionComponent<{ page: any; site: any }> = ({
	page,
	site,
}) => {
	const [open, setOpen] = useState(true);
	const [pageData, pageForm] = useGithubJsonForm(page, {
		label: 'Page',
		fields: [
			{
				name: 'htmlTitle',
				component: 'text',
			},
		],
	});
	usePlugin(pageForm);
	const [siteData, siteForm] = useGitHubSiteForm(site);
	usePlugin(siteForm);
	return (
		<Layout navigation={siteData.navigation} fullWidth>
			<Head
				siteTitle={siteData['siteTitle']}
				pageTitle={pageData['htmlTitle']}
			/>
			<Portal onClose={() => setOpen(false)} open={open}>
				<div
					style={{
						position: 'fixed',
						zIndex: 2400,
						display: 'flex',
						alignContent: 'center',
						alignItems: 'center',
						left: 0,
						top: 0,
						bottom: 0,
						right: 0,
					}}
				>
					<Segment
						style={{
							maxWidth: '75vw',
							margin: 'auto',
						}}
					>
						<Header>
							<Menu pointing secondary>
								<Menu.Item name='overview' active />
								<Menu.Item name='instructions' />
								<Menu.Item name='filtering' />
								<Menu.Menu position='right'>
									<Menu.Item icon='close' onClick={() => setOpen(false)} />
								</Menu.Menu>
							</Menu>
						</Header>
						<ReactMarkdown
							source={`
The marine sediment and rock collection at the OSU Marine Geology Repository comes from all oceans. As of 2020 it contains:

#### The Marine Geology and Geophysics Collection: 
- Over 16,700 meters (10.4 miles) of marine sediment from over 6,300 core sites
- 430 meters (0.27 miles) of lake sediment from 172 core sites
- 1,600 sediment trap samples

#### The Antarctic Core Collection:
- Largest collection of geological samples from the Southern Ocean
- Over 18,500 meters (11.5 miles) of deep sea core sediment from 7,370 core sites

#### Dredge and Dive Rock Collection:
- More than 10,000 rocks from over 500 dredges
- 528 manganese nodules
- Rock samples from 139 ROV dives sampled by NOAA in marine national monuments in the Pacific Ocean

The map contains core, grab, and dredge locations for our searchable holdings listed in the Index to Marine and Lacustrine Geological Samples database. This is a complete list of our holdings but it will be constantly updated with new information as we continue to digitally collate our collection.
						`}
						/>
					</Segment>
				</div>
			</Portal>
			<Map />
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
			fileRelativePath: 'content/collections.json',
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
				fileRelativePath: 'content/collections.json',
				data: (await import('../content/collections.json')).default,
			},
			site: {
				fileRelativePath: 'content/site.json',
				data: (await import('../content/site.json')).default,
			},
		},
	};
};
