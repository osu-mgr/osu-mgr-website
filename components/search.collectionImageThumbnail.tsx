import _ from 'lodash';
import { FunctionComponent, useState } from 'react';
import { Image, Segment, Header, Icon, Grid } from 'semantic-ui-react';
import useCollectionFileExists from '../common/useCollectionFileExists';

const CollectionImageThumbnail: FunctionComponent<{ file: string, name: string }> = ({
	file,
	name,
}) => {
	const exists = {
		'holdings/': useCollectionFileExists(`${'holdings/'}${file}`),
		//'holdings/+': useCollectionFileExists(`${'holdings/+'}${file}`),
		'acc%20holdings/': useCollectionFileExists(`${'acc%20holdings/'}${file}`),
		//'acc%20holdings/+': useCollectionFileExists(`${'acc%20holdings/+'}${file}`),
	};
  const [rotate, setRotate] = useState({
    'holdings/': false,
    'holdings/+': false,
    'acc%20holdings/': false,
    'acc%20holdings/+': false,
  });

	return <>
		{_.keys(exists).map((folder) =>
			exists[folder] && exists[folder].data && <a
				key={`${folder}-${file}`}
				className='file'
				target='_blank'
				rel='noreferrer'
				href={`https://haviside.ceoas.oregonstate.edu:8443/collection/${folder}${file}`}>
				{name !== undefined ?
					<Segment textAlign='center' style={{ boxShadow: 'none' }}>
						<Grid columns={2}>
							<Grid.Column style={{ width: 150 }}>
								<Header size='tiny' icon>
									<Icon name='file image outline' />
									{name}
								</Header>
							</Grid.Column>
							<Grid.Column style={{ width: 'calc(100% - 150px)', padding: 0 }}>
								<Image
									onLoad={({ target: img }) => {
										if (img.offsetWidth < img.offsetHeight / 2) setRotate({ ...rotate, [folder]: true });
									}}
									style={{
										display: 'inline-block',
										verticalAlign: 'top',
										height: 95,
										maxWidth: 'auto',
										objectFit: 'cover',
									}}
									src={`https://haviside.ceoas.oregonstate.edu:8443/collection/${folder}${file}?${rotate[folder] ? 'srotate=90&' : ''}height=95`}
								/>
							</Grid.Column>
						</Grid>
					</Segment>
				: <Image
						onLoad={({ target: img }) => {
							if (img.offsetWidth < img.offsetHeight / 2) setRotate({ ...rotate, [folder]: true });
						}}
						style={{
							display: 'inline-block',
							verticalAlign: 'top',
							height: 95,
							maxWidth: 'auto',
							objectFit: 'cover',
						}}
						src={`https://haviside.ceoas.oregonstate.edu:8443/collection/${folder}${file}?${rotate[folder] ? 'srotate=90&' : ''}height=95`}
					/>
				}
			</a> || undefined
		)}
		<style jsx>{`
			.file {
				display: inline-block;
        vertical-align: top;
				margin-right: 0.5rem;
				margin-bottom: 0.5rem;
				height: 97px;
			}
		`}</style>
	</>
};

export default CollectionImageThumbnail;