import Head from 'next/head';
import React, { FunctionComponent } from 'react';
import { Container } from 'semantic-ui-react';
import { NavigationData } from '../common/site';
import Header from './header';
import Footer from './footer';

const Layout: FunctionComponent<{
	fullWidth?: boolean;
	navigation?: NavigationData[];
}> = ({ fullWidth, navigation, children }) => {
	return (
		<>
			<Head>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<header>
				<Header navigation={navigation} />
			</header>
			<main>
				<div className='falseHeader'>
					<Header navigation={navigation} />
				</div>
				<div className='content'>
					{fullWidth ? (
						<>{children}</>
					) : (
						<Container style={{ margin: '1em 0' }}>{children}</Container>
					)}
				</div>
			</main>
			<footer>
				<Footer />
			</footer>
			<style jsx>{`
				header {
					position: ${fullWidth ? 'absolute' : 'fixed'};
					width: 100%;
					z-index: 2400;
					border: none;
				}

				main {
					min-height: calc(100vh - 10em);
					width: 100%;
					display: flex;
					flex-direction: column;
				}

				.falseHeader {
					width: 100%;
					visibility: hidden;
				}

				.content {
					flex: 1;
					position: relative;
					min-height: 50vmax;
				}

				footer {
					width: 100%;
					height: 10em;
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
		</>
	);
};

export default Layout;
