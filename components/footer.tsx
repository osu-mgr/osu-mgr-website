import React, { FunctionComponent } from 'react';
import { Image, Segment, Grid, List, Container } from 'semantic-ui-react';
import Link from '../components/link';
import nsfLogo from '../images/nsf-logo.png';
import noaaLogo from '../images/noaa-logo.png';
import osuLogo from '../images/osu-logo.png';
import nypro from '../images/nypro.png';
import fiesta from '../images/FIESTA.png';
import map from '../images/map.png';

const Footer: FunctionComponent = () => {
	return (
		<>
			<Segment inverted attached style={{ border: 'none' }}>
				<Container>
					<div className='container'>
						<Grid textAlign='center' stackable>
							<Grid.Column width='4'>
								<h3>Supported By</h3>
                                <Grid textAlign='center' columns={4}>
                                    <Grid.Column>
                                        <Link href='https://www.nsf.gov'>
                                            <Image
                                                inline
                                                src={nsfLogo}
                                                style={{ height: '3em', marginBottom: '0.5em' }}
                                            />
                                            NSF
                                        </Link>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Link href='https://noaa.gov'>
                                            <Image
                                                inline
                                                src={noaaLogo}
                                                style={{ height: '3em', marginBottom: '0.5em' }}
                                            />
                                            NOAA
                                        </Link>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Link href='https://oregonstate.edu'>
                                            <Image
                                                inline
                                                src={osuLogo}
                                                style={{ height: '3em', marginBottom: '0.5em' }}
                                            />
                                            OSU
                                        </Link>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Link href='https://earthref.org/FIESTA'>
                                            <Image
                                                inline
                                                src={fiesta}
                                                style={{ height: '3em', filter: 'drop-shadow(0px 0px 4px white); brightness(2)', marginBottom: '0.5em' }}
                                            />
                                            FIESTA
                                        </Link>
                                    </Grid.Column>
                                </Grid>
							</Grid.Column>
							<Grid.Column width='3'>
								<Segment
									inverted
									compact
									basic
									style={{ padding: 0, margin: 'auto' }}
								>
									<h3>Mailing Address</h3>
									<List inverted>
										<List.Item
											as='a'
											href='https://goo.gl/maps/xf53rxABNqSvXnjE6'
											rel='noreferrer'
											target='_blank'
										>
											<List.Icon
												name='marker'
												size='large'
												verticalAlign='middle'
											/>
											<List.Content>
												<List.Description>
													OSU-MGR
													<br />
													4700 SW Research Way
													<br />
													Corvallis, Oregon 97333
													<br />
													United States
												</List.Description>
											</List.Content>
										</List.Item>
									</List>
								</Segment>
							</Grid.Column>
							<Grid.Column width='4'>
								<Segment
									inverted
									compact
									basic
									style={{ padding: 0, margin: 'auto' }}
								>
									<h3>Contact Us</h3>
									<List inverted>
										<List.Item as='a' href='mailto:osu-mgr@oregonstate.edu'>
											<List.Icon
												name='mail'
												size='large'
												verticalAlign='middle'
											/>
											<List.Content>
												<List.Description>
													osu-mgr@oregonstate.edu
												</List.Description>
											</List.Content>
										</List.Item>
										<List.Item as='a' href='tel:(+1) 541-737-8210'>
											<List.Icon
												name='call'
												size='large'
												verticalAlign='middle'
											/>
											<List.Content>
												<List.Description>(+1) 541-737-8210</List.Description>
											</List.Content>
										</List.Item>
										<List.Item as='a' href='https://twitter.com/osumgr'>
											<List.Icon
												name='twitter'
												size='large'
												verticalAlign='middle'
											/>
											<List.Content>
												<List.Description>Twitter Feed</List.Description>
											</List.Content>
										</List.Item>
									</List>
								</Segment>
							</Grid.Column>
							<Grid.Column width='2'>
								<a
									href='https://goo.gl/maps/hL3SYJaRDU4189CG7'
									rel='noreferrer'
									target='_blank'
								>
									<Image
										rounded
										src={nypro}
										style={{ height: '8em', margin: 'auto' }}
									/>
								</a>
							</Grid.Column>
							<Grid.Column width='2'>
								<a
									href='https://goo.gl/maps/xf53rxABNqSvXnjE6'
									rel='noreferrer'
									target='_blank'
								>
									<Image
										rounded
										src={map}
										style={{ height: '8em', margin: 'auto' }}
									/>
								</a>
							</Grid.Column>
						</Grid>
					</div>
				</Container>
			</Segment>
			<style jsx>{`
				.logo {
					height: 100%;
					padding-right: 1em;
					margin: auto 1em auto 0;
					border-right: 1px solid white;
					display: flex;
					align-items: center;
				}

				.osu {
					height: 3em;
				}

				@media only screen and (max-width: 991px) {
					.logo {
						height: 100%;
						padding: 0;
						border: 0;
						margin: auto auto 1em auto;
						display: flex;
						align-items: center;
					}

					.osu {
						height: 4em;
						margin: auto;
					}
				}
			`}</style>
		</>
	);
};

export default Footer;
