import { FunctionComponent } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { useCMS, usePlugin, BlockTemplate } from 'tinacms';
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

const blockTemplate: BlockTemplate = {
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
		template: blockTemplate,
	},
};

const Page: FunctionComponent<{ page: any; site: any }> = ({ page, site }) => {
	const [pageData, pageForm] = useGithubJsonForm(page, {
		label: 'Page',
		fields: [
			{
				name: 'htmlTitle',
				component: 'text',
			},
		],
	});
	usePlugin(pageForm);
	const [siteData, siteForm] = useGitHubSiteForm(site);
	usePlugin(siteForm);
	return (
		<>
			<Layout navigation={siteData.navigation}>
				<Head
					siteTitle={siteData['siteTitle']}
					pageTitle={pageData['htmlTitle']}
				/>
				<InlineForm form={pageForm}>
					<Image fluid rounded>
						<video autoPlay loop muted>
							<source src='osu-mgr-loop.mp4' type='video/mp4' />
						</video>
						<div className='videoCover'>
							<Segment
								vertical
								inverted
								textAlign='center'
								style={{ background: 'none' }}
							>
								<img className='videoCoverLogo' src='/logo.svg' />
								<Grid relaxed='very' columns='2'>
									<Grid.Column textAlign='right'>
										<Link href='samples-request'>
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
					<Message
						warning
						size='large'
						icon='warning'
						header='Current changes due to COVID-19'
						content={`
						The repository will remain open and partially operational during the current pandemic.
						We will still process sample requests and analyze cores as requested. We are currently not accepting visitors or providing tours of our facility. 
						Thank you for your understanding.`}
					/>
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
					<Segment padded='very' vertical>
						<InlineBlocks
							className='ui stackable divided equal width grid'
							name='Columns'
							blocks={ColumnsBlocks}
							direction='horizontal'
						/>
					</Segment>
					<Segment padded='very' vertical>
						<Link href='education-outreach'>
							<Grid stackable>
								<Grid.Column width='13'>
									<Header content='Education and Outreach' />
									<Container textAlign='justified'>
										<p>
											Tours and outreach activities cover a wide variety of
											topics and can be tailored to the group. Recent activities
											have hosted both K-12 and undergraduate and postgraduate
											groups. A typical educational visit lasts approximately 1
											hour, and begins with a presentation of how we collect the
											cores in our collection, followed by a tour of the
											facilities so students can see where we house our
											collection, including our 10,900 sq-ft refrigerator.
											Following the facility tour, there are opportunities to
											view cores from all over the world. Hands-on activities
											include using microscopes to view microfossils, simulating
											coring with mini-cores and mud cakes, and mapping
											exercises. Our collections cover time periods ranging from
											sediment deposited on the ocean floor in the last few
											years to sediments that are millions of years old giving
											students the opportunity to learn about ocean processes
											occurring in different places and over multiple time
											scales.
										</p>
									</Container>
								</Grid.Column>
								<Grid.Column width='3' textAlign='center'>
									<Image rounded inline size='small' src='education.png' />
								</Grid.Column>
							</Grid>
						</Link>
					</Segment>
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
