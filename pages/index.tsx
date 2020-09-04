import Head from 'next/head';
import { FunctionComponent } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { usePlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import Layout from '../components/layout';
import Link from '../components/link';
import PrimaryButton from '../components/primaryButton';
import { Segment, Header, Icon, Message, Grid, Image, Container } from 'semantic-ui-react';

export const Page: FunctionComponent<{ file: any }> = ({ file }) => {
	const [data, form] = useGithubJsonForm(file, {
		label: 'Page',
		fields: [{ name: 'HTML Title', component: 'text' }],
	});
	usePlugin(form);
	return (
		<>
			<Layout>
				<Head>
					<title>{data['HTML Title'] || ''}</title>
				</Head>
				<Image fluid rounded>
					<video autoPlay loop muted>
						<source src="osu-mgr-loop.vp8.webm" type="video/webm"/>
					</video>
					<div className='videoCover'>
						<Segment vertical inverted textAlign='center' style={{ background: 'none' }}>
							<Header as='h1' inverted style={{ fontSize: '3rem' }}>
								Oregon State University<br/>
								Marine and Geology Repository
							</Header>
							<Grid relaxed='very' columns='2'>
								<Grid.Column textAlign='right'>
									<Link href='samples-request'>
										<PrimaryButton size='huge'>
											Request Samples
										</PrimaryButton>
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
				<Message warning size='large' icon='warning' header='Current changes due to COVID-19' content={`
					The repository will remain open and partially operational during the current pandemic.
					We will still process sample requests and analyze cores as requested. We are currently not accepting visitors or providing tours of our facility. 
					Thank you for your understanding.`}/>
				<Segment padded='very' vertical>
					<Grid stackable>
						<Grid.Column width='2'>
							<Icon name='quote left' size='huge'/>
						</Grid.Column>
						<Grid.Column width='12'>
							<Header as='h2'>
								Our mission is to facilitate research, education, and the advancement of scientific knowledge through access and use of our diverse collection of rock, lake, and marine sediment samples.
							</Header>
						</Grid.Column>
						<Grid.Column width='2' textAlign='right'>
							<Icon name='quote right' size='huge'/>
						</Grid.Column>
					</Grid>
				</Segment>
				<Segment padded='very' vertical>
					<Grid stackable divided columns='3'>
						<Grid.Column>
							<Link href='request-samples'>
								<Image centered circular size='small' src='request.png'/>
								<Header content='Sample Requests' textAlign='center' />
								<Container textAlign='justified'>
									<p>
										At OSU-MGR we distribute thousands of sediment and hard rock samples on an annual basis to researchers all over the world.
										As an NSF-OCE-MGG funded facility, the OSU-MGR (and therefore PI’s who curate their samples) is bound by the NSF-OCE data policy for NSF-OCE funded projects.
										Samples from cores and sediment traps, information on sampling stations, and descriptions of materials from the OSU collection are provided to qualified scientific investigators upon receipt of well-documented requests.
										Materials for educational purposes and museum displays may also be available in limited quantities.
									</p>
								</Container>
								<Header textAlign='center'>
									<PrimaryButton>
										Request Samples
										<Icon name='arrow right' />
									</PrimaryButton>
								</Header>		
							</Link>
						</Grid.Column>
						<Grid.Column>
							<Link href='collections'>
								<Image centered circular size='small' src='collections.png'/>
								<Header content='Collections' textAlign='center' />
								<Container textAlign='justified'>
									<p>
										The collection includes more than 22 miles of oceanic sediment cores and tens of thousands of marine rock specimens that provide scientists an archive of Earth’s history, including changes in climate, biology, volcanic and seismic activity, meteorite interactions and more. 
										In 2017, the university was awarded stewardship of the Antarctic and Southern Ocean National Collection of Rock and Sediment Cores, which had been housed at Florida State University, by the National Science Foundation.
										The Florida State collection was transferred to Oregon State via 14 50-foot refrigerated semi-trucks over the summer of 2019.
									</p>
								</Container>
								<Header textAlign='center'>
									<PrimaryButton>
										Browse Collections
										<Icon name='arrow right' />
									</PrimaryButton>
								</Header>		
							</Link>
						</Grid.Column>
						<Grid.Column>
							<Link href='virtual-tour'>
								<Image centered circular size='small' src='facility.png'/>
								<Header content='Facility' textAlign='center' />
								<Container textAlign='justified'>
									<p>
										The Oregon State University Marine and Geology Repository (OSU-MGR) is a National Science Foundation (NSF) funded repository that hosts the OSU Marine Geology and Geophysics collection and the Antarctic Core Collection.
										OSU moved its existing collection from storage on campus to the new 33,000 ft² facility that includes 10,900 ft² of refrigerated core storage, 11,600 ft² of dry rock storage and a 550 ft² walk-in freezer.
										The facility is well equipped to run major sampling parties, research programs, and educational endeavors.
										Laboratory space is available for analytical activities including scanning tracks for physical properties and elemental analyses.
									</p>
								</Container>
								<Header textAlign='center'>
									<PrimaryButton>
										Virtual Tour
										<Icon name='arrow right' />
									</PrimaryButton>
								</Header>
							</Link>
						</Grid.Column>
					</Grid>
				</Segment>
				<Segment padded='very' vertical>
					<Link href='education-outreach'>
						<Grid stackable>
							<Grid.Column width='13'>
									<Header content='Education and Outreach'/>
									<Container textAlign='justified'>
										<p>
											Tours and outreach activities cover a wide variety of topics and can be tailored to the group. Recent activities have hosted both K-12 and undergraduate and postgraduate groups.
											A typical educational visit lasts approximately 1 hour, and begins with a presentation of how we collect the cores in our collection, followed by a tour of the facilities so students can see where we house our collection, including our 10,900 sq-ft refrigerator. Following the facility tour, there are opportunities to view cores from all over the world. Hands-on activities include using microscopes to view microfossils, simulating coring with mini-cores and mud cakes, and mapping exercises.
											Our collections cover time periods ranging from sediment deposited on the ocean floor in the last few years to sediments that are millions of years old giving students the opportunity to learn about ocean processes occurring in different places and over multiple time scales.
										</p>
									</Container>
							</Grid.Column>
							<Grid.Column width='3' textAlign='center'>
								<Image rounded inline size='small' src='education.png'/>
							</Grid.Column>
						</Grid>
					</Link>
				</Segment>
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
						background: rgba(0, 0, 0, .5);
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
		return getGithubPreviewProps({
			...previewData,
			fileRelativePath: 'content/index.json',
			parse: parseJson,
		});
	}
	return {
		props: {
			sourceProvider: null,
			error: null,
			preview: false,
			file: {
				fileRelativePath: 'content/index.json',
				data: (await import('../content/index.json')).default,
			},
		},
	};
};
