import { useGithubJsonForm } from 'react-tinacms-github';
import { GithubFile } from 'next-tinacms-github';

export const useGitHubSiteForm = (file: GithubFile<any>): any => {
	return useGithubJsonForm(file, {
		label: 'Site',
		fields: [
			{
				name: 'Site Title',
				component: 'text',
			},
			{
				label: 'Menu Items',
				name: 'common.menuItems',
				component: 'group-list',
				fields: [
					{
						label: 'About Us',
						name: 'about-us',
						component: 'list',
					},
				],
			},
		],
	});
};
