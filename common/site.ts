import { useGithubJsonForm } from 'react-tinacms-github';
import { GithubFile } from 'next-tinacms-github';
import { Field } from 'tinacms';
import { v4 as uuidv4 } from 'uuid';

interface GroupListField extends Field {
	component: 'group-list';
	fields: Field[];
	defaultItem?: Record<string, unknown> | (() => Record<string, unknown>);
	itemProps?: (item: {
		id: string;
		text: string;
	}) => {
		key?: string;
		label?: string;
	};
}

export interface NavigationData {
	id: string;
	text: string;
	link?: string;
	menu?: {
		id: string;
		text: string;
		link: string;
	}[];
}

export const useGitHubSiteForm = (file: GithubFile<any>): any => {
	const siteTitleText: Field = {
		label: 'Site Title',
		name: 'siteTitle',
		component: 'text',
		description: 'Displayed in the browser tab.',
	};
	const navMenuGroupList: GroupListField = {
		label: 'Navigation Menu',
		name: 'menu',
		component: 'group-list',
		itemProps: (item) => ({
			key: item.id,
			label: item.text,
		}),
		defaultItem: () => ({
			name: 'New Navigation Menu Item',
			id: uuidv4(),
		}),
		fields: [
			{
				label: 'Navigation Menu Item Text',
				name: 'text',
				component: 'text',
			},
			{
				label: 'Navigation Menu Item Link',
				name: 'link',
				component: 'text',
			},
		],
	};
	const navBarGroupList: GroupListField = {
		label: 'Navigation Bar',
		name: 'navigation',
		component: 'group-list',
		itemProps: (item) => ({
			key: item.id,
			label: item.text,
		}),
		defaultItem: () => ({
			name: 'New Navigation Bar Item',
			id: uuidv4(),
		}),
		fields: [
			{
				label: 'Navigation Bar Text',
				name: 'text',
				component: 'text',
				description: 'The text for this item in the navigation bar.',
			},
			{
				label: 'Navigation Bar Link',
				name: 'link',
				component: 'text',
				description: 'This is only used if the menu is empty.',
			},
			navMenuGroupList,
		],
	};
	return useGithubJsonForm(file, {
		label: 'Site',
		fields: [siteTitleText, navBarGroupList],
	});
};
