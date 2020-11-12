import { FunctionComponent } from 'react';
import { parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { useCMS } from 'tinacms';
import { usePlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import { Container } from 'semantic-ui-react';
import { useGitHubSiteForm } from '../common/site';
import { getGithubFilesStaticProps } from '../common/next-tinacms';
import Head from '../components/head';
import Layout from '../components/layout';
import PrimaryButton from '../components/primaryButton';

const Page: FunctionComponent<{ content: any }> = ({ content }) => {
	const cms = useCMS();
	const [pageData, pageForm] = useGithubJsonForm(content.page, {
		label: 'Page',
		fields: [{ name: 'htmlTitle', component: 'text' }],
	});
	usePlugin(pageForm);
	const [siteData, siteForm] = useGitHubSiteForm(content.site);
	usePlugin(siteForm);
	return (
		<Layout>
			<Head
				siteTitle={siteData['siteTitle']}
				pageTitle={pageData['htmlTitle']}
			/>
			<Container textAlign='center'>
				<PrimaryButton onClick={() => cms.toggle()} size='huge'>
					{cms.enabled ? 'Exit Editing' : 'Enable Editing'}
				</PrimaryButton>
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
				fileRelativePath: 'content/edit.json',
				parse: parseJson,
			},
		},
	});
};
