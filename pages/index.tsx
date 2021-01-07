import { FunctionComponent } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { useCMS, usePlugin, useFormScreenPlugin, BlockTemplate } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import {
	InlineForm,
	InlineTextarea,
	InlineBlocks,
	BlocksControls,
	InlineText,
} from 'react-tinacms-inline';
import { useGitHubSiteForm } from '../common/site';
import Head from '../components/head';
import Layout from '../components/layout';
import Link from '../components/link';
import PrimaryButton from '../components/primaryButton';
import {
	Segment,
	Header,
	Icon,
	Message,
	Grid,
	Image,
	Container,
} from 'semantic-ui-react';
import logo from '../images/logo.svg';

const ColumnBlock: FunctionComponent<{ data: any; index: number }> = ({
	data,
	index,
}) => {
	const cms = useCMS();
	const block = (
		<>
			<Image centered circular size='small' src={data.image} />
			<Header textAlign='center'>
				<InlineText name='title' focusRing={false} />
			</Header>
			<Container textAlign='justified'>
				<InlineTextarea name='description' focusRing={false} />
			</Container>
			<Header textAlign='center'>
				<PrimaryButton>
					{data.button}
					<Icon name='arrow right' />
				</PrimaryButton>
			</Header>
		</>
	);
	return (
		<Grid.Column index={index}>
			<BlocksControls index={index}>
				{(!cms.enabled && <Link href={data.link}>{block}</Link>) || block}
			</BlocksControls>
		</Grid.Column>
	);
};

const columnBlockTemplate: BlockTemplate = {
	label: 'Column',
	defaultItem: {
		link: '/',
		image: '',
		title: 'Title',
		description: 'Description',
		button: 'Button',
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
			label: 'Button Text',
			name: 'button',
			component: 'text',
		},
	],
};

const ColumnsBlocks = {
	column: {
		Component: ColumnBlock,
		template: columnBlockTemplate,
	},
};
const RowBlock: FunctionComponent<{ data: any; index: number }> = ({
	data,
	index,
}) => {
	const cms = useCMS();
	const block = (
		<>
			<Grid stackable padded='horizontally'>
				<Grid.Column width='13'>
					<Header>
						<InlineText name='title' focusRing={false} />
					</Header>
					<Container textAlign='justified'>
						<InlineTextarea name='description' focusRing={false} />
					</Container>
				</Grid.Column>
				<Grid.Column width='3' textAlign='center'>
					<Image rounded inline size='small' src={data.image} />
				</Grid.Column>
			</Grid>
		</>
	);
	return (
		<Grid.Row index={index}>
			<BlocksControls index={index}>
				{(!cms.enabled && <Link href={data.link}>{block}</Link>) || block}
			</BlocksControls>
		</Grid.Row>
	);
};

const rowBlockTemplate: BlockTemplate = {
	label: 'Row',
	defaultItem: {
		link: '/',
		image: '',
		title: 'Title',
		description: 'Description',
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
	],
};

const RowsBlocks = {
	row: {
		Component: RowBlock,
		template: rowBlockTemplate,
	},
};

const Page: FunctionComponent<{ page: any; site: any }> = ({ page, site }) => {
	const [pageData, pageForm] = useGithubJsonForm(page, {
		label: 'Page',
		fields: [
			{
				label: 'Page Title',
				name: 'htmlTitle',
				component: 'text',
				description: 'Displayed in the browser tab.',
			},
			{
				label: 'Warning Message Visible',
				name: 'warningVisible',
				component: 'toggle',
			},
			{
				label: 'Mission Statement Visible',
				name: 'missionVisible',
				component: 'toggle',
			},
			{
				label: 'Columns Content Visible',
				name: 'columnsVisible',
				component: 'toggle',
			},
			{
				label: 'Rows Content Visible',
				name: 'rowsVisible',
				component: 'toggle',
			},
		],
	});
	usePlugin(pageForm);
	const [siteData, siteForm] = useGitHubSiteForm(site);
	useFormScreenPlugin(siteForm);
	return (
		<>
			<Layout navigation={siteData.navigation}>
				<Head siteTitle={siteData.siteTitle} pageTitle={pageData.htmlTitle} />
				<InlineForm form={pageForm}>
					<Image fluid rounded>
						<video autoPlay loop muted>
							<source src={pageData.video} type='video/mp4' />
						</video>
						<div className='videoCover'>
							<Segment
								vertical
								inverted
								textAlign='center'
								style={{ background: 'none' }}
							>
								<img className='videoCoverLogo' src={logo} />
								<Grid relaxed='very' columns='2'>
									<Grid.Column textAlign='right'>
										<Link href='request-samples'>
											<PrimaryButton size='huge'>Request Samples</PrimaryButton>
										</Link>
									</Grid.Column>
									<Grid.Column textAlign='left'>
										<Link href='collections'>
											<PrimaryButton size='huge'>
												Browse Collections
											</PrimaryButton>
										</Link>
									</Grid.Column>
								</Grid>
							</Segment>
						</div>
					</Image>
					{pageData.warningVisible && (
						<Message warning size='large' icon>
							<Icon name='warning' />
							<Message.Content>
								<Message.Header>
									<InlineTextarea name='warning.title' />
								</Message.Header>
								<InlineTextarea name='warning.message' />
							</Message.Content>
						</Message>
					)}
					{pageData.missionVisible && (
						<Segment padded='very' vertical>
							<Grid stackable>
								<Grid.Column width='2'>
									<Icon name='quote left' size='huge' />
								</Grid.Column>
								<Grid.Column width='12'>
									<Header as='h2'>
										<InlineTextarea name='mission' />
									</Header>
								</Grid.Column>
								<Grid.Column width='2' textAlign='right'>
									<Icon name='quote right' size='huge' />
								</Grid.Column>
							</Grid>
						</Segment>
					)}
					{pageData.columnsVisible && (
						<Segment padded='very' vertical>
							<InlineBlocks
								className='ui stackable divided equal width grid'
								name='columns'
								blocks={ColumnsBlocks}
								direction='horizontal'
							/>
						</Segment>
					)}
					{pageData.rowsVisible && (
						<Segment vertical>
							<InlineBlocks
								className='ui vertically divided grid'
								name='rows'
								blocks={RowsBlocks}
								direction='vertical'
							/>
						</Segment>
					)}
				</InlineForm>
			</Layout>
			<style jsx>{`
				video {
					display: block;
					width: 100%;
					height: 30em;
					object-fit: cover;
				}
				.videoCover {
					position: relative;
					height: 30em;
					margin: -30em 0 1em;
					display: flex;
					align-items: center;
					justify-content: center;
					background: rgba(0, 0, 0, 0.5);
				}
				.videoCoverLogo {
					height: 15em !important;
					margin: 0 auto 3em;
				}
			`}</style>
		</>
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
			fileRelativePath: 'content/index.json',
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
				fileRelativePath: 'content/index.json',
				data: (await import('../content/index.json')).default,
			},
			site: {
				fileRelativePath: 'content/site.json',
				data: (await import('../content/site.json')).default,
			},
		},
	};
};
