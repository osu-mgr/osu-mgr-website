import React from "react";
import { Icon } from "../util/icon";

// Data-quality annotations written by the pipeline (osu_mgr_pipeline.py):
//   _errors   – e.g. "Not in any metadata sheet (created from file …)",
//               "Depth Top is missing or invalid"
//   _warnings – reserved; not populated by the pipeline yet
// Prod deployments never return records with _errors (see
// pages/api/opensearch.ts guardQuery), so these mostly show on dev.

const asList = (v: any): string[] =>
  Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.length > 0) : [];

export const getDataIssues = (doc: any) => ({
  errors: asList(doc?._errors),
  warnings: asList(doc?._warnings),
});

/** Compact red/yellow count badges for result rows (sits next to Moratorium / R2R). */
export const DataIssueBadges: React.FC<{ doc: any }> = ({ doc }) => {
  const { errors, warnings } = getDataIssues(doc);
  if (errors.length === 0 && warnings.length === 0) return null;
  return (
    <div className="mt-1 flex flex-row flex-wrap gap-1">
      {errors.length > 0 && (
        <span
          className="badge badge-error gap-1"
          title={errors.join('\n')}
        >
          <Icon name="BiErrorCircle" size="xxs" />
          {errors.length} {errors.length === 1 ? 'error' : 'errors'}
        </span>
      )}
      {warnings.length > 0 && (
        <span
          className="badge badge-warning gap-1"
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
  if (errors.length === 0 && warnings.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 mb-4">
      {errors.length > 0 && (
        <div className="alert alert-error py-2 px-3 items-start">
          <Icon name="BiErrorCircle" size="sm" />
          <div className="text-sm">
            <div className="font-semibold">
              {errors.length} {errors.length === 1 ? 'error' : 'errors'}
            </div>
            <ul className="list-disc list-inside m-0 break-words">
              {errors.map((message, idx) => <li key={idx}>{message}</li>)}
            </ul>
          </div>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="alert alert-warning py-2 px-3 items-start">
          <Icon name="BiError" size="sm" />
          <div className="text-sm">
            <div className="font-semibold">
              {warnings.length} {warnings.length === 1 ? 'warning' : 'warnings'}
            </div>
            <ul className="list-disc list-inside m-0 break-words">
              {warnings.map((message, idx) => <li key={idx}>{message}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
