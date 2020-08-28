import { useGithubAuthRedirect } from 'react-tinacms-github';

// GitHub redirects back to this page with the auth code
export default function Authorizing(): JSX.Element {
	// Report that an auth code was received from GitHub
	useGithubAuthRedirect();

	return <h2>Authorizing with GitHub, please wait...</h2>;
}
