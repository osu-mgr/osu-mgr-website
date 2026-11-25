import React from "react";
import { Icon } from "../util/icon";

// Registered IGSNs written by the pipeline (osu_mgr_pipeline.py igsnLinks) from
// the curators' "IGSN pairs" sheet plus the metadata sheets' IGSN / Alternate
// IGSN columns. Each one resolves at doi.org. They sit on the exact record they
// belong to (not inherited), unlike r2rLinks — except that an ARF half-round
// IGSN (one half of the WHOLE core; OSU-MGR has no core-half records) is shown
// on the core and on each of its A (archive) / W (working) section halves.
export type IgsnLink = {
  igsn: string;
  url: string;
  registry: 'OSU-MGR' | 'SESAR' | 'SESAR ARF' | 'SESAR CDR' | 'Other' | string;
  sampleType?: string;
  part?: 'archive half' | 'working half' | 'sub-piece' | '';
  interval?: string; // sub-pieces, e.g. "20-21 cm"
  source?: string;
};

export const getIgsnLinks = (doc: any): IgsnLink[] =>
  Array.isArray(doc?.igsnLinks) ? doc.igsnLinks.filter((l: any) => l?.igsn && l?.url) : [];

const isSubPiece = (link: IgsnLink) => link.part === 'sub-piece';

// "IGSN" for identifiers in the OSU-MGR namespaces; the legacy Antarctic (ARF)
// and CSDCO-registered ones say where they come from.
export const igsnLabel = (link: IgsnLink): string =>
  link.registry === 'SESAR ARF' ? 'IGSN (ARF)' : link.registry === 'SESAR CDR' ? 'IGSN (CSDCO)' : 'IGSN';

// What the IGSN identifies, relative to the record it is shown on.
export const igsnDescription = (link: IgsnLink, docType?: string): string => {
  if (link.part === 'archive half' || link.part === 'working half') {
    return docType === 'core' ? link.part : `${link.part} of the whole core`;
  }
  if (isSubPiece(link)) return link.interval ? `sub-piece, ${link.interval}` : 'sub-piece';
  return link.sampleType || '';
};

const MAX_BADGES = 3;

/** Compact IGSN link badges for result rows (same style as the R2R badges).
 *  Sub-pieces only count towards "+N more"; the Details tab lists them. */
export const IgsnBadges: React.FC<{ doc: any; onMore?: () => void; className?: string }> = ({ doc, onMore, className = 'mt-1' }) => {
  const links = getIgsnLinks(doc);
  if (links.length === 0) return null;
  const shown = links.filter((l) => !isSubPiece(l)).slice(0, MAX_BADGES);
  const extra = links.length - shown.length;
  return (
    <div className={`${className} flex flex-row flex-wrap gap-1`}>
      {shown.map((link) => (
        <a
          key={link.igsn}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title={[igsnLabel(link), link.igsn, igsnDescription(link, doc?._docType)].filter(Boolean).join(' · ')}
          className="badge badge-ghost badge-tag hover:badge-ghost no-underline flex items-center gap-1"
        >
          IGSN
          <Icon name="BiLinkExternal" size="xxs" />
          <span className="font-normal">{link.igsn}</span>
        </a>
      ))}
      {extra > 0 && (
        <span
          className={`badge badge-ghost badge-tag font-normal${onMore ? ' cursor-pointer' : ''}`}
          onClick={onMore ? (e) => { e.stopPropagation(); onMore(); } : undefined}
          title={`${extra} more IGSN${extra === 1 ? '' : 's'}; see Details`}
        >
          {shown.length === 0 ? `${extra} IGSN${extra === 1 ? '' : 's'}` : `+${extra} more`}
        </span>
      )}
    </div>
  );
};

const IgsnAnchor: React.FC<{ link: IgsnLink; text: string }> = ({ link, text }) => (
  <a href={link.url} target="_blank" rel="noopener noreferrer" className="no-underline font-normal hover:underline">
    {text}
  </a>
);

/** List items for the landing page's External Links block. */
export const IgsnLinkItems: React.FC<{ doc: any }> = ({ doc }) => {
  const links = getIgsnLinks(doc);
  const subPieces = links.filter(isSubPiece);
  return (
    <>
      {links.filter((l) => !isSubPiece(l)).map((link) => {
        const description = igsnDescription(link, doc?._docType);
        return (
          <li key={link.igsn} className="m-0">
            <IgsnAnchor link={link} text={`${igsnLabel(link)}: ${link.igsn}`} />
            {description && <span className="text-base-content/60"> · {description}</span>}
          </li>
        );
      })}
      {subPieces.length > 0 && (
        <li className="m-0">
          <details>
            <summary className="cursor-pointer">
              IGSN (ARF): {subPieces.length} sub-piece{subPieces.length === 1 ? '' : 's'} (slices taken from this core)
            </summary>
            <ul className="m-0 mt-1 pl-5 columns-2 md:columns-3">
              {subPieces.map((link) => (
                <li key={link.igsn} className="m-0">
                  <IgsnAnchor link={link} text={link.interval ? `${link.interval}: ${link.igsn}` : link.igsn} />
                </li>
              ))}
            </ul>
          </details>
        </li>
      )}
    </>
  );
};
