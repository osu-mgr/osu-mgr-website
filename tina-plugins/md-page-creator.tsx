/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { TinaCMS } from 'tinacms';

export default {
	__type: 'content-creator',
	name: 'Markdown Page',
	filename: (form: any) => {
		return `content/pages/${form.filename}.mdx`;
	},
	fields: [
		{
			label: 'File Name',
			name: 'filename',
			description: 'The page URL on this site.',
			component: 'text',
			validation: (filename: string): string => {
				if (!filename) return 'Required';
			},
		},
	],
	onSubmit(values: any, cms: TinaCMS): void {
		cms;
		values;
		// console.log('values', values, 'cms', cms);
	},
};
