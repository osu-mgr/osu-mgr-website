import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import numeral from 'numeral';
import { useQueries } from '@tanstack/react-query';
import { Icon } from '../util/icon';

// A search filter set from a value in the record modal's Details tab: the
// filter key in search.filters (rvNames, institutions, ...) and the value.
export type DetailFilter = { key: string; value: string; label: string };
export type OnDetailFilter = (filter: DetailFilter, type: string) => void;

// The search tabs, in tab order.
const TABS = [
  { type: 'cruise', label: 'Cruises' },
  { type: 'core', label: 'Cores' },
  { type: 'section', label: 'Sections' },
  { type: 'dive', label: 'Dredges/Dives' },
  { type: 'diveSample', label: 'Rocks' },
];
const TAB_FOR_DOC_TYPE: Record<string, string> = {
  cruise: 'cruise', core: 'core', section: 'section', sectionHalf: 'section', coreSample: 'section',
  dive: 'dive', diveSample: 'diveSample', diveSubsample: 'diveSample',
};

const POPOVER_WIDTH = 256;

// Filter icon next to a Details value. Hovering (or focusing) it shows how many
// records of each type the search with just this filter finds; picking a type,
// or clicking the icon for the record's own type, runs that search.
export const DetailFilterButton: React.FC<{ filter: DetailFilter; docType: string; onFilter: OnDetailFilter }> = ({ filter, docType, onFilter }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const [position, setPosition] = useState<{ left: number; top?: number; bottom?: number } | null>(null);
  const isOpen = position !== null;

  // Counts are only fetched once the popover has been opened.
  const counts = useQueries({
    queries: TABS.map(({ type }) => ({
      queryKey: ['detailFilterCount', filter.key, filter.value, type],
      enabled: isOpen,
      staleTime: 5 * 60 * 1000,
      queryFn: async () => {
        const res = await fetch('/api/opensearch?count', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ types: [type], searchString: '', filters: { [filter.key]: [filter.value] } }),
        });
        if (!res.ok) throw new Error(`Failed to count ${type} records`);
        return ((await res.json())?.count ?? 0) as number;
      },
    })),
  });
  const isLoading = counts.some(c => c.isLoading);
  const tabs = TABS.map((tab, i) => ({ ...tab, count: counts[i].data ?? 0 })).filter(tab => tab.count > 0);

  // The popover sits in a portal so the modal's scroll pane can't clip it; it
  // opens below the icon, or above when the icon is near the bottom of the window.
  const open = () => {
    clearTimeout(closeTimer.current);
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 8));
    setPosition(rect.bottom + 240 > window.innerHeight
      ? { left, bottom: window.innerHeight - rect.top + 4 }
      : { left, top: rect.bottom + 4 });
  };
  const close = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setPosition(null), 150);
  };
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  // A fixed popover would drift away from the icon when the pane scrolls.
  useEffect(() => {
    if (!isOpen) return;
    const hide = () => setPosition(null);
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => {
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, [isOpen]);

  const apply = (type: string) => {
    setPosition(null);
    onFilter(filter, type);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex align-middle ml-1 p-0.5 rounded text-gray-400 hover:text-primary hover:bg-base-200"
        aria-label={`Filter the search by ${filter.label}: ${filter.value}`}
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
        onClick={() => apply(TAB_FOR_DOC_TYPE[docType] || 'cruise')}
      >
        <Icon name="LuFilter" size="xxs" />
      </button>
      {isOpen && createPortal(
        <div
          className="fixed z-[60] bg-base-100 rounded-box shadow-lg border text-sm font-normal"
          style={{ ...position, width: POPOVER_WIDTH }}
          onMouseEnter={open}
          onMouseLeave={close}
          onClick={e => e.stopPropagation()}
        >
          <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-box">
            <div className="text-xs text-gray-500">Search by {filter.label}</div>
            <div className="font-semibold break-words">{filter.value}</div>
          </div>
          <ul className="p-1 m-0 list-none">
            {isLoading ? (
              <li className="flex items-center gap-2 px-2 py-1 text-gray-500">
                <Icon name="TbLoader2" className="w-4 h-4 animate-spin" /> Counting...
              </li>
            ) : tabs.length === 0 ? (
              <li className="px-2 py-1 text-gray-500">No matching records</li>
            ) : tabs.map(tab => (
              <li key={tab.type} className="m-0">
                <button
                  type="button"
                  className="w-full flex justify-between items-center px-2 py-1 rounded hover:bg-base-200 text-left"
                  onClick={() => apply(tab.type)}
                  onFocus={open}
                  onBlur={close}
                >
                  <span>{tab.label}</span>
                  <span className="badge badge-sm badge-outline">{numeral(tab.count).format('0,0')}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>,
        document.body,
      )}
    </>
  );
};
