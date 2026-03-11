import numeral from 'numeral';
import React, { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { Icon } from "../util/icon";
import { getFileTypeLabel } from './search-data';
import JSZip from 'jszip';

// Download Files Button Component
export const DownloadFilesButton: React.FC<{
  search: any;
  searchString: string;
  moratoriumCruises: string[];
}> = ({ search, searchString, moratoriumCruises }) => {

  const [isOpen, setIsOpen] = useState(false);
  const [selectedFileTypes, setSelectedFileTypes] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Fetch file counts from ALL result types (not just current)
  // Count unique file names/paths instead of counting duplicates
  const { data: fileTypeCounts, isLoading: countsLoading } = useQuery({
    queryKey: ['fileTypeCountsAll', search.searchString, search.filters?.fileTypes, search.filterLogic?.fileTypes, search.filters?.methods, search.filters?.materialTypes, search.filters?.rvNames],
    queryFn: async () => {
      // Fetch all documents from all document types
      const allTypes = ['cruise', 'core', 'section', 'section-half', 'dive', 'rock'];
      let allMatches: any[] = [];

      for (const docType of allTypes) {
        let pageNum = 0;
        const pageSize = 100;

        while (true) {
          const payload = {
            ...search,
            types: [docType],
            from: pageSize * pageNum,
            size: pageSize,
          };
          const res = await fetch('/api/opensearch?search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) break;

          const data = await res.json();
          const hits = data.hits?.hits || [];
          if (hits.length === 0) break;

          allMatches = allMatches.concat(hits);
          pageNum++;

          // Stop if we've fetched all available results
          const totalAvailable = data.hits.total?.value || 0;
          const fetchedForType = pageNum * pageSize;
          if (fetchedForType >= totalAvailable) break;
        }
      }

      // Count unique file paths by file type
      const uniqueFilesByType: { [key: string]: Set<string> } = {};

      for (const match of allMatches) {
        // Skip moratorium cruises
        if (moratoriumCruises.includes(match._source._osuid)) continue;

        const files = match._source._files || [];
        for (const file of files) {
          // Skip itrax file types
          if (file.type && file.type.startsWith('itrax-')) continue;

          if (!uniqueFilesByType[file.type]) {
            uniqueFilesByType[file.type] = new Set();
          }
          uniqueFilesByType[file.type].add(file.path);
        }
      }

      // Convert Sets to counts
      const counts: { [key: string]: number } = {};
      for (const [fileType, pathSet] of Object.entries(uniqueFilesByType)) {
        counts[fileType] = pathSet.size;
      }

      return counts;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const availableFileTypes = Object.keys(fileTypeCounts || {})
    .filter(fileType => !fileType.startsWith('itrax-'))
    .sort();

  // Initialize selected file types when available types change
  useEffect(() => {
    if (availableFileTypes.length > 0) {
      setSelectedFileTypes(new Set(availableFileTypes));
    } else {
      // Close menu when no file types available
      setIsOpen(false);
    }
  }, [availableFileTypes.join(',')]);

  // Calculate total files to download
  const totalFiles = Object.entries(fileTypeCounts || {})
    .filter(([type]) => selectedFileTypes.has(type))
    .reduce((sum, [, count]) => sum + (count as number), 0);
  const tooManyFiles = totalFiles > 1000;

  const handleDownload = async () => {
    if (tooManyFiles || totalFiles === 0) return;

    setIsDownloading(true);
    try {
      const zip = new JSZip();

      // Fetch all results from ALL document types by scrolling through pages
      let allMatches: any[] = [];
      const allTypes = ['cruise', 'core', 'section', 'section-half', 'dive', 'rock'];

      for (const docType of allTypes) {
        let pageNum = 0;
        const pageSize = 100;

        while (true) {
          const payload = {
            ...search,
            types: [docType],
            from: pageSize * pageNum,
            size: pageSize,
          };
          const res = await fetch('/api/opensearch?search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) break;

          const data = await res.json();
          const hits = data.hits?.hits || [];
          if (hits.length === 0) break;

          allMatches = allMatches.concat(hits);
          pageNum++;

          // Stop if we've fetched all available results
          const totalAvailable = data.hits.total?.value || 0;
          const fetchedForType = pageNum * pageSize;
          if (fetchedForType >= totalAvailable) break;
        }
      }

      // Collect all files to download
      const filesToDownload: any[] = [];
      for (const match of allMatches) {
        // Skip moratorium cruises
        if (moratoriumCruises.includes(match._source._osuid)) continue;

        const files = match._source._files || [];
        for (const file of files) {
          // Skip itrax file types
          if (file.type && file.type.startsWith('itrax-')) continue;

          if (selectedFileTypes.has(file.type)) {
            filesToDownload.push(file);
          }
        }
      }

      // Fetch and add each file to the zip
      let fetchedCount = 0;
      for (const file of filesToDownload) {
        try {
          const response = await fetch(`/api/file/${file.path}`);
          if (response.ok) {
            const blob = await response.blob();
            // Extract just the filename from the path
            const filename = file.path.split('/').pop() || file.path;
            zip.file(filename, blob);
          }
          fetchedCount++;
          setDownloadProgress((fetchedCount / filesToDownload.length) * 100);
        } catch (error) {
          console.error(`Failed to fetch file: ${file.path}`, error);
          fetchedCount++;
          setDownloadProgress((fetchedCount / filesToDownload.length) * 100);
        }
      }

      // Generate and download the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `osu-mgr-files-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsOpen(false);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download files. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const toggleFileType = (fileType: string) => {
    const newSet = new Set(selectedFileTypes);
    if (newSet.has(fileType)) {
      newSet.delete(fileType);
    } else {
      newSet.add(fileType);
    }
    setSelectedFileTypes(newSet);
  };

  const toggleAll = () => {
    if (selectedFileTypes.size === Object.keys(fileTypeCounts || {}).length) {
      setSelectedFileTypes(new Set());
    } else {
      setSelectedFileTypes(new Set(Object.keys(fileTypeCounts || {})));
    }
  };

  return (
    <div className="relative ml-2">
      <div>
        <button
          className="btn btn-primary"
          onClick={() => setIsOpen(!isOpen)}
          disabled={!countsLoading && availableFileTypes.length === 0}
        >
          Download Files
          <Icon name={isOpen ? "LuChevronUp" : "LuChevronDown"} size="xxs" className="ml-1" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-base-100 rounded-box shadow-lg border z-30 font-normal normal-case">
          {/* Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="label-text font-semibold pl-0 bg-transparent">Select File Types</span>
              <button
                className="btn btn-xs btn-outline"
                onClick={toggleAll}
              >
                {selectedFileTypes.size === Object.keys(fileTypeCounts || {}).length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* Scrollable file types list */}
          <div className="max-h-64 overflow-y-auto p-2">
            {countsLoading ? (
              <div className="flex justify-center items-center py-4">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" />
              </div>
            ) : Object.keys(fileTypeCounts || {}).length === 0 ? (
              <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                No files available
              </div>
            ) : (
              Object.entries(fileTypeCounts || {})
                .filter(([, count]) => (count as number) > 0)
                .map(([fileType, count]) => {
                  const isSelected = selectedFileTypes.has(fileType);
                  return (
                    <div key={fileType} className="form-control">
                      <label className="label cursor-pointer justify-start gap-2 py-1">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={isSelected}
                          onChange={() => toggleFileType(fileType)}
                        />
                        <span className="label-text text-sm bg-transparent flex-1">{getFileTypeLabel(fileType)}</span>
                        <span className="badge badge-sm badge-outline">
                          {numeral(count).format('0,0')}
                        </span>
                      </label>
                    </div>
                  );
                })
            )}
          </div>

          {/* Download button */}
          <div className="p-2 border-t">
            {tooManyFiles && (
              <div className="alert alert-primary mb-2 py-2 text-xs">
                Too many files selected ({numeral(totalFiles).format('0,0')}). Please select fewer than 1,000 files.
              </div>
            )}
            {!tooManyFiles && (
              <button
                className="btn btn-primary btn-sm btn-block relative overflow-hidden"
                disabled={tooManyFiles || totalFiles === 0 || isDownloading}
                onClick={handleDownload}
              >
                {isDownloading && (
                  <div
                    className="absolute inset-0 bg-primary-focus transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                )}
                <span className="relative z-10 bg-transparent">
                  {isDownloading ? (
                    <span className="text-black bg-transparent">
                      <Icon name="TbLoader2" size="small" className="animate-spin inline-block mr-1" />
                      Downloading... {Math.round(downloadProgress)}%
                    </span>
                  ) : (
                    <>Download {numeral(totalFiles).format('0,0')} File{totalFiles !== 1 ? 's' : ''}</>
                  )}
                </span>
              </button>)}
          </div>
        </div>
      )}
    </div>
  );
};
