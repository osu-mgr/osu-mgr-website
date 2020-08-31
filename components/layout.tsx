import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FunctionComponent } from 'react';
import { Menu, Container, Image, Dropdown, Grid, List } from 'semantic-ui-react';
import { useCMS } from 'tinacms';

const MenuItemLink: FunctionComponent<{
	link: string;
	text: string;
}> = ({ link, text }) => {
	const router = useRouter();
	return (
		<Link href={link}>
			<Menu.Item
				active={router.pathname === link}
				as='a'
				name={text}
				style={{ textAlign: 'center', height: '100%', flexShrink: 1 }}
			>
				{text}
			</Menu.Item>
		</Link>
	);
};

const MenuItemDropdown: FunctionComponent<{
	text: string;
	items: {
		link: string;
		text: string;
	}[];
}> = ({ text, items }) => {
	const router = useRouter();
	return (
		<Dropdown
			item
			floating
			style={{ flexShrink: 1, height: '100%', padding: 0, border: 0 }}
			trigger={
				<Menu.Item
					active={items.reduce(
						(tf, x) => tf || x.link === router.pathname,
						false
					)}
					as='a'
					name={text}
					style={{
						textAlign: 'center',
						height: '100%',
						flexShrink: 1,
						marginRight: 'calc(-1em - 7.5px)',
					}}
				>
					{text}
				</Menu.Item>
			}
		>
			<Dropdown.Menu>
				{items.map((x) => (
					<Link href={x.link} key={x.text}>
						<Dropdown.Item text={x.text} active={x.link === router.pathname} />
					</Link>
				))}
			</Dropdown.Menu>
		</Dropdown>
	);
};

const Header: FunctionComponent = () => {
	return (
		<>
			<Menu pointing secondary inverted>
				<Container>
					<div className='logo'>
						<img height='40' width='125' src='/logo.png' />
					</div>
					<MenuItemLink link='/' text='Home' />
					<MenuItemDropdown
						text='About Us'
						items={[
							{ link: '/about-us', text: 'Contact Information' },
							{ link: '/staff', text: 'Staff' },
							{ link: '/facility-history', text: 'Facility History' },
						]}
					/>
					<MenuItemDropdown
						text='Collections'
						items={[
							{ link: '/collections', text: 'OSU Main Collection' },
							{ link: '/noaa-ex', text: 'NOAA Hosted Collection' },
							{
								link: '/repositories',
								text: 'Other Repositories and Databases',
							},
						]}
					/>
					<MenuItemLink link='/services' text='Facilities & Services' />
					<MenuItemLink link='/request-samples' text='Request Samples' />
					<MenuItemLink
						link='/repository-calendar'
						text='Repository Calendar'
					/>
					<MenuItemDropdown
						text='Software Resources'
						items={[
							{ link: '/sedct', text: 'SedCT' },
							{ link: '/corelyzer', text: 'Corelyzer' },
						]}
					/>
					<MenuItemDropdown
						text='Education & Outreach, Meetings'
						items={[
							{ link: '/education-outreach', text: 'Education & Outreach' },
							{
								link:
									'/2017-meeting-of-the-curators-of-marine-lacustrine-and-geological-samples',
								text: '2017 Curators Meeting',
							},
						]}
					/>
					<MenuItemLink link='/publications' text='Publications' />
				</Container>
			</Menu>
			<style jsx>{`
				.logo {
					height: 100%;
					padding-right: 1em;
					margin: auto 1em auto 0;
					border-right: 1px solid white;
					display: flex;
					align-items: center;
				}
			`}</style>
		</>
	);
};

const Layout: FunctionComponent = ({ children }) => {
	const cms = useCMS();
	return (
		<>
			<Head>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<header>
				<Header />
			</header>
			<main>
				<div className='falseHeader'>
					<Header />
				</div>
				<Container>{children}</Container>
			</main>
			<footer>
				<Container>
					<Grid>
						<Grid.Column width='4'>
							<h3>Supported By</h3>
							<Image inline src='nsf.png' style={{ height: '4em', marginRight: '1em' }} />
							<Image inline src='osu.png' style={{ height: '4em' }} />
						</Grid.Column>
						<Grid.Column width='4'>
							<h3>Mailing Address</h3>
							<List>
								<List.Item>
									<List.Icon name='marker' size='large' verticalAlign='middle' />
									<List.Content>
										<List.Description as='a' href='https://goo.gl/maps/xf53rxABNqSvXnjE6' rel='noreferrer' target='_blank'>
											OSU Marine and Geology Repository
											4700 SW Research Way
											Corvallis, Oregon 97333
										</List.Description>
									</List.Content>
								</List.Item>
							</List>
						</Grid.Column>
						<Grid.Column width='4'>
							<h3>Contact Us</h3>
							<List>
								<List.Item>
									<List.Icon name='mail' size='large' verticalAlign='middle' />
									<List.Content>
										<List.Description>
											Email: <a href='mailto:osu-mgr@oregonstate.edu'>osu-mgr@oregonstate.edu</a>
										</List.Description>
									</List.Content>
								</List.Item>
								<List.Item>
									<List.Icon name='call' size='large' verticalAlign='middle' />
									<List.Content>
										<List.Description>
										Phone: <a href='tel:(+1) 541-737-8210'>(+1) 541-737-8210</a>
										</List.Description>
									</List.Content>
								</List.Item>
							</List>
						</Grid.Column>
						<Grid.Column width='2'>
							<a href='https://goo.gl/maps/xf53rxABNqSvXnjE6' rel='noreferrer' target='_blank'>
								<Image bordered src='nypro.png' style={{ height: '8em' }} />
							</a>
						</Grid.Column>
						<Grid.Column width='2'>
							<a href='https://goo.gl/maps/xf53rxABNqSvXnjE6' rel='noreferrer' target='_blank'>
								<Image bordered src='map.png' style={{ height: '8em' }} />
							</a>
						</Grid.Column>
					</Grid>
				</Container>
			</footer>
			<style jsx>{`
				header {
					position: fixed;
					width: 100%;
					background: black;
					padding: 1em 0;
					z-index: 1;
				}
				.falseHeader {
					width: 100%;
					padding: 1em 0;
					visibility: hidden;
					margin-bottom: 2em;
				}
				main {
					min-height: calc(
						100vh - 10em - ${cms && cms.enabled ? '62px' : '0px'}
					);
					width: 100%;
					padding: 0 0 2em;
				}
				footer {
					width: 100%;
					height: 10em;
					padding: 1em;
					background-color: #f5f5f5;
				}
			`}</style>

			<style jsx global>{`
				html,
				body {
					padding: 0;
					margin: 0;
				}
				body {
					overflow-y: scroll;
				}
				* {
					box-sizing: border-box;
				}
				a {
					color: #D73F09
				}
			`}</style>
		</>
	);
};

export default Layout;
