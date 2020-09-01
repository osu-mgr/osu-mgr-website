import App, { AppProps } from 'next/app';
// import { RecoilRoot } from 'recoil';
import { createMedia } from "@artsy/fresnel";
import { TinaCMS, TinaProvider } from 'tinacms';
import { GithubClient, TinacmsGithubProvider } from 'react-tinacms-github';
// import { BranchSwitcherPlugin } from '../tina-plugins/branch-switcher';
import 'semantic-ui-css/semantic.min.css';

const AppMedia = createMedia({
  breakpoints: {
    mobile: 320,
    tablet: 768,
    computer: 992,
    largeScreen: 1200,
    widescreen: 1920
  }
});

const mediaStyles = AppMedia.createMediaStyle();
const { Media, MediaContextProvider } = AppMedia;
export { Media };

export default class AppClass extends App {
	cms: TinaCMS;
	constructor(props: AppProps) {
		super(props);
		this.cms = new TinaCMS({
			enabled: props.pageProps.preview,
			// plugins: [BranchSwitcherPlugin],
			apis: {
				github: new GithubClient({
					proxy: '/api/proxy-github',
					authCallbackRoute: '/api/create-github-access-token',
					clientId: process.env.GITHUB_CLIENT_ID,
					baseRepoFullName: process.env.REPO_FULL_NAME,
					// baseBranch: props.pageProps.preview && process.env.BASE_BRANCH,
				}),
			},
			sidebar: props.pageProps.preview,
			toolbar: props.pageProps.preview,
		});
		// eslint-disable-next-line no-console
		// console.log('AppClass', props);
	}
	render(): JSX.Element {
		const { Component, pageProps } = this.props;
		return (
			<>
				<style>{ mediaStyles }</style>
				<MediaContextProvider>
					<TinaProvider cms={this.cms}>
						<TinacmsGithubProvider
							onLogin={onLogin}
							onLogout={onLogout}
							error={pageProps.error}
						>
							<Component {...pageProps} />
						</TinacmsGithubProvider>
					</TinaProvider>
				</MediaContextProvider>	
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

	const resp = await fetch(`/api/preview`, { headers: headers });
	const data = await resp.json();

	if (resp.status == 200) window.location.href = window.location.pathname;
	else throw new Error(data.message);
};

const onLogout = () => {
	return fetch(`/api/reset-preview`).then(() => {
		window.location.reload();
	});
};
