import _ from 'lodash';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Section } from "../util/section";
import { Container } from "../util/container";
import { ItemsCount } from '../util/items-count';
import { CollectionFileButton } from '../util/collection-file-button';
// import { CollectionImageThumbnail } from './util/collection-image-thumbnail';
// import { CollectionMapThumbnail } from './util/collection-map-thumbnail';
// import { itemFieldNames, formatField } from './util/items';
import { Icon } from "../util/icon";

const viewRawData = true; // Set to true to view raw data in the search results

const TypeTab: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  type: string;
  terms?: any;
}> = ({ label, isActive, onClick, type, terms }) => {
  return (
    <div
      className={`tab tab-lg tab-bordered ${isActive ? 'tab-active text-primary' : ''}`}
      onClick={onClick}
    >
      <b>{label}</b>
      <span className={`badge badge-md mx-2 ${isActive ? 'badge-primary' : 'badge-outline'}`}>
        <ItemsCount
          types={[type]}
          terms={terms}
          singularLabel=""
          pluralLabel=""
        />
      </span>
    </div>
  );
}

const Cruise: React.FC<{ cruiseDoc: any }> = ({ cruiseDoc }) => {
  const {
    data: results,
    isLoading: isLoadingQuery,
  } = useQuery({
    queryKey: ['osuID', osuID],
    queryFn: async () => { 
      const payload = {
        types: ['cruise', 'core', 'dive'],
        terms: {
          "_osuid.keyword": [osuID.toUpperCase()],
        },
      };
      const res = await fetch('/api/opensearch?search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorresults = await res.json();
        throw new Error(errorresults.message || 'Failed to fetch search results');
      }
      return res.json();
    },
  });

  const doc = results?.hits?.total ? results.hits.hits[0]._source : {};
  
  return (
    <>
      <div className="tabs mt-2 min-w-full">
        <div className="tab tab-lg tab-bordered tab-active text-primary"><b>{doc._osuid}</b></div>
        <TypeTab
          label="Cores"
          isActive={false}
          onClick={() => { }}
          type="core"
          terms={{ "_cruiseUUID.keyword": [doc._cruiseUUID] }}
        />
        <TypeTab
          label="Sections"
          isActive={false}
          onClick={() => { }}
          type="section"
          terms={{ "_cruiseUUID.keyword": [doc._cruiseUUID] }}
        />
        <TypeTab
          label="Rocks"
          isActive={false}
          onClick={() => { }}
          type="dive"
          terms={{ "_cruiseUUID.keyword": [doc._cruiseUUID] }}
        />
        <div className="tab tab-lg tab-bordered flex-grow"></div> 
      </div>
    </>
  );
}

