import _ from 'lodash';
import { FunctionComponent, useState } from 'react';
import { useRouter } from 'next/router';
// import { CollectionFileButton } from './util/collection-file-button';
// import { CollectionImageThumbnail } from './util/collection-image-thumbnail';
// import { CollectionMapThumbnail } from './util/collection-map-thumbnail';
// import { itemFieldNames, formatField } from './util/items';
import Link from "next/link";
import { Icon } from "../util/icon";

export const LandingPage: FunctionComponent = () => {
  const { asPath } = useRouter();
  
  const osuIDparts = asPath.substring(1).split('-');
  const osuID = osuIDparts.slice(0, 3).join('-');
	
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{osuID}</h1>
    </div>
  )

  const searchDocs = null; // = useTerms(['cruise', 'core', 'dive'], { '_osuid.keyword': [osuID] });
	
	if (!searchDocs) 
		return             <div className="flex justify-center items-center min-h-[200px]">
                  <Icon name="TbLoader2" className="w-8 h-8 text-primary animate-spin" />
                  <span className="ml-2">Loading...</span>
                </div>;
	
	if (searchDocs.length === 0)
		return (
			<div><b>{osuID}</b> is not not found in the OSU-MGR collections.</div>
		);
	const searchDoc = searchDocs[0];

	// if (searchDoc._docType === 'cruise')
	// 	return <CruiseLandingPage cruiseDoc={searchDoc} />;

	// if (searchDoc._docType === 'core')
	// 	return <CoreLandingPage coreDoc={searchDoc} />;

	// if (searchDoc._docType === 'dive')
	// 	return <DiveLandingPage diveDoc={searchDoc} />;
	
};


export const landingPageBlockSchema = {
  name: "landingPage",
  label: "Collection Landing Page",
  fields: [
    {
      type: "string",
      label: "HTML Source",
      name: "source",
    },
    {
      type: "number",
      label: "Height in Pixels",
      name: "height",
    }
  ],
};