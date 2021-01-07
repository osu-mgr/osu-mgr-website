import { FunctionComponent, useState } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { usePlugin, useFormScreenPlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import { Portal, Segment, Button, Tab } from 'semantic-ui-react';
import { useGitHubSiteForm } from '../common/site';
import MD from 'markdown-to-jsx';
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
						<Button
							circular
							size='mini'
							icon='close'
							floated='right'
							onClick={() => setOpen(false)}
						/>
						<Tab
							defaultActiveIndex={0}
							menu={{ secondary: true, pointing: true }}
							panes={[
								{
									menuItem: 'Overview',
									render: () => (
										<Tab.Pane attached={false} basic>
											<MD>{`
The marine sediment and rock collection at the OSU Marine Geology Repository comes from all oceans. As of 2020 it contains:

### The Marine Geology and Geophysics Collection: 

- 15,200 meters (9.4 miles) of marine sediment from over 6,600 core sites
- Over 560 meters (0.35 miles) of lake sediment from 199 core sites
- 8,060 meters (5.0 miles) of terrestrial drill core from 29 sites
- 1,600 sediment trap samples

### The Antarctic Core Collection:
- Largest collection of geological samples from the Southern Ocean
- Over 18,500 meters (11.5 miles) of deep sea core sediment from 7,370 core sites

### Dredge and Dive Rock Collection:
- More than 16,000 rocks from over 529 dredges
- 528 manganese nodules
- Rock samples from 139 ROV dives sampled by NOAA in marine national monuments in the Pacific Ocean

The map below contains core, grab, and dredge locations for our searchable holdings listed in the Index to Marine and Lacustrine Geological Samples database. This is a complete list of our holdings but it will be constantly updated with new information as we continue to digitally collate our collection.
								`}</MD>
										</Tab.Pane>
									),
								},
								{
									menuItem: 'Map Instructions',
									render: () => (
										<Tab.Pane attached={false} basic>
											<p>
												Below is a searchable map of the OSU-MGR sample
												collections. Follow steps 1-3 to locate a sample and
												associated data. Want to filter by cruise, core type,
												water depth, or other parameter? See the How to Filter
												instructions in the next box. 1) Choose Collection 2)
												Zoom to a desired location 3) Click on sample to view
												pop-up box
											</p>
										</Tab.Pane>
									),
								},
								{
									menuItem: 'How to Filter the Map',
									render: () => (
										<Tab.Pane attached={false} basic>
											<p>
												(1) Click on File icon (bottom right corner) (2) Click
												tab of desired collection (3) Under Options choose
												Filter (4) “Add expression” to filter. Be sure to click
												‘OK’ to see results
											</p>
										</Tab.Pane>
									),
								},
							]}
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
