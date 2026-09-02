import React from "react";
import { Icon } from "../util/icon";

// Data-quality annotations written by the pipeline (osu_mgr_pipeline.py):
//   _errors   – e.g. "Not in any metadata sheet (created from file …)",
//               "Depth Top is missing or invalid"
//   _warnings – reserved; not populated by the pipeline yet
// Prod deployments never return records with _errors (see
// pages/api/opensearch.ts guardQuery), so these mostly show on dev.

// Curator-facing annotations are only rendered off prod. Prod never returns
// records with _errors anyway (guardQuery); records with _warnings stay
// visible there but without badges.
const SHOW_DATA_ISSUES = process.env.NEXT_PUBLIC_TINA_BRANCH !== 'prod';

const asList = (v: any): string[] =>
  Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.length > 0) : [];

export const getDataIssues = (doc: any) => ({
  errors: asList(doc?._errors),
  warnings: asList(doc?._warnings),
});

/** Compact red/yellow count badges for result rows (sits next to Moratorium / R2R). */
export const DataIssueBadges: React.FC<{ doc: any; className?: string }> = ({ doc, className = 'mt-1' }) => {
  const { errors, warnings } = getDataIssues(doc);
  if (!SHOW_DATA_ISSUES || (errors.length === 0 && warnings.length === 0)) return null;
  return (
    <div className={`${className} flex flex-row flex-wrap gap-1`}>
      {errors.length > 0 && (
        <span
          className="badge badge-error badge-tag gap-1"
          title={errors.join('\n')}
        >
          <Icon name="BiErrorCircle" size="xxs" />
          {errors.length} {errors.length === 1 ? 'error' : 'errors'}
        </span>
      )}
      {warnings.length > 0 && (
        <span
          className="badge badge-warning badge-tag gap-1"
          title={warnings.join('\n')}
        >
          <Icon name="BiError" size="xxs" />
          {warnings.length} {warnings.length === 1 ? 'warning' : 'warnings'}
        </span>
      )}
    </div>
  );
};

/** Full messages, for the record modal / landing page. */
export const DataIssuesPanel: React.FC<{ doc: any }> = ({ doc }) => {
  const { errors, warnings } = getDataIssues(doc);
  if (!SHOW_DATA_ISSUES || (errors.length === 0 && warnings.length === 0)) return null;
  return (
    <div className="flex flex-col gap-2 mb-4">
      {errors.length > 0 && (
        <div className="alert alert-error py-2 px-3 !grid-flow-col !grid-cols-[auto_1fr] !justify-items-start !text-left items-start">
          <Icon name="BiErrorCircle" size="sm" className="mt-0.5" />
          <div className="text-sm w-full min-w-0">
            <div className="font-semibold">
              {errors.length} {errors.length === 1 ? 'error' : 'errors'}
            </div>
            <ul className="list-disc pl-5 m-0 mt-1 break-words [&>li]:m-0 [&>li]:pl-0">
              {errors.map((message, idx) => <li key={idx}>{message}</li>)}
            </ul>
          </div>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="alert alert-warning py-2 px-3 !grid-flow-col !grid-cols-[auto_1fr] !justify-items-start !text-left items-start">
          <Icon name="BiError" size="sm" className="mt-0.5" />
          <div className="text-sm w-full min-w-0">
            <div className="font-semibold">
              {warnings.length} {warnings.length === 1 ? 'warning' : 'warnings'}
            </div>
            <ul className="list-disc pl-5 m-0 mt-1 break-words [&>li]:m-0 [&>li]:pl-0">
              {warnings.map((message, idx) => <li key={idx}>{message}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
