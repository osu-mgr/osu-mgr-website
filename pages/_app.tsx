import App, { AppProps } from 'next/app';
import { TinaCMS, TinaProvider } from 'tinacms';
import { GithubClient, TinacmsGithubProvider } from 'react-tinacms-github';
import MarkdownPageCreator from '../tina-plugins/md-page-creator';
import ExitToolbarWidget from '../tina-plugins/exit';
import 'semantic-ui-css/semantic.min.css';
import '../styles/tina.css';
import { NextGithubMediaStore } from 'next-tinacms-github';

export default class AppClass extends App {
	cms: TinaCMS;
	constructor(props: AppProps & { pageProps: { preview?: boolean; error?: string } }) {
		super(props);
		const github = new GithubClient({
			proxy: '/api/proxy-github',
			authCallbackRoute: '/api/create-github-access-token',
			clientId: process.env.GITHUB_CLIENT_ID,
			baseRepoFullName: process.env.REPO_FULL_NAME,
			baseBranch: process.env.BASE_BRANCH,
		});
		this.cms = new TinaCMS({
			enabled: !!props.pageProps.preview,
			plugins: [MarkdownPageCreator, ExitToolbarWidget],
			apis: { github },
			sidebar: props.pageProps.preview,
			toolbar: props.pageProps.preview,
			media: new NextGithubMediaStore(github),
		});
	}
	render(): JSX.Element {
        const Component = this.props.Component;
        const pageProps: { preview?: boolean; error?: string } = this.props.pageProps;
		return (
			<>
				<TinaProvider cms={this.cms}>
					<TinacmsGithubProvider
						onLogin={onLogin}
						onLogout={onLogout}
						error={pageProps.error}
					>
						<Component {...pageProps} />
					</TinacmsGithubProvider>
				</TinaProvider>
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
					a,
					.ui.inverted.list .item a:not(.ui) {
						color: #d73f09 !important;
					}
					a:hover,
					.ui.inverted.list .item a:not(.ui):hover {
						color: #d73f09 !important;
						filter: contrast(50%);
					}
					a:hover *,
					.ui.inverted.list .item a:not(.ui):hover * {
						filter: contrast(50%);
					}
					::selection {
						background-color: #c6dae7;
					}
					@media only screen and (max-width: 991px) {
						.ui.stackable.menu {
							-webkit-box-orient: vertical;
							-webkit-box-direction: normal;
							-ms-flex-direction: column;
							flex-direction: column;
						}

						.ui.stackable.menu .item {
							width: 100% !important;
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
							background: rgba(34, 36, 38, 0.1);
						}

						.ui.stackable.menu .left.item,
						.ui.stackable.menu .left.menu {
							margin-right: 0 !important;
						}

						.ui.stackable.menu .right.item,
						.ui.stackable.menu .right.menu {
							margin-left: 0 !important;
						}

						.ui.stackable.menu .left.menu,
						.ui.stackable.menu .right.menu {
							-webkit-box-orient: vertical;
							-webkit-box-direction: normal;
							-ms-flex-direction: column;
							flex-direction: column;
						}

						.ui.stackable.grid {
							width: auto;
							margin-left: 0 !important;
							margin-right: 0 !important;
						}

						.ui.grid > .stackable.stackable.row > .column,
						.ui.stackable.grid > .column.grid > .column,
						.ui.stackable.grid > .column.row > .column,
						.ui.stackable.grid > .column:not(.row),
						.ui.stackable.grid > .row > .column,
						.ui.stackable.grid > .row > .wide.column,
						.ui.stackable.grid > .wide.column {
							width: 100% !important;
							margin: 0 0 !important;
							-webkit-box-shadow: none !important;
							box-shadow: none !important;
							padding: 1rem 1rem !important;
						}

						.ui.stackable.grid:not(.vertically) > .row {
							margin: 0;
							padding: 0;
						}

						.ui.container > .ui.stackable.grid > .column,
						.ui.container > .ui.stackable.grid > .row > .column {
							padding-left: 0 !important;
							padding-right: 0 !important;
						}

						.ui.grid .ui.stackable.grid,
						.ui.segment:not(.vertical) .ui.stackable.page.grid {
							margin-left: -1rem !important;
							margin-right: -1rem !important;
						}

						.ui.stackable.celled.grid > .column:not(.row):first-child,
						.ui.stackable.celled.grid > .row:first-child > .column:first-child,
						.ui.stackable.divided.grid > .column:not(.row):first-child,
						.ui.stackable.divided.grid
							> .row:first-child
							> .column:first-child {
							border-top: none !important;
						}

						.ui.inverted.stackable.celled.grid > .column:not(.row),
						.ui.inverted.stackable.celled.grid > .row > .column,
						.ui.inverted.stackable.divided.grid > .column:not(.row),
						.ui.inverted.stackable.divided.grid > .row > .column {
							border-top: 1px solid rgba(255, 255, 255, 0.1);
						}

						.ui.stackable.celled.grid > .column:not(.row),
						.ui.stackable.celled.grid > .row > .column,
						.ui.stackable.divided:not(.vertically).grid > .column:not(.row),
						.ui.stackable.divided:not(.vertically).grid > .row > .column {
							border-top: 1px solid rgba(34, 36, 38, 0.15);
							-webkit-box-shadow: none !important;
							box-shadow: none !important;
							padding-top: 2rem !important;
							padding-bottom: 2rem !important;
						}

						.ui.stackable.celled.grid > .row {
							-webkit-box-shadow: none !important;
							box-shadow: none !important;
						}

						.ui.stackable.divided:not(.vertically).grid > .column:not(.row),
						.ui.stackable.divided:not(.vertically).grid > .row > .column {
							padding-left: 0 !important;
							padding-right: 0 !important;
						}
					}
				`}</style>
			</>
		);
	}
}

const onLogin = async () => {
	const token = localStorage.getItem('tinacms-github-token') || null;
	const headers = new Headers();

	if (token) {
		headers.append('Authorization', 'Bearer ' + token);
	}

	const resp = await fetch(`/api/preview`, { headers });
	const data = await resp.json();

	if (resp.status == 200) window.location.href = window.location.pathname;
	else throw new Error(data.message);
};

const onLogout = () => {
	return fetch(`/api/reset-preview`).then(() => {
		window.location.reload();
	});
};
