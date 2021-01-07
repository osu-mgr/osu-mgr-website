import { FunctionComponent } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { useCMS, usePlugin, useFormScreenPlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import { Container, Icon, Message } from 'semantic-ui-react';
import { useGitHubSiteForm } from '../common/site';
import Head from '../components/head';
import Layout from '../components/layout';
import PrimaryButton from '../components/primaryButton';

const Page: FunctionComponent<{ page: any; site: any }> = ({ page, site }) => {
	const cms = useCMS();
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
		<Layout navigation={siteData.navigation}>
			<Head
				siteTitle={siteData['siteTitle']}
				pageTitle={pageData['htmlTitle']}
			/>
			<Container style={{ display: 'flex', height: '50vh' }}>
				{!cms.enabled && (
					<PrimaryButton
						onClick={() => cms.toggle()}
						size='huge'
						style={{ margin: 'auto', width: 'auto' }}
					>
						<Icon name={'edit'} />
						Enable Edit Mode
					</PrimaryButton>
				)}
				{cms.enabled && (
					<Message
						size='large'
						icon='edit'
						header='Edit Mode Enabled'
						content='Save changes and exit edit mode with the top menu.'
						style={{ margin: 'auto', width: 'auto' }}
					/>
				)}
			</Container>
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
			fileRelativePath: 'content/edit.json',
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
				fileRelativePath: 'content/edit.json',
				data: (await import('../content/edit.json')).default,
			},
			site: {
				fileRelativePath: 'content/site.json',
				data: (await import('../content/site.json')).default,
			},
		},
	};
};
