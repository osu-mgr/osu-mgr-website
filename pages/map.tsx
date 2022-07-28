import { FunctionComponent, useState } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useCMS, usePlugin, useFormScreenPlugin } from 'tinacms';
import { InlineForm } from 'react-tinacms-inline';
import { InlineWysiwyg } from 'react-tinacms-editor';
import { useGithubJsonForm } from 'react-tinacms-github';
import { Portal, Segment, Button, Tab } from 'semantic-ui-react';
import { useGitHubSiteForm } from '../common/site';
import SemanticMDX from '../components/semantic-mdx';
import Head from '../components/head';
import Layout from '../components/layout';

const Map: FunctionComponent<{ find }> = ({ find }) => {
	return (
		<>
			<iframe
				className='map'
				scrolling='no'
				src={`https://osugisci.maps.arcgis.com/apps/webappviewer/index.html?id=56819d2b62674659aab2f67d793cebc8${find ? `&find=${find}` : ''}`}
			/>
			<style jsx>{`
				.map {
					border: none;
					width: 100vw;
					flex-grow: 1;
				}
			`}</style>
		</>
	);
};

export const Page: FunctionComponent<{ page: any; site: any }> = ({
	page,
	site,
}) => {
	const cms = useCMS();
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
	const router = useRouter();
	const { find } = router.query;
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
						top: cms.enabled ? 'calc(10px + var(--tina-toolbar-height))' : 10,
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
						background: 'rgba(1,1,1,0.75)',
					}}
				>
					<Segment
						onClick={(e) => {
							e.stopPropagation();
						}}
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
						<InlineForm form={pageForm}>
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
												<InlineWysiwyg
													name='info.overview'
													format='markdown'
												>
													<SemanticMDX>{pageData.info.overview}</SemanticMDX>
												</InlineWysiwyg>
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
												<InlineWysiwyg
													name='info.instructions'
													format='markdown'
												>
													<SemanticMDX>{pageData.info.instructions}</SemanticMDX>
												</InlineWysiwyg>
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
												<InlineWysiwyg
													name='info.filter'
													format='markdown'
												>
													<SemanticMDX>{pageData.info.filter}</SemanticMDX>
												</InlineWysiwyg>
											</Tab.Pane>
										),
									},
								]}
							/>
						</InlineForm>
					</Segment>
				</div>
			</Portal>
			<Map find={find}/>
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
			fileRelativePath: 'content/map.json',
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
				fileRelativePath: 'content/map.json',
				data: (await import('../content/map.json')).default,
			},
			site: {
				fileRelativePath: 'content/site.json',
				data: (await import('../content/site.json')).default,
			},
		},
	};
};
