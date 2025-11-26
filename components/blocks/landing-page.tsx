import _ from 'lodash';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Section } from "../util/section";
import { Container } from "../util/container";
import { ItemsCount } from '../util/items-count';
import { CollectionFileButton } from '../util/collection-file-button';
import { FileCard } from '../util/file-card';
import { Icon } from "../util/icon";

const Globe = dynamic(() => import("../util/globe").then(mod => mod.Globe), {
  ssr: false,
  loading: () => <div className="w-full h-[300px] flex items-center justify-center bg-base-200">Loading globe...</div>,
});

const r2rCruiseLinks: { [key: string]: string[] } = {
  'OSU-AT0003': ['https://www.rvdata.us/search/cruise/AT3-49'],
  'OSU-BENTHIC3': ['https://www.rvdata.us/search/cruise/BNTH03MV'],
  'OSU-EW0104': ['https://www.rvdata.us/search/cruise/EW0104'],
  'OSU-EW0408': ['https://www.rvdata.us/search/cruise/EW0408'],
  'OSU-EW9504': ['https://www.rvdata.us/search/cruise/EW9504'],
  'OSU-EW9505': ['https://www.rvdata.us/search/cruise/EW9505'],
  'OSU-EW9709': ['https://www.rvdata.us/search/cruise/EW9709'],
  'OSU-FD7503': ['https://www.rvdata.us/search/cruise/FDRK03MV'],
  'OSU-HE0002': ['https://www.rvdata.us/search/cruise/HLY0001'],
  'OSU-INMD01': ['https://www.rvdata.us/search/cruise/INMD01MV'],
  'OSU-KM0419': ['https://www.rvdata.us/search/cruise/KM0419'],
  'OSU-M8011': ['https://www.rvdata.us/search/cruise/VLCN03MV','https://www.rvdata.us/search/cruise/VLCN04MV'],
  'OSU-M9907': ['https://www.rvdata.us/search/cruise/AVON09MV'],
  'OSU-ME0005A': ['https://www.rvdata.us/search/cruise/NEMO03MV'],
  'OSU-MV0209': ['https://www.rvdata.us/search/cruise/VANC02MV'],
  'OSU-MV0502': ['https://www.rvdata.us/search/cruise/TUIM03MV'],
  'OSU-MV0508': ['https://www.rvdata.us/search/cruise/TUIM13MV'],
  'OSU-MV0811': ['https://www.rvdata.us/search/cruise/BOLT02MV'],
  'OSU-MV1014': ['https://www.rvdata.us/search/cruise/MV1014'],
  'OSU-PE2111': ['https://www.rvdata.us/search/cruise/PE21-11'],
  'OSU-PLDS2': ['https://www.rvdata.us/search/cruise/PLDS02MV'],
  'OSU-PLUME02': ['https://www.rvdata.us/search/cruise/PLUM02WT'],
  'OSU-PLUTO3': ['https://www.rvdata.us/search/cruise/PLTO03MV'],
  'OSU-RAMA1': ['https://www.rvdata.us/search/cruise/RAMA01WT'],
  'OSU-RR0207': ['https://www.rvdata.us/search/cruise/LPRS02RR'],
  'OSU-RR0503': ['https://www.rvdata.us/search/cruise/ZHNG03RR'],
  'OSU-RR0603': ['https://www.rvdata.us/search/cruise/AMAT03RR'],
  'OSU-RR1310': ['https://www.rvdata.us/search/cruise/RR1310'],
  'OSU-RR1807': ['https://www.rvdata.us/search/cruise/RR1807'],
  'OSU-RR2208': ['https://www.rvdata.us/search/vessel/Revelle'],
  'OSU-RR9702A': ['https://www.rvdata.us/search/cruise/GENE03RR'],
  'OSU-SH1710': ['https://www.rvdata.us/search/cruise/HRS1710JH'],
  'OSU-SKQ1603': ['https://www.rvdata.us/search/cruise/SKQ201602S'],
  'OSU-SKQ1903': ['https://www.rvdata.us/search/cruise/SKQ201905S'],
  'OSU-SP1716': ['https://www.rvdata.us/search/cruise/SP1716'],
  'OSU-SR1801': ['https://www.rvdata.us/search/cruise/SR1801'],
  'OSU-SR2113': ['https://www.rvdata.us/search/cruise/SR2113'],
  'OSU-TN037': ['https://www.rvdata.us/search/cruise/TN037'],
  'OSU-TN0909': ['https://www.rvdata.us/search/cruise/TN240'],
  'OSU-TN314': ['https://www.rvdata.us/search/cruise/TN314'],
  'OSU-TT1811': ['https://www.rvdata.us/search/cruise/TN362'],
  'OSU-TT1909': ['https://www.rvdata.us/search/cruise/TN372'],
  'OSU-OC2109A': ['https://www.rvdata.us/search/cruise/OC2109A'],
  'OSU-OC1706B': ['https://www.rvdata.us/search/cruise/OC1706B'],
  'OSU-OC1804C': ['https://www.rvdata.us/search/cruise/OC1804C'],
  'OSU-OC1906A': ['https://www.rvdata.us/search/cruise/OC1906A'],
  'OSU-OC1908B': ['https://www.rvdata.us/search/cruise/OC1908B'],
  'OSU-OC2006A': ['https://www.rvdata.us/search/cruise/OC2006A'],
  'OSU-SKQ202309T': ['https://www.rvdata.us/search/cruise/SKQ202309T'],
  'OSU-SKQ202311S': ['https://www.rvdata.us/search/cruise/SKQ202311S'],
  'OSU-SKQ202404S': ['https://www.rvdata.us/search/cruise/SKQ202404S'],
  'OSU-SKQ202410S': ['https://www.rvdata.us/search/cruise/SKQ202410S'],
  'OSU-SKQ2012': ['https://www.rvdata.us/search/cruise/SKQ202016S'],
  'OSU-SKQ2211': ['https://www.rvdata.us/search/cruise/SKQ202215S'],
  'OSU-SKQ2303': ['https://www.rvdata.us/search/cruise/SKQ202305S'],
  'OSU-SKQ202206S': ['https://www.rvdata.us/search/cruise/SKQ202206S'],
  'OSU-SP2323': ['https://www.rvdata.us/search/cruise/SP2323'],
  'OSU-SR2510': ['https://www.rvdata.us/search/cruise/SR2510'],
  'OSU-W0903B': ['https://www.rvdata.us/search/cruise/W0903B'],
  'OSU-W0906A': ['https://www.rvdata.us/search/cruise/W0906A'],
  'OSU-W0906C': ['https://www.rvdata.us/search/cruise/W0906C'],
  'OSU-W0910B': ['https://www.rvdata.us/search/cruise/W0910B']
};

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
    queryKey: ['osuID', cruiseDoc._osuid],
    queryFn: async () => { 
      const payload = {
        types: ['cruise', 'core', 'dive'],
        terms: {
          "_osuid.keyword": [cruiseDoc._osuid.toUpperCase()],
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

const CoreSectionsPanel: React.FC<{ coreDoc: any; onNavigateToChild?: (osuid: string) => void }> = ({ coreDoc, onNavigateToChild }) => {
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
    <div className="mt-6">
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
              <div
                key={index}
                onClick={() => onNavigateToChild?.(sectionData._osuid)}
                className="block bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-primary cursor-pointer"
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const RockSamplesPanel: React.FC<{ rockDoc: any; onNavigateToChild?: (osuid: string) => void }> = ({ rockDoc, onNavigateToChild }) => {
  const {
    data: samplesResults,
    isLoading: isSamplesLoading,
  } = useQuery({
    queryKey: ['rockSamples', rockDoc._diveUUID],
    queryFn: async () => { 
      if (!rockDoc._diveUUID) return null;
      
      const payload = {
        types: ['diveSample'],
        terms: {
          "_diveUUID.keyword": [rockDoc._diveUUID],
        },
        sortOrder: 'ids asc',
        size: 100, // Get up to 100 samples
      };
      const res = await fetch('/api/opensearch?search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorresults = await res.json();
        throw new Error(errorresults.message || 'Failed to fetch rock samples');
      }
      return res.json();
    },
    enabled: !!rockDoc._diveUUID,
  });

  const samples = samplesResults?.hits?.hits || [];

  if (!rockDoc._diveUUID) return null;

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4 text-primary">Rock Samples</h3>
      
      {isSamplesLoading && (
        <div className="flex justify-center items-center py-8">
          <Icon name="TbLoader2" className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-2">Loading samples...</span>
        </div>
      )}

      {!isSamplesLoading && samples.length === 0 && (
        <p className="text-gray-500">No samples found for this rock.</p>
      )}

      {!isSamplesLoading && samples.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {samples.map((sample, index) => {
            const sampleData = sample._source;
            return (
              <div
                key={index}
                onClick={() => onNavigateToChild?.(sampleData._osuid)}
                className="block bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-primary cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-primary m-0">{sampleData._osuid}</h4>
                  <Icon name="TbExternalLink" className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="m-0">
                    <strong>Type:</strong> Sample
                  </p>
                  
                  {sampleData.method && (
                    <p className="m-0">
                      <strong>Method:</strong> {sampleData.method}
                    </p>
                  )}

                  {sampleData.weight && (
                    <p className="m-0">
                      <strong>Weight:</strong> {sampleData.weight} kg
                    </p>
                  )}

                  {sampleData.area && (
                    <p className="m-0">
                      <strong>Area:</strong> {sampleData.area}
                    </p>
                  )}

                  {sampleData._files && sampleData._files.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Icon name="TbFiles" className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {sampleData._files.length} file{sampleData._files.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const CruiseGlobe: React.FC<{ cruiseDoc: any }> = ({ cruiseDoc }) => {
  const {
    data: coresResults,
    isLoading: isCoresLoading,
  } = useQuery({
    queryKey: ['cruiseGlobeCores', cruiseDoc._cruiseUUID],
    queryFn: async () => { 
      if (!cruiseDoc._cruiseUUID) return null;
      
      const payload = {
        types: ['core'],
        terms: {
          "_cruiseUUID.keyword": [cruiseDoc._cruiseUUID],
        },
        sortOrder: 'ids asc',
        size: 500, // Get more cores for the globe
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
  
  // Extract coordinates from cores
  const coordinates = cores
    .map((core: any) => {
      const coreData = core._source;
      const lat = coreData.latitudeStart ?? coreData.latitude;
      const lon = coreData.longitudeStart ?? coreData.longitude;
      
      if (lat != null && lon != null) {
        return {
          lat: Number(lat),
          lon: Number(lon),
          name: coreData._osuid || coreData.id
        };
      }
      return null;
    })
    .filter((coord: any) => coord !== null);

  if (!cruiseDoc._cruiseUUID || coordinates.length === 0) return null;

  return (
    <div className="relative bg-gradient-to-br from-primary/10 via-base-100 to-base-100 border-b border-base-300">
      {isCoresLoading ? (
        <div className="flex justify-center items-center py-8 min-h-[300px]">
          <Icon name="TbLoader2" className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-2">Loading core locations...</span>
        </div>
      ) : (
        <>
          <div className="min-h-[300px]">
            <Globe coordinates={coordinates} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pointer-events-none">
            <div className="text-white">
              <div className="text-xs opacity-80 font-medium mb-1 uppercase tracking-wide">
                Showing {coordinates.length} core location{coordinates.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export const DiveGlobe: React.FC<{ diveDoc: any }> = ({ diveDoc }) => {
  const {
    data: samplesResults,
    isLoading: isSamplesLoading,
  } = useQuery({
    queryKey: ['diveGlobeSamples', diveDoc._diveUUID],
    queryFn: async () => { 
      if (!diveDoc._diveUUID) return null;
      
      const payload = {
        types: ['diveSample'],
        terms: {
          "_diveUUID.keyword": [diveDoc._diveUUID],
        },
        sortOrder: 'ids asc',
        size: 500, // Get more samples for the globe
      };
      const res = await fetch('/api/opensearch?search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorresults = await res.json();
        throw new Error(errorresults.message || 'Failed to fetch rock samples');
      }
      return res.json();
    },
    enabled: !!diveDoc._diveUUID,
  });

  const samples = samplesResults?.hits?.hits || [];
  
  // Extract coordinates from samples
  const coordinates = samples
    .map((sample: any) => {
      const sampleData = sample._source;
      const lat = sampleData.latitudeStart ?? sampleData.latitude;
      const lon = sampleData.longitudeStart ?? sampleData.longitude;
      
      if (lat != null && lon != null) {
        return {
          lat: Number(lat),
          lon: Number(lon),
          name: sampleData._osuid || sampleData.id
        };
      }
      return null;
    })
    .filter((coord: any) => coord !== null);

  if (!diveDoc._diveUUID || coordinates.length === 0) return null;

  return (
    <div className="relative bg-gradient-to-br from-primary/10 via-base-100 to-base-100 border-b border-base-300">
      {isSamplesLoading ? (
        <div className="flex justify-center items-center py-8 min-h-[300px]">
          <Icon name="TbLoader2" className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-2">Loading rock sample locations...</span>
        </div>
      ) : (
        <>
          <div className="min-h-[300px]">
            <Globe coordinates={coordinates} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pointer-events-none">
            <div className="text-white">
              <div className="text-xs opacity-80 font-medium mb-1 uppercase tracking-wide">
                Showing {coordinates.length} rock sample location{coordinates.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const CruiseCoresPanel: React.FC<{ cruiseDoc: any; onNavigateToChild?: (osuid: string) => void }> = ({ cruiseDoc, onNavigateToChild }) => {
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
    <div className="mt-6">
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
              <div
                key={index}
                onClick={() => onNavigateToChild?.(coreData._osuid)}
                className="block bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-primary cursor-pointer"
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const CruiseRocksPanel: React.FC<{ cruiseDoc: any; onNavigateToChild?: (osuid: string) => void }> = ({ cruiseDoc, onNavigateToChild }) => {
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
    <div className="mt-6">
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
              <div
                key={index}
                onClick={() => onNavigateToChild?.(rockData._osuid)}
                className="block bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-primary cursor-pointer"
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const SectionhalvesPanel: React.FC<{ sectionDoc: any; onNavigateToChild?: (osuid: string) => void }> = ({ sectionDoc, onNavigateToChild }) => {
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
    <div className="mt-6">
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
              <div
                key={index}
                onClick={() => onNavigateToChild?.(halfData._osuid)}
                className="block bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-primary cursor-pointer"
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const LandingPage: React.FC<{ data: any; osuId?: string; onDocumentLoaded?: (doc: any) => void; onNavigateToChild?: (osuid: string) => void }> = ({
    data,
    osuId,
    onDocumentLoaded,
    onNavigateToChild
}) => {
  const { asPath } = useRouter();
  
  // Use passed osuId prop or extract from URL
  const osuID = osuId || asPath.substring(1); // Remove leading slash from path if no osuId provided
	
  const viewRawData = false;  //!process.env.VERCEL;
  console.log("viewRawData", viewRawData);

  const {
    data: results,
    isLoading: isLoadingQuery,
  } = useQuery({
    queryKey: ['osuID', osuID],
    queryFn: async () => { 
      const payload = {
        types: ['cruise', 'core', 'dive', 'section', 'sectionHalf', 'diveSample', 'diveSubsample'],
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

  const doc = (results?.hits?.total?.value > 0 || results?.hits?.total > 0) && results?.hits?.hits?.[0]?._source 
    ? results.hits.hits[0]._source 
    : {};

  // Notify parent component when document is loaded
  useEffect(() => {
    if (onDocumentLoaded && doc._osuid) {
      onDocumentLoaded(doc);
    }
  }, [doc, onDocumentLoaded]);

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
          <h2 className="text-2xl font-bold mb-6 text-primary">Cruise {osuId || doc._osuid}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mt-0 mb-3">Basic Information</h3>
              <div>
                {doc.id && <p className="m-0"><strong>Cruise ID:</strong> {doc.id}</p>}
                {doc.date && <p className="m-0"><strong>Date:</strong> {new Date(doc.date).toLocaleDateString()}</p>}
                {r2rCruiseLinks[doc._osuid] && (
                  <div className="mt-2">
                    <strong>R2R Links:</strong>
                    <div className="flex flex-row flex-wrap gap-1 mt-1">
                      {r2rCruiseLinks[doc._osuid].map((link: string, idx: number) => (
                        <a 
                          key={idx}
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="badge badge-primary hover:badge-primary-focus no-underline flex items-center gap-1"
                        >
                          <Icon name="BiLinkExternal" size="xxs" />
                          R2R: {link.split('/').pop()}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {doc.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mt-0 mb-3">Description</h3>
                <p className="text-sm">{doc.description}</p>
              </div>
            )}

            {/* Files & Resources */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mt-0 mb-3">Available Files</h3>
              <div>
                {doc._files && doc._files.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {doc._files.map((file, index) => (
                      <FileCard key={index} file={file} variant="button" />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 m-0">No files available</p>
                )}
              </div>
            </div>
          </div>

          {/* Cruise Cores Panel */}
          <CruiseCoresPanel cruiseDoc={doc} onNavigateToChild={onNavigateToChild} />

          {/* Cruise Rocks Panel */}
          <CruiseRocksPanel cruiseDoc={doc} onNavigateToChild={onNavigateToChild} />
        </div>
      }
      {doc._docType == 'core' && 
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">Core {osuId || doc._osuid}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mt-0 mb-3">Basic Information</h3>
              <div>
                {doc.id && <p className="m-0"><strong>Core ID:</strong> {doc.id}</p>}
                {doc._cruiseID && (
                  <p className="m-0">
                    <strong>Cruise ID:</strong>
                    <button
                      onClick={() => onNavigateToChild?.(`OSU-${doc._cruiseID}`)}
                      className="text-primary hover:text-primary-focus no-underline ml-1 bg-transparent border-none p-0 cursor-pointer"
                    >
                      {doc._cruiseID}
                    </button>
                  </p>
                )}
                {doc.material && <p className="m-0"><strong>Material:</strong> {doc.material}</p>}
                {doc.method && <p className="m-0"><strong>Method:</strong> {doc.method}</p>}
              </div>
            </div>

            {/* Core Size */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mt-0 mb-3">Core Size</h3>
              <div>
                {doc.diameter && <p className="m-0"><strong>Diameter:</strong> {doc.diameter} cm</p>}
                {doc.length && <p className="m-0"><strong>Length:</strong> {doc.length} cm</p>}
                {doc.nSections && <p className="m-0"><strong>Number of Sections:</strong> {doc.nSections}</p>}
              </div>
            </div>

            {/* Location & Date */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mt-0 mb-3">Location & Date</h3>
              <div>
                {doc.startDate && <p className="m-0"><strong>Start Date:</strong> {new Date(doc.startDate).toLocaleDateString()}</p>}
                {doc.endDate && <p className="m-0"><strong>End Date:</strong> {new Date(doc.endDate).toLocaleDateString()}</p>}
                {doc.latitudeStart != null && <p className="m-0"><strong>Latitude:</strong> {doc.latitudeStart}°</p>}
                {doc.longitudeStart != null && <p className="m-0"><strong>Longitude:</strong> {doc.longitudeStart}°</p>}
                {doc.waterDepthStart && <p className="m-0"><strong>Water Depth:</strong> {doc.waterDepthStart} m</p>}
              </div>
            </div>

            {/* Files & Resources */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mt-0 mb-3">Available Files</h3>
              <div>
                {doc._files && doc._files.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {doc._files.map((file, index) => (
                      <FileCard key={index} file={file} variant="button" />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 m-0">No files available</p>
                )}
              </div>
            </div>
          </div>

          {/* Core Sections Panel */}
          <CoreSectionsPanel coreDoc={doc} onNavigateToChild={onNavigateToChild} />
        </div>
      }
      {doc._docType == 'section' && 
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">Section {osuId || doc._osuid}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mt-0 mb-3">Basic Information</h3>
              <div>
                {doc.id && <p className="m-0"><strong>Section ID:</strong> {doc.id}</p>}
                {doc._coreID && (
                  <p className="m-0">
                    <strong>Core ID:</strong>
                    <button
                      onClick={() => onNavigateToChild?.(doc._coreID)}
                      className="text-primary hover:text-primary-focus no-underline ml-1 bg-transparent border-none p-0 cursor-pointer"
                    >
                      {doc._coreID}
                    </button>
                  </p>
                )}
                {doc._cruiseID && (
                  <p className="m-0">
                    <strong>Cruise ID:</strong>
                    <button
                      onClick={() => onNavigateToChild?.(`OSU-${doc._cruiseID}`)}
                      className="text-primary hover:text-primary-focus no-underline ml-1 bg-transparent border-none p-0 cursor-pointer"
                    >
                      {doc._cruiseID}
                    </button>
                  </p>
                )}
                {doc.material && <p className="m-0"><strong>Material:</strong> {doc.material}</p>}
              </div>
            </div>

            {/* Section Length */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mt-0 mb-3">Section Length</h3>
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
            <div className="mb-6">
              <h3 className="text-lg font-semibold mt-0 mb-3">Location & Date</h3>
              <div>
                {doc.startDate && <p className="m-0"><strong>Start Date:</strong> {new Date(doc.startDate).toLocaleDateString()}</p>}
                {doc.startTime && <p className="m-0"><strong>Start Time:</strong> {new Date(doc.startTime).toLocaleTimeString()}</p>}
                {doc.latitudeStart != null && <p className="m-0"><strong>Latitude:</strong> {doc.latitudeStart}°</p>}
                {doc.longitudeStart != null && <p className="m-0"><strong>Longitude:</strong> {doc.longitudeStart}°</p>}
                {doc.waterDepthStart && <p className="m-0"><strong>Water Depth:</strong> {doc.waterDepthStart} m</p>}
              </div>
            </div>

            {/* Files & Resources */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mt-0 mb-3">Available Files</h3>
              <div>
                {doc._files && doc._files.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {doc._files.map((file, index) => (
                      <FileCard key={index} file={file} variant="button" />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 m-0">No files available</p>
                )}
              </div>
            </div>
          </div>

          {/* Section halves Panel */}
          <SectionhalvesPanel sectionDoc={doc} onNavigateToChild={onNavigateToChild} />
        </div>
      }
      {doc._docType == 'sectionHalf' && 
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">Section Half {osuId || doc._osuid}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mt-0 mb-3">Basic Information</h3>
              <div>
                {doc.id && <p className="m-0"><strong>Section Half ID:</strong> {doc.id}</p>}
                {doc._sectionID && (
                  <p className="m-0">
                    <strong>Section ID:</strong>
                    <button
                      onClick={() => onNavigateToChild?.(doc._sectionID)}
                      className="text-primary hover:text-primary-focus no-underline ml-1 bg-transparent border-none p-0 cursor-pointer"
                    >
                      {doc._sectionID}
                    </button>
                  </p>
                )}
                {doc._coreID && (
                  <p className="m-0">
                    <strong>Core ID:</strong>
                    <button
                      onClick={() => onNavigateToChild?.(doc._coreID)}
                      className="text-primary hover:text-primary-focus no-underline ml-1 bg-transparent border-none p-0 cursor-pointer"
                    >
                      {doc._coreID}
                    </button>
                  </p>
                )}
                {doc._cruiseID && (
                  <p className="m-0">
                    <strong>Cruise ID:</strong>
                    <button
                      onClick={() => onNavigateToChild?.(`OSU-${doc._cruiseID}`)}
                      className="text-primary hover:text-primary-focus no-underline ml-1 bg-transparent border-none p-0 cursor-pointer"
                    >
                      {doc._cruiseID}
                    </button>
                  </p>
                )}
                {doc.material && <p className="m-0"><strong>Material:</strong> {doc.material}</p>}
                {doc.halfType && <p className="m-0"><strong>Half Type:</strong> {doc.halfType}</p>}
              </div>
            </div>

            {/* Physical Properties */}
            <div className="mb-6">
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
            <div className="mb-6">
              <h3 className="text-lg font-semibold mt-0 mb-3">Location & Date</h3>
              <div>
                {doc.startDate && <p className="m-0"><strong>Start Date:</strong> {new Date(doc.startDate).toLocaleDateString()}</p>}
                {doc.startTime && <p className="m-0"><strong>Start Time:</strong> {new Date(doc.startTime).toLocaleTimeString()}</p>}
                {doc.latitudeStart != null && <p className="m-0"><strong>Latitude:</strong> {doc.latitudeStart}°</p>}
                {doc.longitudeStart != null && <p className="m-0"><strong>Longitude:</strong> {doc.longitudeStart}°</p>}
                {doc.waterDepthStart && <p className="m-0"><strong>Water Depth:</strong> {doc.waterDepthStart} m</p>}
              </div>
            </div>

            {/* Files & Resources */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mt-0 mb-3">Available Files</h3>
              <div>
                {doc._files && doc._files.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {doc._files.map((file, index) => (
                      <FileCard key={index} file={file} variant="button" />
                    ))}
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
          <h2 className="text-2xl font-bold mb-6 text-primary">Rock {osuId || doc._osuid}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-base-content">Basic Information</h3>
              <div className="space-y-2">
                {doc.title && <p className="m-0"><strong>Title:</strong> {doc.title}</p>}
                {doc.id && <p className="m-0"><strong>Dive ID:</strong> {doc.id}</p>}
                {doc.date && <p className="m-0"><strong>Date:</strong> {new Date(doc.date).toLocaleDateString()}</p>}
              </div>
            </div>

            {/* Description */}
            {doc.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-base-content">Description</h3>
                <p className="text-sm">{doc.description}</p>
              </div>
            )}
          </div>

          {/* Rock Samples Panel */}
          <RockSamplesPanel rockDoc={doc} onNavigateToChild={onNavigateToChild} />
        </div>
      }
      {(doc._docType == 'diveSample' || doc._docType == 'diveSubsample') && 
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">
            {doc._docType === 'diveSample' ? 'Rock Sample' : 'Rock Subsample'} {osuId || doc._osuid}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-base-content">Basic Information</h3>
              <div className="space-y-2">
                {doc.title && <p><strong>Title:</strong> {doc.title}</p>}
                <p><strong>Type:</strong> {doc._docType === 'diveSample' ? 'Sample' : 'Subsample'}</p>
                {doc._osuid && <p><strong>OSU ID:</strong> {doc._osuid}</p>}
                {doc.date && <p><strong>Date:</strong> {new Date(doc.date).toLocaleDateString()}</p>}
                {doc.method && <p><strong>Method:</strong> {doc.method}</p>}
                {doc.weight && <p><strong>Weight:</strong> {doc.weight} kg</p>}
                {doc.area && <p><strong>Area:</strong> {doc.area}</p>}
              </div>
            </div>

            {/* Description */}
            {doc.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-base-content">Description</h3>
                <p className="text-sm">{doc.description}</p>
              </div>
            )}
          </div>

          {/* Files */}
          {doc._files && doc._files.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-base-content">Files</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {doc._files.map((file: any, index: any) => (
                  <FileCard key={index} file={file} variant="thumbnail" />
                ))}
              </div>
            </div>
          )}
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