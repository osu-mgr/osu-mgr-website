import Head from 'next/head';
import { FunctionComponent } from 'react';
import { parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { usePlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import { InlineForm, InlineText } from 'react-tinacms-inline';
import { useGitHubSiteForm } from '../common/site';
import { getGithubFilesStaticProps } from '../common/next-tinacms';
import Layout from '../components/layout';

const Page: FunctionComponent<{ content: any }> = ({ content }) => {
	const [pageData, pageForm] = useGithubJsonForm(content.page, {
		label: 'Page',
		fields: [{ name: 'HTML Title', component: 'text' }],
	});
	usePlugin(pageForm);
	const [siteData, siteForm] = useGitHubSiteForm(content.site);
	usePlugin(siteForm);
	return (
		<Layout>
			<Head>
				<title>
					{pageData['HTML Title'] || ''}
					{(pageData['HTML Title'] && siteData['Site Title'] && '|') || ''}
					{siteData['Site Title'] || ''}
				</title>
			</Head>
			<InlineForm form={pageForm}>
				<h1>
					<InlineText name='Page Title' />
				</h1>
			</InlineForm>
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
