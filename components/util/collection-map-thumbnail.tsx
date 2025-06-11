import React from "react";

export const CollectionMapThumbnail: React.FC<{ lat: number, lon: number }> = ({
  lat,
  lon
}) => {
	return <>
    {lat !== undefined && lon !== undefined &&
      <div className="avatar">
        <div className="w-20 rounded">
          <img
            className="mt-0"
            src={
              `https://maps.google.com/maps/api/staticmap?maptype=hybrid&center=${lat},${lon}&` +
              `zoom=5&size=160x160&markers=color:0xD73F09|${lat},${lon}&key=AIzaSyCINNnWmAK07o0DG3DYEAKx6Bf1SHrSMHw`
            }
          />
        </div>
      </div> || undefined
    }
	</>
};