import React from 'react';
import { getFileTypeLabel, hasFileTypeLabel } from './search-data';

// Key of the modal tab that lists a record's files of one type (its own, or the
// "Related …" files inherited from ancestors / adopted from descendants). Must
// match the tab keys built in landing-page.tsx.
export const fileTabKey = (fileType: string, related: boolean) =>
  `${related ? 'related' : 'files'}:${fileType}`;

// A count in a results row ("Cores: 9", "Core Image: 13") that opens the record's
// modal on the tab listing those items. The row itself opens the modal on its
// Details tab, so the click stops here.
export const CountLink: React.FC<{ onClick?: () => void; className?: string; children: React.ReactNode }> = ({ onClick, className = '', children }) =>
  onClick ? (
    <a
      className={`link link-hover cursor-pointer ${className}`}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {children}
    </a>
  ) : <span className={className}>{children}</span>;

// Files column: the record's own files per type, moratorium files in brackets.
export const FileCounts: React.FC<{ source: any; onOpenTab?: (tab: string) => void }> = ({ source, onOpenTab }) => {
  const files = source._files || [];
  const moratoriumFiles = source._moratorium_files || [];

  // Group files by type and count them
  const fileTypeCounts: { [key: string]: number } = {};
  const moratoriumFileCounts: { [key: string]: number } = {};

  files.forEach((file: any) => {
    if (hasFileTypeLabel(file.type)) {
      fileTypeCounts[file.type] = (fileTypeCounts[file.type] || 0) + 1;
    }
  });

  moratoriumFiles.forEach((file: any) => {
    if (hasFileTypeLabel(file.type)) {
      moratoriumFileCounts[file.type] = (moratoriumFileCounts[file.type] || 0) + 1;
    }
  });

  const displayableFiles = Object.entries(fileTypeCounts);

  if (displayableFiles.length === 0 && Object.keys(moratoriumFileCounts).length === 0) {
    return <span className="text-gray-500 text-sm">No files</span>;
  }

  const open = (fileType: string) => onOpenTab && (() => onOpenTab(fileTabKey(fileType, false)));
  return (
    <div className="flex flex-col gap-1">
      {displayableFiles.map(([fileType, count]) => {
        const moratoriumCount = moratoriumFileCounts[fileType] || 0;
        return (
          <div key={fileType} className="text-sm">
            <CountLink onClick={open(fileType)}>
              <span className="font-bold">{getFileTypeLabel(fileType)}:</span> {count}
              {moratoriumCount > 0 && <span className="text-gray-500"> ({moratoriumCount})</span>}
            </CountLink>
          </div>
        );
      })}
      {Object.entries(moratoriumFileCounts).filter(([type]) => !fileTypeCounts[type]).map(([fileType, count]) => (
        <div key={fileType} className="text-sm">
          <CountLink onClick={open(fileType)}>
            <span className="font-bold">{getFileTypeLabel(fileType)}:</span> <span className="text-gray-500">({count})</span>
          </CountLink>
        </div>
      ))}
    </div>
  );
};

// Related Files column: files inherited from ancestors or adopted from descendants.
export const RelatedFileCounts: React.FC<{ source: any; onOpenTab?: (tab: string) => void }> = ({ source, onOpenTab }) => {
  const allRelated = [
    ...(source._parentFiles || []),
    ...(source._childFiles || []),
  ].filter((f: any) => hasFileTypeLabel(f.type));

  if (allRelated.length === 0) {
    return <span className="text-gray-500 text-sm">No files</span>;
  }

  const counts: { [key: string]: number } = {};
  allRelated.forEach((f: any) => {
    counts[f.type] = (counts[f.type] || 0) + 1;
  });

  return (
    <div className="flex flex-col gap-1">
      {Object.entries(counts).map(([fileType, count]) => (
        <div key={fileType} className="text-sm">
          <CountLink onClick={onOpenTab && (() => onOpenTab(fileTabKey(fileType, true)))}>
            <span className="font-bold">{getFileTypeLabel(fileType)}:</span> {count}
          </CountLink>
        </div>
      ))}
    </div>
  );
};
