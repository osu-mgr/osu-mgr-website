import Head from 'next/head';
import { FunctionComponent } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { useCMS } from 'tinacms';
import { usePlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import { Container } from 'semantic-ui-react';
import Layout from '../components/layout';
import PrimaryButton from '../components/primaryButton';

const Page: FunctionComponent<{ file: any }> = ({ file }) => {
	const cms = useCMS();
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
	if (preview) {
		return getGithubPreviewProps({
			...previewData,
			fileRelativePath: 'content/edit.json',
			parse: parseJson,
		});
	}
	return {
		props: {
			sourceProvider: null,
			error: null,
			preview: false,
			file: {
				fileRelativePath: 'content/edit.json',
				data: (await import('../content/edit.json')).default,
			},
		},
	};
};
