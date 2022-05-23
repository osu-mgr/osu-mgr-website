import { FunctionComponent } from 'react';
import { Image } from 'semantic-ui-react';

const CollectionImageThumbnail: FunctionComponent<{ lat: number, lon: number }> = ({
  lat,
  lon
}) => {
	return <>
    {lat !== undefined && lon !== undefined &&
      <div className='map'>
        <Image bordered rounded
          src={
            `https://maps.google.com/maps/api/staticmap?maptype=hybrid&center=${lat},${lon}&` +
            `zoom=0&size=160x160&markers=color:0xD73F09|${lat},${lon}&key=AIzaSyCINNnWmAK07o0DG3DYEAKx6Bf1SHrSMHw`
          }
        />
      </div> || undefined
    }
		<style jsx>{`
			.map {
				display: inline-block;
        vertical-align: top;
				margin-right: 0.5rem;
				margin-bottom: 0.5rem;
				height: 97px;
				width: 97px;
			}
		`}</style>
	</>
};

export default CollectionImageThumbnail;