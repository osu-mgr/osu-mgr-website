import { FunctionComponent, useState } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { usePlugin, useFormScreenPlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import { Portal, Segment, Button, Tab } from 'semantic-ui-react';
import { useGitHubSiteForm } from '../common/site';
import SemanticMDX from '../components/semantic-mdx';
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
			{!open && (
				<Button
					circular
					size='mini'
					icon='info'
					onClick={() => setOpen(true)}
					style={{
						position: 'fixed',
						zIndex: 2400,
						right: 10,
						top: 10,
					}}
				/>
			)}
			<Portal onClose={() => setOpen(false)} open={open}>
				<div
					onClick={() => setOpen(false)}
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
							marginTop: '20vh',
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
							onTabChange={(e) => {
								e.stopPropagation();
							}}
							defaultActiveIndex={0}
							menu={{ secondary: true, pointing: true, stackable: true }}
							panes={[
								{
									menuItem: 'Overview',
									render: () => (
										<Tab.Pane
											attached={false}
											basic
											style={{ maxHeight: '60vh', overflowY: 'auto' }}
										>
											<SemanticMDX>{`
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

The map contains core, grab, and dredge locations for our searchable holdings listed in the Index to Marine and Lacustrine Geological Samples database. This is a complete list of our holdings but it will be constantly updated with new information as we continue to digitally collate our collection.
											`}</SemanticMDX>
										</Tab.Pane>
									),
								},
								{
									menuItem: 'Map Instructions',
									render: () => (
										<Tab.Pane
											attached={false}
											basic
											style={{ maxHeight: '60vh', overflowY: 'auto' }}
										>
											<SemanticMDX>{`
Follow steps 1-3 to locate a sample and associated data.

Want to filter by cruise, core type, water depth, or other parameter? See the How to Filter instructions in the next tab. 

<Grid columns="3">
	<GridColumn>
		<h5>1) Choose Collection</h5>
		<Image rounded bordered size="medium" src="/map-instructions-1.png"/>
	</GridColumn>
	<GridColumn>
		<h5>2) Zoom to a desired location</h5>
		<Image rounded bordered size="medium" src="/map-instructions-2.png"/>
	</GridColumn>
	<GridColumn>
		<h5>3) Click to view a sample</h5>
		<Image rounded bordered size="medium" src="/map-instructions-3.png"/>
	</GridColumn>
</Grid>
											`}</SemanticMDX>
										</Tab.Pane>
									),
								},
								{
									menuItem: 'How to Filter the Map',
									render: () => (
										<Tab.Pane
											attached={false}
											basic
											style={{ maxHeight: '60vh', overflowY: 'auto' }}
										>
											<SemanticMDX>{`
<Grid columns="4">
<GridColumn>
	<h5>1) Click on File icon (bottom right corner)</h5>
	<Image rounded bordered size="medium" src="/map-instructions-1.png"/>
</GridColumn>
<GridColumn>
	<h5>2) Click tab of desired collection</h5>
	<Image rounded bordered size="medium" src="/map-instructions-2.png"/>
</GridColumn>
<GridColumn>
	<h5>3) Under Options choose Filter</h5>
	<Image rounded bordered size="medium" src="/map-instructions-3.png"/>
</GridColumn>
<GridColumn>
	<h5>4) “Add expression” to filter, click ‘OK’</h5>
	<Image rounded bordered size="medium" src="/map-instructions-3.png"/>
</GridColumn>
</Grid>
										`}</SemanticMDX>
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
