import { FunctionComponent } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticProps } from 'next';
import { usePlugin, useFormScreenPlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import { useGitHubSiteForm } from '../common/site';
import Head from '../components/head';
import Layout from '../components/layout';

const Calendar: FunctionComponent = () => {
	return (
		<>
			<iframe
				className='calendar'
				src='https://teamup.com/ks7o743x4y1j688hai'
			/>
			<style jsx>{`
				.calendar {
					border: none;
					width: 100%;
					height: 900px;
				}
			`}</style>
		</>
	);
};

export const Page: FunctionComponent<{ page: any; site: any }> = ({
	page,
	site,
}) => {
	const [pageData, pageForm] = useGithubJsonForm(page, {
		label: 'Page',
		fields: [
			{
				label: 'Page Title',
				name: 'htmlTitle',
				component: 'text',
				description: 'Displayed in the browser tab.',
			},
		],
	});
	usePlugin(pageForm);
	const [siteData, siteForm] = useGitHubSiteForm(site);
	useFormScreenPlugin(siteForm);
	return (
		<Layout navigation={siteData.navigation}>
			<Head
				siteTitle={siteData['siteTitle']}
				pageTitle={pageData['htmlTitle']}
			/>
			<h2>Repository Calendar</h2>
			<p>
				If you are new user of the MGR facility, or would like to use a
				particular instrument and/or lab procedure for the first time, please
				contact us to arrange training and scheduling information. Fee
				information can be viewed <a href='/services'>here</a>.
			</p>
			<p>
				Use the left sidebar to toggle individual resource calendars on and off
				by clicking on the names, or use the Filter drop down. Send your request
				including instrument, date, and duration of requested reservation to{' '}
				<a href='mailto:osu-mgr@oregonstate.edu'>osu-mgr@oregonstate.edu</a>.
			</p>
			<Calendar />
		</Layout>
	);
};

export default Page;

export const getStaticProps: GetStaticProps = async function ({
	preview,
	previewData,
}) {
	if (preview) {
		const page = await getGithubPreviewProps({
			...(typeof previewData === 'object' && previewData !== null ? previewData : {}),
			fileRelativePath: 'content/edit.json',
			parse: parseJson,
			github_access_token: process.env.GITHUB_ACCESS_TOKEN || '',
			working_repo_full_name: process.env.WORKING_REPO_FULL_NAME || '',
			head_branch: process.env.HEAD_BRANCH || 'main',
		});
		const site = await getGithubPreviewProps({
			...(typeof previewData === 'object' && previewData !== null ? previewData : {}),
			fileRelativePath: 'content/site.json',
			parse: parseJson,
			github_access_token: process.env.GITHUB_ACCESS_TOKEN || '',
			working_repo_full_name: process.env.WORKING_REPO_FULL_NAME || '',
			head_branch: process.env.HEAD_BRANCH || 'main',
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
				fileRelativePath: 'content/repository-calendar.json',
				data: (await import('../content/repository-calendar.json')).default,
			},
			site: {
				fileRelativePath: 'content/site.json',
				data: (await import('../content/site.json')).default,
			},
		},
	};
};
