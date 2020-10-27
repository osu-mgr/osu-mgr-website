import { FunctionComponent } from 'react';
import { Button, ButtonProps } from 'semantic-ui-react';

const PrimaryButton: FunctionComponent<ButtonProps> = ({
	children,
	...props
}) => {
	return (
		<Button
			primary
			{...props}
			style={{
				backgroundColor: '#D73F09',
			}}
		>
			{children}
		</Button>
	);
};

export default PrimaryButton;
