import { FunctionComponent } from 'react';
import { parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { usePlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import { Container, Message } from 'semantic-ui-react';
import { useGitHubSiteForm } from '../common/site';
import { getGithubFilesStaticProps } from '../common/next-tinacms';
import Head from '../components/head';
import Layout from '../components/layout';

const Page: FunctionComponent<{ content: any }> = ({ content }) => {
	const [pageData, pageForm] = useGithubJsonForm(content.page, {
		label: 'Page',
		fields: [{ name: 'htmlTitle', component: 'text' }],
	});
	usePlugin(pageForm);
	const [siteData, siteForm] = useGitHubSiteForm(content.site);
	usePlugin(siteForm);
	return (
		<Layout navigation={siteData.navigation}>
			<Head
				siteTitle={siteData['siteTitle']}
				pageTitle={pageData['htmlTitle']}
			/>
			<Container style={{ display: 'flex', height: '50vh' }}>
				<Message
					error
					size='large'
					icon='warning'
					header='Error 404'
					content='This page is not found.'
					style={{ margin: 'auto', width: 'auto' }}
				/>
			</Container>
		</Layout>
	);
};

export default Page;

export const getStaticProps: GetStaticProps = async function ({
	preview,
	previewData,
}) {
	return await getGithubFilesStaticProps({
		preview,
		previewData,
		files: {
			site: {
				fileRelativePath: 'content/site.json',
				parse: parseJson,
			},
			page: {
				fileRelativePath: 'content/404.json',
				parse: parseJson,
			},
		},
	});
};
