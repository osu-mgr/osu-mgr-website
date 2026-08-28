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
import { getDiveMethodLabel, formatDate, formatTime } from "../search/search-data";

const Globe = dynamic(() => import("../util/globe").then(mod => mod.Globe), {
  ssr: false,
  loading: () => <div className="w-full h-[300px] flex items-center justify-center bg-base-200">Loading globe...</div>,
});

const HIDDEN_FILE_TYPE_SUBSTRINGS = ['igsn', 'imlgs', 'itrax-xray-image'];
const isVisibleFile = (file: any) => {
  const t = file?.type?.toLowerCase() ?? '';
  return !HIDDEN_FILE_TYPE_SUBSTRINGS.some(s => t.includes(s));
};
const hasVisibleFiles = (doc: any) =>
  (doc?._files || []).some(isVisibleFile) || (doc?._moratorium_files || []).some(isVisibleFile);

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
    queryKey: ['coreSections', coreDoc._uuid],
    queryFn: async () => {
      if (!coreDoc._uuid) return null;

      const payload = {
        types: ['section'],
        terms: {
          "_coreUUID.keyword": [coreDoc._uuid],
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
    enabled: !!coreDoc._uuid,
  });

  const sections = sectionsResults?.hits?.hits || [];

  if (!coreDoc._uuid) return null;

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
  if (!cruiseDoc._locations || cruiseDoc._locations.length === 0) return null;

  const coordinates = (cruiseDoc._locations as any[])
    .map(loc => {
      const lat = parseFloat(loc.latitudeStart ?? loc.latitudeEnd);
      const lon = parseFloat(loc.longitudeStart ?? loc.longitudeEnd);
      return !isNaN(lat) && !isNaN(lon) ? { lat, lon } : null;
    })
    .filter(Boolean);

  if (coordinates.length === 0) return null;

  return (
    <div className="relative bg-gradient-to-br from-primary/10 via-base-100 to-base-100 border-b border-base-300">
      <div className="min-h-[300px]">
        <Globe coordinates={coordinates} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pointer-events-none">
        <div className="text-white">
          <div className="text-xs opacity-80 font-medium mb-1 uppercase tracking-wide">
            Showing {coordinates.length} location{coordinates.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

export const DiveGlobe: React.FC<{ diveDoc: any }> = ({ diveDoc }) => {
  const lat = parseFloat(diveDoc.latitudeStart);
  const lon = parseFloat(diveDoc.longitudeStart);
  if (isNaN(lat) || isNaN(lon)) return null;

  return (
    <div className="relative bg-gradient-to-br from-primary/10 via-base-100 to-base-100 border-b border-base-300">
      <div className="min-h-[300px]">
        <Globe coordinates={[{ lat, lon }]} />
      </div>
    </div>
  );
}

const CruiseCoresPanel: React.FC<{ cruiseDoc: any; onNavigateToChild?: (osuid: string) => void }> = ({ cruiseDoc, onNavigateToChild }) => {
  const {
    data: coresResults,
    isLoading: isCoresLoading,
  } = useQuery({
    queryKey: ['cruiseCores', cruiseDoc._uuid],
    queryFn: async () => {
      if (!cruiseDoc._uuid) return null;

      const payload = {
        types: ['core'],
        terms: {
          "_cruiseUUID.keyword": [cruiseDoc._uuid],
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
    enabled: !!cruiseDoc._uuid,
  });

  const cores = coresResults?.hits?.hits || [];

  if (!cruiseDoc._uuid || cores.length === 0) return null;

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
    queryKey: ['cruiseRocks', cruiseDoc._uuid],
    queryFn: async () => {
      if (!cruiseDoc._uuid) return null;

      const payload = {
        types: ['dive'],
        terms: {
          "_cruiseUUID.keyword": [cruiseDoc._uuid],
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
    enabled: !!cruiseDoc._uuid,
  });

  const rocks = rocksResults?.hits?.hits || [];

  if (!cruiseDoc._uuid || rocks.length === 0) return null;

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


const CoreSamplesPanel: React.FC<{ sectionHalfDoc: any; onNavigateToChild?: (osuid: string) => void }> = ({ sectionHalfDoc, onNavigateToChild }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['coreSamples', sectionHalfDoc._sectionHalfUUID],
    queryFn: async () => {
      if (!sectionHalfDoc._sectionHalfUUID) return null;
      const payload = { types: ['coreSample'], terms: { "_sectionHalfUUID.keyword": [sectionHalfDoc._sectionHalfUUID] }, sortOrder: 'ids asc', size: 100 };
      const res = await fetch('/api/opensearch?search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to fetch core samples'); }
      return res.json();
    },
    enabled: !!sectionHalfDoc._sectionHalfUUID,
  });
  const samples = data?.hits?.hits || [];
  if (!sectionHalfDoc._sectionHalfUUID || (samples.length === 0 && !isLoading)) return null;
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4 text-primary">Core Samples</h3>
      {isLoading && <div className="flex justify-center items-center py-8"><Icon name="TbLoader2" className="w-6 h-6 text-primary animate-spin" /><span className="ml-2">Loading core samples...</span></div>}
      {!isLoading && samples.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {samples.map((sample, index) => {
            const d = sample._source;
            return (
              <div key={index} onClick={() => onNavigateToChild?.(d._osuid)}
                className="block bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-primary cursor-pointer">
                <h4 className="font-semibold text-primary m-0 mb-2">{d._osuid}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  {d.material && <p className="m-0"><strong>Material:</strong> {d.material}</p>}
                  {d.method && <p className="m-0"><strong>Method:</strong> {d.method}</p>}
                  {d.weight && <p className="m-0"><strong>Weight:</strong> {d.weight} kg</p>}
                  {d._files?.length > 0 && <div className="flex items-center gap-1 mt-2"><Icon name="TbFiles" className="w-3 h-3 text-gray-500" /><span className="text-xs text-gray-500">{d._files.length} file{d._files.length !== 1 ? 's' : ''}</span></div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DiveSubsamplesPanel: React.FC<{ diveSampleDoc: any; onNavigateToChild?: (osuid: string) => void }> = ({ diveSampleDoc, onNavigateToChild }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['diveSubsamples', diveSampleDoc._diveSampleUUID],
    queryFn: async () => {
      if (!diveSampleDoc._diveSampleUUID) return null;
      const payload = { types: ['diveSubsample'], terms: { "_diveSampleUUID.keyword": [diveSampleDoc._diveSampleUUID] }, sortOrder: 'ids asc', size: 100 };
      const res = await fetch('/api/opensearch?search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to fetch subsamples'); }
      return res.json();
    },
    enabled: !!diveSampleDoc._diveSampleUUID,
  });
  const subsamples = data?.hits?.hits || [];
  if (!diveSampleDoc._diveSampleUUID || (subsamples.length === 0 && !isLoading)) return null;
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4 text-primary">Subsamples</h3>
      {isLoading && <div className="flex justify-center items-center py-8"><Icon name="TbLoader2" className="w-6 h-6 text-primary animate-spin" /><span className="ml-2">Loading subsamples...</span></div>}
      {!isLoading && subsamples.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subsamples.map((sub, index) => {
            const d = sub._source;
            return (
              <div key={index} onClick={() => onNavigateToChild?.(d._osuid)}
                className="block bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-primary cursor-pointer">
                <h4 className="font-semibold text-primary m-0 mb-2">{d._osuid}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  {d.material && <p className="m-0"><strong>Material:</strong> {d.material}</p>}
                  {d.method && <p className="m-0"><strong>Method:</strong> {d.method}</p>}
                  {d.weight && <p className="m-0"><strong>Weight:</strong> {d.weight} kg</p>}
                  {d._files?.length > 0 && <div className="flex items-center gap-1 mt-2"><Icon name="TbFiles" className="w-3 h-3 text-gray-500" /><span className="text-xs text-gray-500">{d._files.length} file{d._files.length !== 1 ? 's' : ''}</span></div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ANCESTOR_TYPES = ['cruise', 'core', 'dive', 'section', 'sectionHalf', 'diveSample', 'diveSubsample', 'coreSample'];

const getAncestorTypeLabel = (docType: string, method?: string) => {
  switch (docType) {
    case 'cruise': return 'Cruise';
    case 'core': return 'Core';
    case 'section': return 'Section';
    case 'sectionHalf': return 'Section Half';
    case 'dive': return getDiveMethodLabel(method);
    case 'diveSample': return 'Rock Sample';
    case 'diveSubsample': return 'Rock Subsample';
    case 'coreSample': return 'Core Sample';
    default: return docType ? docType.charAt(0).toUpperCase() + docType.slice(1) : 'Item';
  }
};

// Walk up the _parentOSUID chain, fetching each real ancestor document (immediate
// parent first, then reversed to top-down: cruise → ... → immediate parent).
const useAncestors = (doc: any) => {
  return useQuery({
    queryKey: ['ancestors', doc?._osuid],
    enabled: !!doc?._parentOSUID,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const chain: any[] = [];
      const seen = new Set<string>();
      let parentOSUID: string | undefined = doc?._parentOSUID;
      while (parentOSUID && !seen.has(parentOSUID)) {
        seen.add(parentOSUID);
        const res = await fetch('/api/opensearch?search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ types: ANCESTOR_TYPES, terms: { '_osuid.keyword': [parentOSUID] } }),
        });
        if (!res.ok) break;
        const results = await res.json();
        const src = results?.hits?.hits?.[0]?._source;
        if (!src) break;
        chain.push(src);
        parentOSUID = src._parentOSUID;
      }
      return chain.reverse();
    },
  });
};

const AncestorCard: React.FC<{ ancestor: any; onNavigate?: (osuid: string) => void }> = ({ ancestor, onNavigate }) => {
  const isCruise = ancestor._docType === 'cruise';
  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-4 text-primary">{getAncestorTypeLabel(ancestor._docType, ancestor.method)}</h3>
      <div
        onClick={() => onNavigate?.(ancestor._osuid)}
        className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-primary cursor-pointer"
      >
        <h4 className="font-semibold text-primary m-0 mb-2">{ancestor._osuid}</h4>
        <div className="space-y-1 text-sm text-gray-600">
          {ancestor.cruise && <p className="m-0"><strong>Name:</strong> {ancestor.cruise}</p>}
          {ancestor.rvName && <p className="m-0"><strong>Vessel:</strong> {ancestor.rvName}</p>}
          {ancestor.pi && <p className="m-0"><strong>PI:</strong> {ancestor.pi}</p>}
          {ancestor.method && <p className="m-0"><strong>Method:</strong> {ancestor.method}</p>}
          {ancestor.material && <p className="m-0"><strong>Material:</strong> {ancestor.material}</p>}
          {ancestor.depthTop != null && ancestor.depthBottom != null && <p className="m-0"><strong>Depth Range:</strong> {ancestor.depthTop} - {ancestor.depthBottom} cm</p>}
          {ancestor.length && <p className="m-0"><strong>Length:</strong> {ancestor.length} cm</p>}
          {ancestor.area && <p className="m-0"><strong>Area:</strong> {ancestor.area}</p>}
          {ancestor.latitudeStart != null && <p className="m-0"><strong>Latitude:</strong> {ancestor.latitudeStart}°</p>}
          {ancestor.longitudeStart != null && <p className="m-0"><strong>Longitude:</strong> {ancestor.longitudeStart}°</p>}
          {ancestor.waterDepthStart != null && <p className="m-0"><strong>Water Depth:</strong> {ancestor.waterDepthStart} m</p>}
          {isCruise && r2rCruiseLinks[ancestor._osuid] && (
            <div className="flex flex-row flex-wrap gap-1 mt-2">
              {r2rCruiseLinks[ancestor._osuid].map((link: string, idx: number) => (
                <a key={idx} href={link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="badge badge-primary hover:badge-primary-focus no-underline flex items-center gap-1">
                  <Icon name="BiLinkExternal" size="xxs" />R2R: {link.split('/').pop()}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Parent/grandparent chain shown above a document's children, so the modal can
// navigate up and down the hierarchy. Rendered top-down (cruise first).
const Ancestors: React.FC<{ doc: any; onNavigate?: (osuid: string) => void }> = ({ doc, onNavigate }) => {
  const { data: ancestors } = useAncestors(doc);
  if (!ancestors || ancestors.length === 0) return null;
  return (
    <>
      {ancestors.map((ancestor: any) => (
        <AncestorCard key={ancestor._osuid} ancestor={ancestor} onNavigate={onNavigate} />
      ))}
    </>
  );
};

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
        types: ['cruise', 'core', 'dive', 'section', 'sectionHalf', 'diveSample', 'diveSubsample', 'coreSample'],
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
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 text-primary">Cruise</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {doc.id && <p className="m-0"><strong>Cruise ID:</strong> {doc.id}</p>}
              {doc.rvName && <p className="m-0"><strong>Research Vessel:</strong> {doc.rvName}</p>}
              {doc.pi && <p className="m-0"><strong>PI:</strong> {doc.pi}</p>}
              {doc.piInstitution && <p className="m-0"><strong>PI Institution:</strong> {doc.piInstitution}</p>}
              {doc.area && <p className="m-0"><strong>Area:</strong> {doc.area}</p>}
              {formatDate(doc.startDate) && <p className="m-0"><strong>Start Date:</strong> {formatDate(doc.startDate)}</p>}
              {formatDate(doc.endDate) && <p className="m-0"><strong>End Date:</strong> {formatDate(doc.endDate)}</p>}
              {!formatDate(doc.startDate) && formatDate(doc.date) && <p className="m-0"><strong>Date:</strong> {formatDate(doc.date)}</p>}
              {doc.latitudeStart != null && <p className="m-0"><strong>Latitude Start:</strong> {doc.latitudeStart}°</p>}
              {doc.latitudeEnd != null && <p className="m-0"><strong>Latitude End:</strong> {doc.latitudeEnd}°</p>}
              {doc.longitudeStart != null && <p className="m-0"><strong>Longitude Start:</strong> {doc.longitudeStart}°</p>}
              {doc.longitudeEnd != null && <p className="m-0"><strong>Longitude End:</strong> {doc.longitudeEnd}°</p>}
              {doc.waterDepthStart != null && <p className="m-0"><strong>Water Depth Start:</strong> {doc.waterDepthStart} m</p>}
              {doc.waterDepthEnd != null && <p className="m-0"><strong>Water Depth End:</strong> {doc.waterDepthEnd} m</p>}
              {r2rCruiseLinks[doc._osuid] && (
                <div className="md:col-span-2 mt-2">
                  <strong>R2R Links:</strong>
                  <div className="flex flex-row flex-wrap gap-1 mt-1">
                    {r2rCruiseLinks[doc._osuid].map((link: string, idx: number) => (
                      <a key={idx} href={link} target="_blank" rel="noopener noreferrer"
                        className="badge badge-primary hover:badge-primary-focus no-underline flex items-center gap-1">
                        <Icon name="BiLinkExternal" size="xxs" />
                        R2R: {link.split('/').pop()}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {doc.description && <p className="text-sm mt-4">{doc.description}</p>}
          </div>

          {hasVisibleFiles(doc) && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-primary">Files</h3>
              <div className="flex flex-wrap gap-2">
                {(doc._files || []).filter(isVisibleFile).map((file, index) => <FileCard key={index} file={file} variant="button" />)}
                {(doc._moratorium_files || []).filter(isVisibleFile).map((file, index) => <FileCard key={`m-${index}`} file={file} variant="button" moratorium />)}
              </div>
            </div>
          )}

          <CruiseCoresPanel cruiseDoc={doc} onNavigateToChild={onNavigateToChild} />
          <CruiseRocksPanel cruiseDoc={doc} onNavigateToChild={onNavigateToChild} />
        </div>
      }
      {doc._docType == 'core' &&
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 text-primary">Core</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {doc.id && <p className="m-0"><strong>Core ID:</strong> {doc.id}</p>}
              {doc.rvName && <p className="m-0"><strong>Research Vessel:</strong> {doc.rvName}</p>}
              {doc.pi && <p className="m-0"><strong>PI:</strong> {doc.pi}</p>}
              {doc.material && <p className="m-0"><strong>Material:</strong> {doc.material}</p>}
              {doc.method && <p className="m-0"><strong>Method:</strong> {doc.method}</p>}
              {doc.diameter && <p className="m-0"><strong>Diameter:</strong> {doc.diameter} cm</p>}
              {doc.length && <p className="m-0"><strong>Length:</strong> {doc.length} cm</p>}
              {doc.nSections && <p className="m-0"><strong>Sections:</strong> {doc.nSections}</p>}
              {doc.area && <p className="m-0"><strong>Area:</strong> {doc.area}</p>}
              {formatDate(doc.startDate) && <p className="m-0"><strong>Start Date:</strong> {formatDate(doc.startDate)}</p>}
              {formatDate(doc.endDate) && <p className="m-0"><strong>End Date:</strong> {formatDate(doc.endDate)}</p>}
              {doc.latitudeStart != null && <p className="m-0"><strong>Latitude Start:</strong> {doc.latitudeStart}°</p>}
              {doc.latitudeEnd != null && <p className="m-0"><strong>Latitude End:</strong> {doc.latitudeEnd}°</p>}
              {doc.longitudeStart != null && <p className="m-0"><strong>Longitude Start:</strong> {doc.longitudeStart}°</p>}
              {doc.longitudeEnd != null && <p className="m-0"><strong>Longitude End:</strong> {doc.longitudeEnd}°</p>}
              {doc.waterDepthStart != null && <p className="m-0"><strong>Water Depth Start:</strong> {doc.waterDepthStart} m</p>}
              {doc.waterDepthEnd != null && <p className="m-0"><strong>Water Depth End:</strong> {doc.waterDepthEnd} m</p>}
            </div>
          </div>

          {hasVisibleFiles(doc) && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-primary">Files</h3>
              <div className="flex flex-wrap gap-2">
                {(doc._files || []).filter(isVisibleFile).map((file, index) => <FileCard key={index} file={file} variant="button" />)}
                {(doc._moratorium_files || []).filter(isVisibleFile).map((file, index) => <FileCard key={`m-${index}`} file={file} variant="button" moratorium />)}
              </div>
            </div>
          )}

          <Ancestors doc={doc} onNavigate={onNavigateToChild} />

          <CoreSectionsPanel coreDoc={doc} onNavigateToChild={onNavigateToChild} />
        </div>
      }
      {doc._docType == 'section' &&
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 text-primary">Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {doc.id && <p className="m-0"><strong>Section ID:</strong> {doc.id}</p>}
              {doc.material && <p className="m-0"><strong>Material:</strong> {doc.material}</p>}
              {doc.depthTop != null && doc.depthBottom != null && <p className="m-0"><strong>Depth Range:</strong> {doc.depthTop} - {doc.depthBottom} cm</p>}
              {doc.length && <p className="m-0"><strong>Length:</strong> {doc.length} cm</p>}
              {doc.diameter && <p className="m-0"><strong>Diameter:</strong> {doc.diameter} cm</p>}
              {doc.texture && <p className="m-0"><strong>Texture:</strong> {doc.texture}</p>}
              {formatDate(doc.startDate) && <p className="m-0"><strong>Start Date:</strong> {formatDate(doc.startDate)}</p>}
              {formatTime(doc.startTime) && <p className="m-0"><strong>Start Time:</strong> {formatTime(doc.startTime)}</p>}
              {doc.latitudeStart != null && <p className="m-0"><strong>Latitude Start:</strong> {doc.latitudeStart}°</p>}
              {doc.latitudeEnd != null && <p className="m-0"><strong>Latitude End:</strong> {doc.latitudeEnd}°</p>}
              {doc.longitudeStart != null && <p className="m-0"><strong>Longitude Start:</strong> {doc.longitudeStart}°</p>}
              {doc.longitudeEnd != null && <p className="m-0"><strong>Longitude End:</strong> {doc.longitudeEnd}°</p>}
              {doc.waterDepthStart != null && <p className="m-0"><strong>Water Depth Start:</strong> {doc.waterDepthStart} m</p>}
              {doc.waterDepthEnd != null && <p className="m-0"><strong>Water Depth End:</strong> {doc.waterDepthEnd} m</p>}
            </div>
          </div>

          {hasVisibleFiles(doc) && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-primary">Files</h3>
              <div className="flex flex-wrap gap-2">
                {(doc._files || []).filter(isVisibleFile).map((file, index) => <FileCard key={index} file={file} variant="button" />)}
                {(doc._moratorium_files || []).filter(isVisibleFile).map((file, index) => <FileCard key={`m-${index}`} file={file} variant="button" moratorium />)}
              </div>
            </div>
          )}

          <Ancestors doc={doc} onNavigate={onNavigateToChild} />
        </div>
      }
      {doc._docType == 'sectionHalf' &&
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 text-primary">Section Half</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {doc.id && <p className="m-0"><strong>Section Half ID:</strong> {doc.id}</p>}
              {doc.halfType && <p className="m-0"><strong>Half Type:</strong> {doc.halfType}</p>}
              {doc.material && <p className="m-0"><strong>Material:</strong> {doc.material}</p>}
              {doc.depthTop != null && doc.depthBottom != null && <p className="m-0"><strong>Depth Range:</strong> {doc.depthTop} - {doc.depthBottom} cm</p>}
              {doc.length && <p className="m-0"><strong>Length:</strong> {doc.length} cm</p>}
              {doc.diameter && <p className="m-0"><strong>Diameter:</strong> {doc.diameter} cm</p>}
              {doc.thickness && <p className="m-0"><strong>Thickness:</strong> {doc.thickness} cm</p>}
              {doc.texture && <p className="m-0"><strong>Texture:</strong> {doc.texture}</p>}
              {doc.color && <p className="m-0"><strong>Color:</strong> {doc.color}</p>}
              {formatDate(doc.startDate) && <p className="m-0"><strong>Start Date:</strong> {formatDate(doc.startDate)}</p>}
              {formatTime(doc.startTime) && <p className="m-0"><strong>Start Time:</strong> {formatTime(doc.startTime)}</p>}
              {doc.latitudeStart != null && <p className="m-0"><strong>Latitude Start:</strong> {doc.latitudeStart}°</p>}
              {doc.latitudeEnd != null && <p className="m-0"><strong>Latitude End:</strong> {doc.latitudeEnd}°</p>}
              {doc.longitudeStart != null && <p className="m-0"><strong>Longitude Start:</strong> {doc.longitudeStart}°</p>}
              {doc.longitudeEnd != null && <p className="m-0"><strong>Longitude End:</strong> {doc.longitudeEnd}°</p>}
              {doc.waterDepthStart != null && <p className="m-0"><strong>Water Depth Start:</strong> {doc.waterDepthStart} m</p>}
              {doc.waterDepthEnd != null && <p className="m-0"><strong>Water Depth End:</strong> {doc.waterDepthEnd} m</p>}
            </div>
          </div>

          {hasVisibleFiles(doc) && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-primary">Files</h3>
              <div className="flex flex-wrap gap-2">
                {(doc._files || []).filter(isVisibleFile).map((file, index) => <FileCard key={index} file={file} variant="button" />)}
                {(doc._moratorium_files || []).filter(isVisibleFile).map((file, index) => <FileCard key={`m-${index}`} file={file} variant="button" moratorium />)}
              </div>
            </div>
          )}

          <Ancestors doc={doc} onNavigate={onNavigateToChild} />

          <CoreSamplesPanel sectionHalfDoc={doc} onNavigateToChild={onNavigateToChild} />
        </div>
      }
      {doc._docType == 'dive' &&
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 text-primary">{getDiveMethodLabel(doc.method)}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {doc.id && <p className="m-0"><strong>{getDiveMethodLabel(doc.method)} ID:</strong> {doc.id}</p>}
              {doc.title && <p className="m-0"><strong>Title:</strong> {doc.title}</p>}
              {doc.rvName && <p className="m-0"><strong>Research Vessel:</strong> {doc.rvName}</p>}
              {doc.pi && <p className="m-0"><strong>PI:</strong> {doc.pi}</p>}
              {doc.material && <p className="m-0"><strong>Material:</strong> {doc.material}</p>}
              {doc.method && <p className="m-0"><strong>Method:</strong> {doc.method}</p>}
              {doc.area && <p className="m-0"><strong>Area:</strong> {doc.area}</p>}
              {doc.nSections != null && <p className="m-0"><strong>Samples:</strong> {doc.nSections}</p>}
              {formatDate(doc.startDate) && <p className="m-0"><strong>Start Date:</strong> {formatDate(doc.startDate)}</p>}
              {!formatDate(doc.startDate) && formatDate(doc.date) && <p className="m-0"><strong>Date:</strong> {formatDate(doc.date)}</p>}
              {doc.latitudeStart != null && <p className="m-0"><strong>Latitude Start:</strong> {doc.latitudeStart}°</p>}
              {doc.latitudeEnd != null && <p className="m-0"><strong>Latitude End:</strong> {doc.latitudeEnd}°</p>}
              {doc.longitudeStart != null && <p className="m-0"><strong>Longitude Start:</strong> {doc.longitudeStart}°</p>}
              {doc.longitudeEnd != null && <p className="m-0"><strong>Longitude End:</strong> {doc.longitudeEnd}°</p>}
              {doc.waterDepthStart != null && <p className="m-0"><strong>Water Depth Start:</strong> {doc.waterDepthStart} m</p>}
              {doc.waterDepthEnd != null && <p className="m-0"><strong>Water Depth End:</strong> {doc.waterDepthEnd} m</p>}
            </div>
            {doc.description && <p className="text-sm mt-4">{doc.description}</p>}
          </div>

          {hasVisibleFiles(doc) && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-primary">Files</h3>
              <div className="flex flex-wrap gap-2">
                {(doc._files || []).filter(isVisibleFile).map((file, index) => <FileCard key={index} file={file} variant="button" />)}
                {(doc._moratorium_files || []).filter(isVisibleFile).map((file, index) => <FileCard key={`m-${index}`} file={file} variant="button" moratorium />)}
              </div>
            </div>
          )}

          <Ancestors doc={doc} onNavigate={onNavigateToChild} />

          <RockSamplesPanel rockDoc={doc} onNavigateToChild={onNavigateToChild} />
        </div>
      }
      {doc._docType == 'diveSample' &&
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 text-primary">Rock Sample</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {doc.id && <p className="m-0"><strong>Sample ID:</strong> {doc.id}</p>}
              {doc.title && <p className="m-0"><strong>Title:</strong> {doc.title}</p>}
              {doc.material && <p className="m-0"><strong>Material:</strong> {doc.material}</p>}
              {doc.method && <p className="m-0"><strong>Method:</strong> {doc.method}</p>}
              {doc.weight != null && <p className="m-0"><strong>Weight:</strong> {doc.weight} kg</p>}
              {doc.area && <p className="m-0"><strong>Area:</strong> {doc.area}</p>}
              {doc.texture && <p className="m-0"><strong>Texture:</strong> {doc.texture}</p>}
              {doc.color && <p className="m-0"><strong>Color:</strong> {doc.color}</p>}
              {formatDate(doc.date) && <p className="m-0"><strong>Date:</strong> {formatDate(doc.date)}</p>}
              {doc.latitudeStart != null && <p className="m-0"><strong>Latitude Start:</strong> {doc.latitudeStart}°</p>}
              {doc.latitudeEnd != null && <p className="m-0"><strong>Latitude End:</strong> {doc.latitudeEnd}°</p>}
              {doc.longitudeStart != null && <p className="m-0"><strong>Longitude Start:</strong> {doc.longitudeStart}°</p>}
              {doc.longitudeEnd != null && <p className="m-0"><strong>Longitude End:</strong> {doc.longitudeEnd}°</p>}
              {doc.waterDepthStart != null && <p className="m-0"><strong>Water Depth Start:</strong> {doc.waterDepthStart} m</p>}
              {doc.waterDepthEnd != null && <p className="m-0"><strong>Water Depth End:</strong> {doc.waterDepthEnd} m</p>}
            </div>
            {doc.description && <p className="text-sm mt-4">{doc.description}</p>}
          </div>

          {hasVisibleFiles(doc) && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-primary">Files</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {(doc._files || []).filter(isVisibleFile).map((file: any, index: any) => <FileCard key={index} file={file} variant="thumbnail" />)}
                {(doc._moratorium_files || []).filter(isVisibleFile).map((file: any, index: any) => <FileCard key={`m-${index}`} file={file} variant="thumbnail" moratorium />)}
              </div>
            </div>
          )}

          <Ancestors doc={doc} onNavigate={onNavigateToChild} />

          <DiveSubsamplesPanel diveSampleDoc={doc} onNavigateToChild={onNavigateToChild} />
        </div>
      }
      {doc._docType == 'diveSubsample' &&
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 text-primary">Rock Subsample</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {doc.id && <p className="m-0"><strong>Subsample ID:</strong> {doc.id}</p>}
              {doc.title && <p className="m-0"><strong>Title:</strong> {doc.title}</p>}
              {doc.material && <p className="m-0"><strong>Material:</strong> {doc.material}</p>}
              {doc.method && <p className="m-0"><strong>Method:</strong> {doc.method}</p>}
              {doc.weight != null && <p className="m-0"><strong>Weight:</strong> {doc.weight} kg</p>}
              {doc.area && <p className="m-0"><strong>Area:</strong> {doc.area}</p>}
              {doc.texture && <p className="m-0"><strong>Texture:</strong> {doc.texture}</p>}
              {doc.color && <p className="m-0"><strong>Color:</strong> {doc.color}</p>}
              {formatDate(doc.date) && <p className="m-0"><strong>Date:</strong> {formatDate(doc.date)}</p>}
              {doc.latitudeStart != null && <p className="m-0"><strong>Latitude Start:</strong> {doc.latitudeStart}°</p>}
              {doc.longitudeStart != null && <p className="m-0"><strong>Longitude Start:</strong> {doc.longitudeStart}°</p>}
              {doc.waterDepthStart != null && <p className="m-0"><strong>Water Depth:</strong> {doc.waterDepthStart} m</p>}
            </div>
            {doc.description && <p className="text-sm mt-4">{doc.description}</p>}
          </div>

          {hasVisibleFiles(doc) && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-primary">Files</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {(doc._files || []).filter(isVisibleFile).map((file: any, index: any) => <FileCard key={index} file={file} variant="thumbnail" />)}
                {(doc._moratorium_files || []).filter(isVisibleFile).map((file: any, index: any) => <FileCard key={`m-${index}`} file={file} variant="thumbnail" moratorium />)}
              </div>
            </div>
          )}

          <Ancestors doc={doc} onNavigate={onNavigateToChild} />
        </div>
      }
      {doc._docType == 'coreSample' &&
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 text-primary">Core Sample</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {doc.id && <p className="m-0"><strong>Sample ID:</strong> {doc.id}</p>}
              {doc.material && <p className="m-0"><strong>Material:</strong> {doc.material}</p>}
              {doc.method && <p className="m-0"><strong>Method:</strong> {doc.method}</p>}
              {doc.weight != null && <p className="m-0"><strong>Weight:</strong> {doc.weight} kg</p>}
              {doc.area && <p className="m-0"><strong>Area:</strong> {doc.area}</p>}
              {doc.texture && <p className="m-0"><strong>Texture:</strong> {doc.texture}</p>}
              {doc.color && <p className="m-0"><strong>Color:</strong> {doc.color}</p>}
              {doc.depthTop != null && doc.depthBottom != null && <p className="m-0"><strong>Depth Range:</strong> {doc.depthTop} - {doc.depthBottom} cm</p>}
              {doc.latitudeStart != null && <p className="m-0"><strong>Latitude:</strong> {doc.latitudeStart}°</p>}
              {doc.longitudeStart != null && <p className="m-0"><strong>Longitude:</strong> {doc.longitudeStart}°</p>}
              {doc.waterDepthStart != null && <p className="m-0"><strong>Water Depth:</strong> {doc.waterDepthStart} m</p>}
            </div>
            {doc.description && <p className="text-sm mt-4">{doc.description}</p>}
          </div>

          {hasVisibleFiles(doc) && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-primary">Files</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {(doc._files || []).filter(isVisibleFile).map((file: any, index: any) => <FileCard key={index} file={file} variant="thumbnail" />)}
                {(doc._moratorium_files || []).filter(isVisibleFile).map((file: any, index: any) => <FileCard key={`m-${index}`} file={file} variant="thumbnail" moratorium />)}
              </div>
            </div>
          )}

          <Ancestors doc={doc} onNavigate={onNavigateToChild} />
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