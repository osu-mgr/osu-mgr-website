import { FunctionComponent, useState } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { usePlugin, useFormScreenPlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import { Portal, Segment, Button, Tab } from 'semantic-ui-react';
import { useGitHubSiteForm } from '../common/site';
import Head from '../components/head';
import Layout from '../components/layout';

const Map: FunctionComponent = () => {
	return (
		<>
			<iframe
				className='map'
				scrolling='no'
				src='https://osugisci.maps.arcgis.com/apps/webappviewer/index.html?id=fa64a80b411b47ea8aa036a50b167b08'
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
			<Portal onClose={() => setOpen(false)} open={open} closeOnDocumentClick>
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
									menuItem: 'Instructions',
									render: () => (
										<Tab.Pane
											attached={false}
											basic
											style={{ maxHeight: '60vh', overflowY: 'auto' }}
										>
											<p>
												Welcome to the NOAA Collection. Here you will find tabs
												consisting of a sample location map and a list of all
												the cruises hosted by the OSU-MGR.
											</p>
											<p>
												For a digital map of cruise locations and goals see the
												map below or the NOAA Digital Atlas. Dive location dots
												below may represent multiple collected samples. Please
												zoom in to see different samples from the same dive.
											</p>
											<p>
												Sample images and descriptions can be found on the
												individual expedition sites.
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
