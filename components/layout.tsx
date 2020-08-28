import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FunctionComponent } from 'react';
import { Menu, Container, Button } from 'semantic-ui-react';
import { useCMS } from 'tinacms';

const Layout: FunctionComponent = ({ children }) => {
	const router = useRouter();
	const cms = useCMS();
	return (
		<>
			<Head>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<header>
				<Menu pointing secondary inverted>
					<Container>
						<img height='38' width='134' className='logo' src='/logo.png' />
						<Link href='/'>
							<Menu.Item active={router.pathname === '/'} as='a' name='home'>
								Home
							</Menu.Item>
						</Link>
						<Link href='/about-us'>
							<Menu.Item
								active={router.pathname === '/about-us'}
								as='a'
								name='about-us'
							>
								About Us
							</Menu.Item>
						</Link>
					</Container>
				</Menu>
			</header>
			<main>
				<Container>{children}</Container>
			</main>
			<footer>
				<Menu secondary style={{ height: '4em' }}>
					<Container>
						<Menu.Item position='right'>
							<Button as='a' basic onClick={() => cms && cms.toggle()}>
								{cms && cms.enabled ? 'Exit Editing' : 'Editor Login'}
							</Button>
						</Menu.Item>
					</Container>
				</Menu>
			</footer>
			<style jsx>{`
				header {
					position: fixed;
					width: 100%;
					background: black;
					padding: 1em 0;
				}
				.logo {
					padding-right: 1em;
					margin-right: 1em;
					border-right: 1px solid white;
				}
				main {
					min-height: calc(
						100vh - 4em - ${cms && cms.enabled ? '62px' : '0px'}
					);
					width: 100%;
					padding: 6em 0 2em;
				}
				footer {
					width: 100%;
					height: 4em;
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
			`}</style>
		</>
	);
};

export default Layout;
