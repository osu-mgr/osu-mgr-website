import { FunctionComponent } from 'react';
import Link, { LinkProps } from 'next/link';

const WrappedLink: FunctionComponent<LinkProps> = ({ children, ...props }) => (
	<>
		<Link {...props}>
			<div className='link' style={{ cursor: 'pointer' }}>
				{children}
			</div>
		</Link>
		<style jsx>{`
			.link:hover {
				filter: contrast(50%);
			}
		`}</style>
	</>
);
export default WrappedLink;
