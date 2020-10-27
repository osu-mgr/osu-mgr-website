import { useCMS } from 'tinacms';
import { Button } from '@tinacms/styles';

export default {
	__type: 'toolbar:widget',
	name: 'howdy',
	weight: 5,
	component: (): JSX.Element => {
		const cms = useCMS();
		return (
			<Button primary onClick={() => cms.disable()}>
				Exit Editing
			</Button>
		);
	},
};
