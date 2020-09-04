import Head from 'next/head';
import { FunctionComponent, useState } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { usePlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import { Portal, Segment, Button, Header } from 'semantic-ui-react';
import Layout from '../components/layout';

const Map: FunctionComponent = () => {
	return (
		<>
      <iframe className='map' scrolling="no" src="https://osugisci.maps.arcgis.com/apps/webappviewer/index.html?id=56819d2b62674659aab2f67d793cebc8" />
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

export const Page: FunctionComponent<{ file: any }> = ({ file }) => {
  const [open, setOpen] = useState(true);
	const [data, form] = useGithubJsonForm(file, {
		label: 'Page',
		fields: [{ name: 'HTML Title', component: 'text' }],
	});
	usePlugin(form);
	return (
		<Layout fullWidth>
			<Head>
				<title>{ data['HTML Title'] || '' }</title>
			</Head>
      <Portal onClose={() => setOpen(false)} open={open}>
        <Segment
          style={{
            left: '40%',
            position: 'fixed',
            top: '50%',
            zIndex: 1000,
          }}
        >
          <Header>This is a controlled portal</Header>
          <p>Portals have tons of great callback functions to hook into.</p>
          <p>To close, simply click the close button or click away</p>

          <Button
            content='Close Portal'
            negative
            onClick={() => setOpen(false)}
          />
        </Segment>
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
		return getGithubPreviewProps({
			...previewData,
			fileRelativePath: 'content/collections.json',
			parse: parseJson,
		});
	}
	return {
		props: {
			sourceProvider: null,
			error: null,
			preview: false,
			file: {
				fileRelativePath: 'content/collections.json',
				data: (await import('../content/collections.json')).default,
			},
		},
	};
};
