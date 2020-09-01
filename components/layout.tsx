import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FunctionComponent } from 'react';
import { Menu, Container, Image, Dropdown, Segment, Grid, List } from 'semantic-ui-react';

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
			<Segment inverted attached>
				<Menu secondary pointing stackable inverted>
					<Container>
						<div className='logo'>
							<img className='osu' src='/osu.png' />
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
						<MenuItemLink link='/services' text='Facilities, Services' />
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
							text='Education, Outreach, Meetings'
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

const Layout: FunctionComponent = ({ children }) => {
	return (
		<>
			<Head>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<header>
				<Header/>
			</header>
			<main>
				<div className='falseHeader'>
				<	Header/>
				</div>
				<Container>{children}</Container>
			</main>
			<footer>
				<Segment inverted attached>
					<Container><div className='container'>
						<Grid textAlign='center' stackable>
							<Grid.Column width='3'>
								<h3>Supported By</h3>
								<Image inline src='nsf.png' style={{ height: '4em', marginRight: '1em' }} />
								<Image inline src='osu-logo.png' style={{ height: '4em' }} />
							</Grid.Column>
							<Grid.Column width='3'>
								<h3>Mailing Address</h3>
								<List inverted>
									<List.Item>
										<List.Icon name='marker' size='large' verticalAlign='middle' />
										<List.Content>
											<List.Description as='a' href='https://goo.gl/maps/xf53rxABNqSvXnjE6' rel='noreferrer' target='_blank'>
												4700 SW Research Way<br/>
												Corvallis, Oregon 97333
											</List.Description>
										</List.Content>
									</List.Item>
								</List>
							</Grid.Column>
							<Grid.Column width='4'>
								<h3>Contact Us</h3>
								<List inverted>
									<List.Item>
										<List.Icon name='mail' size='large' verticalAlign='middle' />
										<List.Content>
											<List.Description>
												<a href='mailto:osu-mgr@oregonstate.edu'>osu-mgr@oregonstate.edu</a>
											</List.Description>
										</List.Content>
									</List.Item>
									<List.Item>
										<List.Icon name='call' size='large' verticalAlign='middle' />
										<List.Content>
											<List.Description>
												<a href='tel:(+1) 541-737-8210'>(+1) 541-737-8210</a>
											</List.Description>
										</List.Content>
									</List.Item>
								</List>
							</Grid.Column>
							<Grid.Column width='3'>
								<a href='https://goo.gl/maps/hL3SYJaRDU4189CG7' rel='noreferrer' target='_blank'>
									<Image bordered src='nypro.png' style={{ height: '8em', margin: 'auto' }} />
								</a>
							</Grid.Column>
							<Grid.Column width='3'>
								<a href='https://goo.gl/maps/xf53rxABNqSvXnjE6' rel='noreferrer' target='_blank'>
									<Image bordered src='map.png' style={{ height: '8em', margin: 'auto' }} />
								</a>
							</Grid.Column>
						</Grid>
					</div></Container>
				</Segment>
			</footer>
			<style jsx>{`
				header {
					position: fixed;
					width: 100%;
					z-index: 1000;
					border: none;
				}

				.falseHeader {
					width: 100%;
					visibility: hidden;
					margin-bottom: 1em;
				}

				main {
					min-height: calc(
						100vh - 10em
					);
					width: 100%;
					padding: 0 0 1em;
				}

				footer {
					width: 100%;
					height: 10em;
					border: none;
				}

				@media only screen and (max-width: 991px) {
					.container {
						max-width: 250px !important;
						margin: auto !important;
					}
					
					header {
						position: absolute;
					}
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
				a, .ui.inverted.list .item a:not(.ui) {
					color: #D73F09 !important;
				}
				a:hover, .ui.inverted.list .item a:not(.ui):hover {
					color: rgba(255, 255, 255, .9) !important;
				}
				::selection {
					background-color: #C6DAE7;
				}
				@media only screen and (max-width: 991px) {
					.ui.stackable.menu {
							-webkit-box-orient:vertical;
							-webkit-box-direction: normal;
							-ms-flex-direction: column;
							flex-direction: column
					}
			
					.ui.stackable.menu .item {
							width: 100%!important
					}
			
					.ui.stackable.secondary.pointing.menu .item {
							border: none;
							border-left: 2px solid transparent;
					}
			
					.ui.stackable.secondary.pointing.menu .item.active {
							border-left-color: white;
					}
			
					.ui.stackable.menu .item:before {
							position: absolute;
							content: '';
							top: auto;
							bottom: 0;
							left: 0;
							width: 100%;
							height: 1px;
							background: rgba(34,36,38,.1)
					}
			
					.ui.stackable.menu .left.item,.ui.stackable.menu .left.menu {
							margin-right: 0!important
					}
			
					.ui.stackable.menu .right.item,.ui.stackable.menu .right.menu {
							margin-left: 0!important
					}
			
					.ui.stackable.menu .left.menu,.ui.stackable.menu .right.menu {
							-webkit-box-orient: vertical;
							-webkit-box-direction: normal;
							-ms-flex-direction: column;
							flex-direction: column
					}
					
    			.ui.stackable.grid {
							width:auto;
							margin-left: 0!important;
							margin-right: 0!important
					}

					.ui.grid>.stackable.stackable.row>.column,.ui.stackable.grid>.column.grid>.column,.ui.stackable.grid>.column.row>.column,.ui.stackable.grid>.column:not(.row),.ui.stackable.grid>.row>.column,.ui.stackable.grid>.row>.wide.column,.ui.stackable.grid>.wide.column {
							width: 100%!important;
							margin: 0 0!important;
							-webkit-box-shadow: none!important;
							box-shadow: none!important;
							padding: 1rem 1rem!important
					}

					.ui.stackable.grid:not(.vertically)>.row {
							margin: 0;
							padding: 0
					}

					.ui.container>.ui.stackable.grid>.column,.ui.container>.ui.stackable.grid>.row>.column {
							padding-left: 0!important;
							padding-right: 0!important
					}

					.ui.grid .ui.stackable.grid,.ui.segment:not(.vertical) .ui.stackable.page.grid {
							margin-left: -1rem!important;
							margin-right: -1rem!important
					}

					.ui.stackable.celled.grid>.column:not(.row):first-child,.ui.stackable.celled.grid>.row:first-child>.column:first-child,.ui.stackable.divided.grid>.column:not(.row):first-child,.ui.stackable.divided.grid>.row:first-child>.column:first-child {
							border-top: none!important
					}

					.ui.inverted.stackable.celled.grid>.column:not(.row),.ui.inverted.stackable.celled.grid>.row>.column,.ui.inverted.stackable.divided.grid>.column:not(.row),.ui.inverted.stackable.divided.grid>.row>.column {
							border-top: 1px solid rgba(255,255,255,.1)
					}

					.ui.stackable.celled.grid>.column:not(.row),.ui.stackable.celled.grid>.row>.column,.ui.stackable.divided:not(.vertically).grid>.column:not(.row),.ui.stackable.divided:not(.vertically).grid>.row>.column {
							border-top: 1px solid rgba(34,36,38,.15);
							-webkit-box-shadow: none!important;
							box-shadow: none!important;
							padding-top: 2rem!important;
							padding-bottom: 2rem!important
					}

					.ui.stackable.celled.grid>.row {
							-webkit-box-shadow: none!important;
							box-shadow: none!important
					}

					.ui.stackable.divided:not(.vertically).grid>.column:not(.row),.ui.stackable.divided:not(.vertically).grid>.row>.column {
							padding-left: 0!important;
							padding-right: 0!important
					}
				}
			`}</style>
		</>
	);
};

export default Layout;
