import Head from 'next/head';
import { FunctionComponent } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { usePlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import { Container, Message } from 'semantic-ui-react';
import Layout from '../components/layout';

const Page: FunctionComponent<{ file: any }> = ({ file }) => {
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
	if (preview) {
		return getGithubPreviewProps({
			...previewData,
			fileRelativePath: 'content/404.json',
			parse: parseJson,
		});
	}
	return {
		props: {
			sourceProvider: null,
			error: null,
			preview: false,
			file: {
				fileRelativePath: 'content/404.json',
				data: (await import('../content/404.json')).default,
			},
		},
	};
};