const CoreSectionsPanel: React.FC<{ coreDoc: any }> = ({ coreDoc }) => {
  const {
    data: sectionsResults,
    isLoading: isSectionsLoading,
  } = useQuery({
    queryKey: ['coreSections', coreDoc._coreUUID],
    queryFn: async () => { 
      if (!coreDoc._coreUUID) return null;
      
      const payload = {
        types: ['section'],
        terms: {
          "_coreUUID.keyword": [coreDoc._coreUUID],
        },
        sortOrder: 'ids asc',
        size: 100, // Get up to 100 sections
      };
      const res = await fetch('/api/opensearch?search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorresults = await res.json();
        throw new Error(errorresults.message || 'Failed to fetch sections');
      }
      return res.json();
    },
    enabled: !!coreDoc._coreUUID,
  });

  const sections = sectionsResults?.hits?.hits || [];

  if (!coreDoc._coreUUID) return null;

  return (
    <div className="bg-base-50 p-6 rounded-lg mt-6">
      <h3 className="text-xl font-bold mb-4 text-primary">Core Sections</h3>
      
      {isSectionsLoading && (
        <div className="flex justify-center items-center py-8">
          <Icon name="TbLoader2" className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-2">Loading sections...</span>
        </div>
      )}

      {!isSectionsLoading && sections.length === 0 && (
        <p className="text-gray-500">No sections found for this core.</p>
      )}

      {!isSectionsLoading && sections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section, index) => {
            const sectionData = section._source;
            return (
              <a
                key={index}
                href={`/${sectionData._osuid}`}
                className="block bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-primary no-underline"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-primary m-0">{sectionData._osuid}</h4>
                  <Icon name="TbExternalLink" className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  {sectionData.depthTop != null && sectionData.depthBottom != null && (
                    <p className="m-0">
                      <strong>Depth:</strong> {sectionData.depthTop} - {sectionData.depthBottom} cm
                    </p>
                  )}
                  
                  {sectionData.length && (
                    <p className="m-0">
                      <strong>Length:</strong> {sectionData.length} cm
                    </p>
                  )}

                  {sectionData.material && (
                    <p className="m-0">
                      <strong>Material:</strong> {sectionData.material}
                    </p>
                  )}

                  {sectionData._files && sectionData._files.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Icon name="TbFiles" className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {sectionData._files.length} file{sectionData._files.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

const CruiseCoresPanel: React.FC<{ cruiseDoc: any }> = ({ cruiseDoc }) => {
  const {
    data: coresResults,
    isLoading: isCoresLoading,
  } = useQuery({
    queryKey: ['cruiseCores', cruiseDoc._cruiseUUID],
    queryFn: async () => { 
      if (!cruiseDoc._cruiseUUID) return null;
      
      const payload = {
        types: ['core'],
        terms: {
          "_cruiseUUID.keyword": [cruiseDoc._cruiseUUID],
        },
        sortOrder: 'ids asc',
        size: 100, // Get up to 100 cores
      };
      const res = await fetch('/api/opensearch?search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorresults = await res.json();
        throw new Error(errorresults.message || 'Failed to fetch cores');
      }
      return res.json();
    },
    enabled: !!cruiseDoc._cruiseUUID,
  });

  const cores = coresResults?.hits?.hits || [];

  if (!cruiseDoc._cruiseUUID || cores.length === 0) return null;

  return (
    <div className="bg-base-50 p-6 rounded-lg mt-6">
      <h3 className="text-xl font-bold mb-4 text-primary">Cores</h3>
      
      {isCoresLoading && (
        <div className="flex justify-center items-center py-8">
          <Icon name="TbLoader2" className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-2">Loading cores...</span>
        </div>
      )}

      {!isCoresLoading && cores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cores.map((core, index) => {
            const coreData = core._source;
            return (
              <a
                key={index}
                href={`/${coreData._osuid}`}
                className="block bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-primary no-underline"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-primary m-0">{coreData._osuid}</h4>
                  <Icon name="TbExternalLink" className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  {coreData.material && (
                    <p className="m-0">
                      <strong>Material:</strong> {coreData.material}
                    </p>
                  )}
                  
                  {coreData.method && (
                    <p className="m-0">
                      <strong>Method:</strong> {coreData.method}
                    </p>
                  )}

                  {coreData.length && (
                    <p className="m-0">
                      <strong>Length:</strong> {coreData.length} cm
                    </p>
                  )}

                  {coreData.diameter && (
                    <p className="m-0">
                      <strong>Diameter:</strong> {coreData.diameter} cm
                    </p>
                  )}

                  {coreData.nSections && (
                    <p className="m-0">
                      <strong>Sections:</strong> {coreData.nSections}
                    </p>
                  )}

                  {coreData._files && coreData._files.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Icon name="TbFiles" className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {coreData._files.length} file{coreData._files.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

const CruiseRocksPanel: React.FC<{ cruiseDoc: any }> = ({ cruiseDoc }) => {
  const {
    data: rocksResults,
    isLoading: isRocksLoading,
  } = useQuery({
    queryKey: ['cruiseRocks', cruiseDoc._cruiseUUID],
    queryFn: async () => { 
      if (!cruiseDoc._cruiseUUID) return null;
      
      const payload = {
        types: ['dive'],
        terms: {
          "_cruiseUUID.keyword": [cruiseDoc._cruiseUUID],
        },
        sortOrder: 'ids asc',
        size: 100, // Get up to 100 rocks
      };
      const res = await fetch('/api/opensearch?search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorresults = await res.json();
        throw new Error(errorresults.message || 'Failed to fetch rocks');
      }
      return res.json();
    },
    enabled: !!cruiseDoc._cruiseUUID,
  });

  const rocks = rocksResults?.hits?.hits || [];

  if (!cruiseDoc._cruiseUUID || rocks.length === 0) return null;

  return (
    <div className="bg-base-50 p-6 rounded-lg mt-6">
      <h3 className="text-xl font-bold mb-4 text-primary">Rocks</h3>
      
      {isRocksLoading && (
        <div className="flex justify-center items-center py-8">
          <Icon name="TbLoader2" className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-2">Loading rocks...</span>
        </div>
      )}

      {!isRocksLoading && rocks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rocks.map((rock, index) => {
            const rockData = rock._source;
            return (
              <a
                key={index}
                href={`/${rockData._osuid}`}
                className="block bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-primary no-underline"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-primary m-0">{rockData._osuid}</h4>
                  <Icon name="TbExternalLink" className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  {rockData.material && (
                    <p className="m-0">
                      <strong>Material:</strong> {rockData.material}
                    </p>
                  )}
                  
                  {rockData.method && (
                    <p className="m-0">
                      <strong>Method:</strong> {rockData.method}
                    </p>
                  )}

                  {rockData.weight && (
                    <p className="m-0">
                      <strong>Weight:</strong> {rockData.weight} kg
                    </p>
                  )}

                  {rockData.texture && (
                    <p className="m-0">
                      <strong>Texture:</strong> {rockData.texture}
                    </p>
                  )}

                  {rockData._files && rockData._files.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Icon name="TbFiles" className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {rockData._files.length} file{rockData._files.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

const SectionhalvesPanel: React.FC<{ sectionDoc: any }> = ({ sectionDoc }) => {
  const {
    data: halvesResults,
    isLoading: ishalvesLoading,
  } = useQuery({
    queryKey: ['sectionhalves', sectionDoc._sectionUUID],
    queryFn: async () => { 
      if (!sectionDoc._sectionUUID) return null;
      
      const payload = {
        types: ['sectionHalf'],
        terms: {
          "_sectionUUID.keyword": [sectionDoc._sectionUUID],
        },
        sortOrder: 'ids asc',
        size: 100, // Get up to 100 section-halves
      };
      const res = await fetch('/api/opensearch?search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorresults = await res.json();
        throw new Error(errorresults.message || 'Failed to fetch section-halves');
      }
      return res.json();
    },
    enabled: !!sectionDoc._sectionUUID,
  });

  const halves = halvesResults?.hits?.hits || [];

  if (!sectionDoc._sectionUUID || halves.length === 0) return null;

  return (
    <div className="bg-base-50 p-6 rounded-lg mt-6">
      <h3 className="text-xl font-bold mb-4 text-primary">Section Halves</h3>
      
      {ishalvesLoading && (
        <div className="flex justify-center items-center py-8">
          <Icon name="TbLoader2" className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-2">Loading section halves...</span>
        </div>
      )}

      {!ishalvesLoading && halves.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {halves.map((half, index) => {
            const halfData = half._source;
            return (
              <a
                key={index}
                href={`/${halfData._osuid}`}
                className="block bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-primary no-underline"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-primary m-0">{halfData._osuid}</h4>
                  <Icon name="TbExternalLink" className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  {halfData.depthTop != null && halfData.depthBottom != null && (
                    <p className="m-0">
                      <strong>Depth:</strong> {halfData.depthTop} - {halfData.depthBottom} cm
                    </p>
                  )}
                  
                  {halfData.length && (
                    <p className="m-0">
                      <strong>Length:</strong> {halfData.length} cm
                    </p>
                  )}

                  {halfData.material && (
                    <p className="m-0">
                      <strong>Material:</strong> {halfData.material}
                    </p>
                  )}

                  {halfData.texture && (
                    <p className="m-0">
                      <strong>Texture:</strong> {halfData.texture}
                    </p>
                  )}

                  {halfData._files && halfData._files.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Icon name="TbFiles" className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {halfData._files.length} file{halfData._files.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const LandingPage: React.FC<{ data: any }> = ({
    data
}) => {
  const { asPath } = useRouter();
  
  // Extract the full OSU ID from the path, removing any leading slash
  const fullPath = asPath.substring(1); // Remove leading slash
  const osuID = fullPath; // Use the full path as the OSU ID
	
  const {
    data: results,
    isLoading: isLoadingQuery,
  } = useQuery({
    queryKey: ['osuID', osuID],
    queryFn: async () => { 
      const payload = {
        types: ['cruise', 'core', 'dive', 'section', 'sectionHalf'],
        terms: {
          "_osuid.keyword": [osuID.toUpperCase()],
        },
      };
      const res = await fetch('/api/opensearch?search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorresults = await res.json();
        throw new Error(errorresults.message || 'Failed to fetch search results');
      }
      return res.json();
    },
  });

  const doc = results?.hits?.total ? results.hits.hits[0]._source : {};

  return (
    <Section>
      <Container className="my-4 prose" width="medium">
      {isLoadingQuery &&
        <div className="flex justify-center items-center min-h-[200px]">
          <Icon name="TbLoader2" className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      }
      {!isLoadingQuery && !doc._osuid &&
        <div className="text-red-500">No data found for {osuID}.</div>
      }
      {doc._docType == 'cruise' &&
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">Cruise Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mt-0 mb-3">Basic Information</h3>
              <div className="space-y-2">
                <p><strong>Cruise ID:</strong> {doc.id || 'N/A'}</p>
                <p><strong>OSU ID:</strong> {doc._osuid || 'N/A'}</p>
                <p><strong>Date:</strong> {doc.date ? new Date(doc.date).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mt-0 mb-3">Description</h3>
              <p className="text-sm">{doc.description || 'No description available'}</p>
            </div>
          </div>

          {/* Cruise Cores Panel */}
          <CruiseCoresPanel cruiseDoc={doc} />

          {/* Cruise Rocks Panel */}
          <CruiseRocksPanel cruiseDoc={doc} />
        </div>
      }
      {doc._docType == 'core' && 
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">Core Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mt-0 mb-3">Basic Information</h3>
              <div>
                <p className="m-0"><strong>Core ID:</strong> {doc.id || 'N/A'}</p>
                <p className="m-0"><strong>OSU ID:</strong> {doc._osuid || 'N/A'}</p>
                <p className="m-0">
                  <strong>Cruise ID:</strong> {doc._cruiseID ? (
                    <a 
                      href={`/OSU-${doc._cruiseID}`}
                      className="text-primary hover:text-primary-focus underline ml-1"
                    >
                      {doc._cruiseID}
                    </a>
                  ) : 'N/A'}
                </p>
                <p className="m-0"><strong>Material:</strong> {doc.material || 'N/A'}</p>
                <p className="m-0"><strong>Method:</strong> {doc.method || 'N/A'}</p>
              </div>
            </div>

            {/* Physical Properties */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mt-0 mb-3">Physical Properties</h3>
              <div>
                <p className="m-0"><strong>Diameter:</strong> {doc.diameter ? `${doc.diameter} cm` : 'N/A'}</p>
                <p className="m-0"><strong>Length:</strong> {doc.length ? `${doc.length} cm` : 'N/A'}</p>
                <p className="m-0"><strong>Number of Sections:</strong> {doc.nSections || 'N/A'}</p>
              </div>
            </div>

            {/* Location & Date */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mt-0 mb-3">Location & Date</h3>
              <div>
                <p className="m-0"><strong>Start Date:</strong> {doc.startDate ? new Date(doc.startDate).toLocaleDateString() : 'N/A'}</p>
                <p className="m-0"><strong>Start Time:</strong> {doc.startTime ? new Date(doc.startTime).toLocaleTimeString() : 'N/A'}</p>
                <p className="m-0"><strong>Latitude:</strong> {doc.latitudeStart ? `${doc.latitudeStart}°` : 'N/A'}</p>
                <p className="m-0"><strong>Longitude:</strong> {doc.longitudeStart ? `${doc.longitudeStart}°` : 'N/A'}</p>
                <p className="m-0"><strong>Water Depth:</strong> {doc.waterDepthStart ? `${doc.waterDepthStart} m` : 'N/A'}</p>
              </div>
            </div>

            {/* Files & Resources */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mt-0 mb-3">Available Files</h3>
              <div>
                {doc._files && doc._files.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {doc._files.map((file, index) => {
                      // Determine icon based on file type
                      const getFileIcon = (type: string, path: string) => {
                        const fileType = type?.toLowerCase() || '';
                        const extension = path?.split('.').pop()?.toLowerCase() || '';
                        
                        if (fileType.includes('description') || extension === 'pdf') return 'TbFileText';
                        if (fileType.includes('xrf') || fileType.includes('data') || extension === 'xlsx' || extension === 'csv') return 'TbFileSpreadsheet';
                        if (fileType.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'TbPhoto';
                        return 'TbFile';
                      };

                      const getFileName = (type: string, path: string) => {
                        if (type) {
                          return type.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ');
                        }
                        return path?.split('/').pop() || 'File';
                      };

                      return (
                        <a
                          key={index}
                          href={`https://haviside.ceoas.oregonstate.edu:6567/${file.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm flex items-center gap-2 no-underline hover:bg-primary hover:text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icon name={getFileIcon(file.type, file.path)} className="w-4 h-4" />
                          <span className="text-xs">{getFileName(file.type, file.path)}</span>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 m-0">No files available</p>
                )}
              </div>
            </div>
          </div>

          {/* Core Sections Panel */}
          <CoreSectionsPanel coreDoc={doc} />
        </div>
      }
      {doc._docType == 'section' && 
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">Section Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mt-0 mb-3">Basic Information</h3>
              <div>
                <p className="m-0"><strong>Section ID:</strong> {doc.id || 'N/A'}</p>
                <p className="m-0"><strong>OSU ID:</strong> {doc._osuid || 'N/A'}</p>
                <p className="m-0">
                  <strong>Core ID:</strong> {doc._coreID ? (
                    <a 
                      href={`/${doc._coreID}`}
                      className="text-primary hover:text-primary-focus underline ml-1"
                    >
                      {doc._coreID}
                    </a>
                  ) : 'N/A'}
                </p>
                <p className="m-0">
                  <strong>Cruise ID:</strong> {doc._cruiseID ? (
                    <a 
                      href={`/OSU-${doc._cruiseID}`}
                      className="text-primary hover:text-primary-focus underline ml-1"
                    >
                      {doc._cruiseID}
                    </a>
                  ) : 'N/A'}
                </p>
                <p className="m-0"><strong>Material:</strong> {doc.material || 'N/A'}</p>
              </div>
            </div>

            {/* Physical Properties */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mt-0 mb-3">Physical Properties</h3>
              <div>
                {doc.depthTop != null && doc.depthBottom != null && (
                  <p className="m-0">
                    <strong>Depth Range:</strong> {doc.depthTop} - {doc.depthBottom} cm
                  </p>
                )}
                {doc.length && (
                  <p className="m-0"><strong>Length:</strong> {doc.length} cm</p>
                )}
                {doc.diameter && (
                  <p className="m-0"><strong>Diameter:</strong> {doc.diameter} cm</p>
                )}
                {doc.texture && (
                  <p className="m-0"><strong>Texture:</strong> {doc.texture}</p>
                )}
              </div>
            </div>

            {/* Location & Date */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mt-0 mb-3">Location & Date</h3>
              <div>
                <p className="m-0"><strong>Start Date:</strong> {doc.startDate ? new Date(doc.startDate).toLocaleDateString() : 'N/A'}</p>
                <p className="m-0"><strong>Start Time:</strong> {doc.startTime ? new Date(doc.startTime).toLocaleTimeString() : 'N/A'}</p>
                <p className="m-0"><strong>Latitude:</strong> {doc.latitudeStart ? `${doc.latitudeStart}°` : 'N/A'}</p>
                <p className="m-0"><strong>Longitude:</strong> {doc.longitudeStart ? `${doc.longitudeStart}°` : 'N/A'}</p>
                <p className="m-0"><strong>Water Depth:</strong> {doc.waterDepthStart ? `${doc.waterDepthStart} m` : 'N/A'}</p>
              </div>
            </div>

            {/* Files & Resources */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mt-0 mb-3">Available Files</h3>
              <div>
                {doc._files && doc._files.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {doc._files.map((file, index) => {
                      // Determine icon based on file type
                      const getFileIcon = (type: string, path: string) => {
                        const fileType = type?.toLowerCase() || '';
                        const extension = path?.split('.').pop()?.toLowerCase() || '';
                        
                        if (fileType.includes('description') || extension === 'pdf') return 'TbFileText';
                        if (fileType.includes('xrf') || fileType.includes('data') || extension === 'xlsx' || extension === 'csv') return 'TbFileSpreadsheet';
                        if (fileType.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'TbPhoto';
                        return 'TbFile';
                      };

                      const getFileName = (type: string, path: string) => {
                        if (type) {
                          return type.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ');
                        }
                        return path?.split('/').pop() || 'File';
                      };

                      return (
                        <a
                          key={index}
                          href={`https://haviside.ceoas.oregonstate.edu:6567/${file.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm flex items-center gap-2 no-underline hover:bg-primary hover:text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icon name={getFileIcon(file.type, file.path)} className="w-4 h-4" />
                          <span className="text-xs">{getFileName(file.type, file.path)}</span>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 m-0">No files available</p>
                )}
              </div>
            </div>
          </div>

          {/* Section halves Panel */}
          <SectionhalvesPanel sectionDoc={doc} />
        </div>
      }
      {doc._docType == 'sectionHalf' && 
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">Section Half Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mt-0 mb-3">Basic Information</h3>
              <div>
                <p className="m-0"><strong>Section Half ID:</strong> {doc.id || 'N/A'}</p>
                <p className="m-0"><strong>OSU ID:</strong> {doc._osuid || 'N/A'}</p>
                <p className="m-0">
                  <strong>Section ID:</strong> {doc._sectionID ? (
                    <a 
                      href={`/${doc._sectionID}`}
                      className="text-primary hover:text-primary-focus underline ml-1"
                    >
                      {doc._sectionID}
                    </a>
                  ) : 'N/A'}
                </p>
                <p className="m-0">
                  <strong>Core ID:</strong> {doc._coreID ? (
                    <a 
                      href={`/${doc._coreID}`}
                      className="text-primary hover:text-primary-focus underline ml-1"
                    >
                      {doc._coreID}
                    </a>
                  ) : 'N/A'}
                </p>
                <p className="m-0">
                  <strong>Cruise ID:</strong> {doc._cruiseID ? (
                    <a 
                      href={`/OSU-${doc._cruiseID}`}
                      className="text-primary hover:text-primary-focus underline ml-1"
                    >
                      {doc._cruiseID}
                    </a>
                  ) : 'N/A'}
                </p>
                <p className="m-0"><strong>Material:</strong> {doc.material || 'N/A'}</p>
                <p className="m-0"><strong>Half Type:</strong> {doc.halfType || 'N/A'}</p>
              </div>
            </div>

            {/* Physical Properties */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mt-0 mb-3">Physical Properties</h3>
              <div>
                {doc.depthTop != null && doc.depthBottom != null && (
                  <p className="m-0">
                    <strong>Depth Range:</strong> {doc.depthTop} - {doc.depthBottom} cm
                  </p>
                )}
                {doc.length && (
                  <p className="m-0"><strong>Length:</strong> {doc.length} cm</p>
                )}
                {doc.diameter && (
                  <p className="m-0"><strong>Diameter:</strong> {doc.diameter} cm</p>
                )}
                {doc.thickness && (
                  <p className="m-0"><strong>Thickness:</strong> {doc.thickness} cm</p>
                )}
                {doc.texture && (
                  <p className="m-0"><strong>Texture:</strong> {doc.texture}</p>
                )}
                {doc.color && (
                  <p className="m-0"><strong>Color:</strong> {doc.color}</p>
                )}
              </div>
            </div>

            {/* Location & Date */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mt-0 mb-3">Location & Date</h3>
              <div>
                <p className="m-0"><strong>Start Date:</strong> {doc.startDate ? new Date(doc.startDate).toLocaleDateString() : 'N/A'}</p>
                <p className="m-0"><strong>Start Time:</strong> {doc.startTime ? new Date(doc.startTime).toLocaleTimeString() : 'N/A'}</p>
                <p className="m-0"><strong>Latitude:</strong> {doc.latitudeStart ? `${doc.latitudeStart}°` : 'N/A'}</p>
                <p className="m-0"><strong>Longitude:</strong> {doc.longitudeStart ? `${doc.longitudeStart}°` : 'N/A'}</p>
                <p className="m-0"><strong>Water Depth:</strong> {doc.waterDepthStart ? `${doc.waterDepthStart} m` : 'N/A'}</p>
              </div>
            </div>

            {/* Files & Resources */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mt-0 mb-3">Available Files</h3>
              <div>
                {doc._files && doc._files.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {doc._files.map((file, index) => {
                      // Determine icon based on file type
                      const getFileIcon = (type: string, path: string) => {
                        const fileType = type?.toLowerCase() || '';
                        const extension = path?.split('.').pop()?.toLowerCase() || '';
                        
                        if (fileType.includes('description') || extension === 'pdf') return 'TbFileText';
                        if (fileType.includes('xrf') || fileType.includes('data') || extension === 'xlsx' || extension === 'csv') return 'TbFileSpreadsheet';
                        if (fileType.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'TbPhoto';
                        return 'TbFile';
                      };

                      const getFileName = (type: string, path: string) => {
                        if (type) {
                          return type.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ');
                        }
                        return path?.split('/').pop() || 'File';
                      };

                      return (
                        <a
                          key={index}
                          href={`https://haviside.ceoas.oregonstate.edu:6567/${file.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm flex items-center gap-2 no-underline hover:bg-primary hover:text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icon name={getFileIcon(file.type, file.path)} className="w-4 h-4" />
                          <span className="text-xs">{getFileName(file.type, file.path)}</span>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 m-0">No files available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      }
      {doc._docType == 'dive' && 
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">Dive Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3 text-secondary">Basic Information</h3>
              <div className="space-y-2">
                <p><strong>Title:</strong> {doc.title || 'N/A'}</p>
                <p><strong>Dive ID:</strong> {doc.id || 'N/A'}</p>
                <p><strong>OSU ID:</strong> {doc._osuid || 'N/A'}</p>
                <p><strong>Date:</strong> {doc.date ? new Date(doc.date).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3 text-secondary">Description</h3>
              <p className="text-sm">{doc.description || 'No description available'}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-base-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-secondary">Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <p><strong>Last Modified:</strong> {doc._modified ? new Date(doc._modified).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Validated:</strong> {doc._validated ? new Date(doc._validated).toLocaleDateString() : 'N/A'}</p>
              <p><strong>UUID:</strong> <code className="text-xs">{doc._uuid || 'N/A'}</code></p>
            </div>
          </div>
        </div>
      }
      {viewRawData && (
        <pre><code className="flex flex-col gap-2">
          {JSON.stringify(doc, null, 2)}
        </code></pre>
      )}
    </Container>
  </Section>
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