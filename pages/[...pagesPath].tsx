import { FunctionComponent } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useCMS, usePlugin, useFormScreenPlugin } from 'tinacms';
import { InlineForm, InlineBlocks, BlocksControls } from 'react-tinacms-inline';
import { InlineWysiwyg } from 'react-tinacms-editor';
import { useGithubJsonForm } from 'react-tinacms-github';
import { useRouter } from 'next/router';
import { Menu, Container, Message, Icon, Image } from 'semantic-ui-react';
import { useGitHubSiteForm } from '../common/site';
import SemanticMDX from '../components/semantic-mdx';
import Head from '../components/head';
import Layout from '../components/layout';
import Link from '../components/link';

const shouldRedirect = (path) => path.match(/^\/(OSU-|noaa-ex).+$/i);

const MarkdownBlock: FunctionComponent<{ data: any; index: number }> = ({
	data,
	index,
}) => {
	return (
		<BlocksControls index={index}>
			<InlineWysiwyg
				name='body'
				format='markdown'
			>
				<SemanticMDX>{data.body}</SemanticMDX>
			</InlineWysiwyg>
		</BlocksControls>
	);
};

const markdownBlockTemplate = {
	label: 'Markdown',
	defaultItem: {
		body: '',
	},
};

const ImageBlock: FunctionComponent<{ data: any; index: number }> = ({
	data,
	index,
}) => {
	const cms = useCMS();
	const image = (
		<>
			{cms.enabled && (data.floated === 'Left' || data.floated === 'Right') && (
				<div
					style={{
						borderBottom: '2px dashed var(--tina-color-primary)',
						marginBottom: '-2px',
					}}
				></div>
			)}
			<Image
				rounded
				bordered
				fluid={data.size === 'Full Width'}
				size={
					data.size !== 'Default' &&
					data.size !== 'Full Width' &&
					data.size.toLowerCase()
				}
				src={data.image}
				centered={data.floated === 'Center'}
				floated={
					data.floated !== 'None' &&
					data.floated !== 'Center' &&
					data.floated.toLowerCase()
				}
				style={{
					clear:
						data.floated !== 'None' &&
						data.floated !== 'Center' &&
						data.floated.toLowerCase(),
				}}
			/>
		</>
	);
	return (
		<BlocksControls index={index}>
			{(!cms.enabled && data.link && data.link !== '' && (
				<Link href={data.link}>{image}</Link>
			)) ||
				image}
		</BlocksControls>
	);
};

const imageBlockTemplate = {
	label: 'Image',
	defaultItem: {
		link: '',
		image: '',
		size: 'Medium',
		floated: 'Left',
	},
	fields: [
		{
			label: 'Link URL',
			name: 'link',
			component: 'text',
		},
		{
			label: 'Image',
			name: 'image',
			component: 'image',
			parse: (media) => media.filename,
		},
		{
			label: 'Size',
			name: 'size',
			component: 'select',
			options: [
				'Default',
				'Full Width',
				'Mini',
				'Tiny',
				'Small',
				'Medium',
				'Large',
				'Big',
				'Huge',
				'Massive',
			],
		},
		{
			label: 'Align',
			name: 'floated',
			component: 'select',
			options: ['None', 'Left', 'Center', 'Right'],
		},
	],
};

const ContentBlocks = {
	markdown: {
		Component: MarkdownBlock,
		template: markdownBlockTemplate,
	},
	image: {
		Component: ImageBlock,
		template: imageBlockTemplate,
	},
};

const Page: FunctionComponent<{ pagesContent: any; site: any }> = ({
	pagesContent,
	site,
}) => {
	if (!site || !pagesContent) return <></>;
	const router = useRouter();
	const { pagesPath } = router.query;
	const pagesPaths: string[] = Array.isArray(pagesPath)
		? pagesPath
		: [pagesPath];
	const path = `/${pagesPaths.join('/')}`;

	const [siteData, siteForm] = useGitHubSiteForm(site);
	useFormScreenPlugin(siteForm);

	if (typeof window !== 'undefined' && shouldRedirect(path)) {
		window.location.replace(
			'http://core-repository.ceoas.oregonstate.edu' + path
		);
		return (
			<Layout navigation={siteData.navigation}>
				<Container style={{ display: 'flex', height: '50vh' }}>
					<Message
						icon
						warning
						size='large'
						style={{ margin: 'auto', width: 'auto' }}
					>
						<Icon name='circle notched' loading />
						<Message.Content>
							<Message.Header>Loading</Message.Header>
							Please stand by...
						</Message.Content>
					</Message>
				</Container>
			</Layout>
		);
	}

	const [pagesData, pagesForm] = useGithubJsonForm(pagesContent, {
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
	usePlugin(pagesForm);

	let navSiblings;
	siteData &&
		siteData['navigation'] &&
		siteData['navigation'].forEach((navItem) => {
			navItem &&
				navItem.menu &&
				navItem.menu.forEach((menuItem) => {
					if (menuItem.link === path) {
						navSiblings = navItem.menu;
					}
				});
		});

	return (
		<Layout navigation={siteData.navigation}>
			<Head siteTitle={siteData['siteTitle']} pageTitle={''} />
			{navSiblings && (
				<Menu secondary pointing stackable>
					{navSiblings.map((sibling) => (
						<Menu.Item
							key={sibling.id}
							as='a'
							href={sibling.link}
							active={sibling.link === path}
						>
							{sibling.text}
						</Menu.Item>
					))}
				</Menu>
			)}
			{pagesData.blocks && (
				<InlineForm form={pagesForm}>
					<InlineBlocks
						name='blocks'
						blocks={ContentBlocks}
						direction='vertical'
					/>
				</InlineForm>
			)}
			{!pagesData.blocks && (
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
			)}
		</Layout>
	);
};

export default Page;

export const getStaticPaths: GetStaticPaths = async function () {
  const fg = require("fast-glob");
  const contentDir = "content/pages";
  const files = await fg(`${contentDir}**/*.json`);
  const paths = files
    .map((file) => {
      const path = file.substring(contentDir.length + 1, file.length - 5);
      return { params: { pagesPath: [path] } };
    });
  return {
    fallback: true,
    paths,
  };
}

export const getStaticProps: GetStaticProps = async function ({
	preview,
	previewData,
	params,
}) {
	const { pagesPath } = params;
	const pagesPaths: string[] = Array.isArray(pagesPath)
		? pagesPath
		: [pagesPath];
	const path = pagesPaths.join('/');
	const redirecting = shouldRedirect(path);
	const fileRelativePath = redirecting ? 'content/redirect.json' : `content/pages/${path}.json`;

	if (preview) {
		const pagesContent = await getGithubPreviewProps({
			...previewData,
			fileRelativePath,
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
				pagesContent: pagesContent.props.file,
				site: site.props.file,
				error: pagesContent.props.error || site.props.error || null,
			},
		};
	}
	
	return {
		props: {
			sourceProvider: null,
			error: null,
			preview: false,
			pagesContent: {
				fileRelativePath,
				data: (redirecting ? await import('../content/redirect.json') : await import(`../content/pages/${path}.json`)).default
			},
			site: {
				fileRelativePath: 'content/site.json',
				data: (await import('../content/site.json')).default,
			},
		},
	};
};