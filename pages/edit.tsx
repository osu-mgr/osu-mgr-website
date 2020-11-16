import Head from 'next/head';
import { FunctionComponent } from 'react';
import { useCMS } from 'tinacms';
import { Container } from 'semantic-ui-react';
import Layout from '../components/layout';
import PrimaryButton from '../components/primaryButton';

const Page: FunctionComponent = () => {
	const cms = useCMS();
	return (
		<Layout>
			<Head>
				<title>Edit Site</title>
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
