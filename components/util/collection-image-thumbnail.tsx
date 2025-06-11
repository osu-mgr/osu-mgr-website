import _ from 'lodash';
import React from "react";
import { Icon } from "./icon";
import useCollectionFileExists from '../hooks/useCollectionFileExists';

export const CollectionImageThumbnail: React.FC<{ file: string, name1: string, name2: string, icon: string }> = ({
  file,
  name1,
  name2,
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
      exists[folder] && exists[folder].data &&
      <a
        key={`${folder}-${file}`}
        className='file btn btn-outline no-underline flex flex-col items-center justify-center p-1' // DaisyUI classes
        target='_blank'
        rel='noreferrer'
        href={`https://haviside.ceoas.oregonstate.edu:6567/collection/${folder}${file}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Icon name={icon} size="medium" className="m-auto"/>
        {name1 && <span className="text-xs mt-0">{name1}</span>}
        {name2 && name2 !== name1 && (
          <><br/><span className="text-xs mt-0">{name2}</span></>
        )}
      </a> || undefined
    )}
    <style jsx>{`
      .file {
          display: inline-block;
          vertical-align: top;
          margin-right: 0.5rem;
          margin-bottom: 0.5rem;
          height: 90px; /* You might want to adjust this or make it responsive */
          width: 100px; /* You might want to adjust this or make it responsive */
      }
    `}</style>
  </>
};