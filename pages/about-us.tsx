import Head from 'next/head';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { usePlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import { InlineForm, InlineText } from 'react-tinacms-inline';
import Layout from '../components/layout';

const Page = ({ file }: { file: any }): JSX.Element => {
	const [data, form] = useGithubJsonForm(file, {
		label: 'Page',
		fields: [{ name: 'HTML Title', component: 'text' }],
	});
	usePlugin(form);
	return (
		<Layout>
			<Head>
				<title>{data['HTML Title'] || ''}</title>
			</Head>
			<InlineForm form={form}>
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
	if (preview) {
		return getGithubPreviewProps({
			...previewData,
			fileRelativePath: 'content/about-us.json',
			parse: parseJson,
		});
	}
	return {
		props: {
			sourceProvider: null,
			error: null,
			preview: false,
			file: {
				fileRelativePath: 'content/about-us.json',
				data: (await import('../content/about-us.json')).default,
			},
		},
	};
};
