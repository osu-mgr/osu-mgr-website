import _ from 'lodash';
import { FunctionComponent } from 'react';
import { Header, Icon, Segment, SemanticICONS } from 'semantic-ui-react';
import useCollectionFileExists from '../common/useCollectionFileExists';

const CollectionFileButton: FunctionComponent<{ file: string, name: string, icon: SemanticICONS }> = ({
	file,
	name,
	icon,
}) => {
	const exists = {
		'holdings/': useCollectionFileExists(`${'holdings/'}${file}`),
		//'holdings/+': useCollectionFileExists(`${'holdings/+'}${file}`),
		'acc%20holdings/': useCollectionFileExists(`${'acc%20holdings/'}${file}`),
		//'acc%20holdings/+': useCollectionFileExists(`${'acc%20holdings/+'}${file}`),
	};
	
	return <>
		{_.keys(exists).map((folder) =>
			exists[folder] && exists[folder].data && <a
				key={`${folder}-${file}`}
				className='file'
				target='_blank'
				rel='noreferrer'
				href={`https://haviside.ceoas.oregonstate.edu:8443/collection/${folder}${file}`}>
				<Segment textAlign='center' style={{ boxShadow: 'none' }}>
					<Header size='tiny' icon>
						<Icon name={icon} />
						{name}
					</Header>
				</Segment>
			</a> || undefined
		)}
		<style jsx>{`
			.file {
				display: inline-block;
        vertical-align: top;
				margin-right: 0.5rem;
				margin-bottom: 0.5rem;
				height: 102px;
				width: 150px;
			}
		`}</style>
	</>
};

export default CollectionFileButton;