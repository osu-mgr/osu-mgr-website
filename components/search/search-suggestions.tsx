import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Icon } from '../util/icon';

// Recent searches live only in this browser. Each entry keeps when it was last run
// so the dropdown can show how recent it is and order by recency.
const RECENT_KEY = 'search-recent-v1';
const MAX_RECENT = 10;

type Recent = { text: string; at: number };
type Item =
  | { kind: 'recent'; text: string; at: number }
  | { kind: 'id'; text: string; docType: string }
  | { kind: 'rv'; text: string; count: number }
  | { kind: 'pub'; text: string; citation: string };

const DOC_TYPE_LABELS: Record<string, string> = {
  cruise: 'Cruise', core: 'Core', section: 'Section', sectionHalf: 'Section Half',
  coreSample: 'Core Sample', dive: 'Dive', diveSample: 'Dive Sample',
  diveSubsample: 'Dive Subsample', file: 'File', location: 'Location',
};

function readRecent(): Recent[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(r => r && typeof r.text === 'string' && typeof r.at === 'number') : [];
  } catch {
    return [];
  }
}

function writeRecent(recent: Recent[]) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch {
    // Storage full or blocked: recents are a convenience, so ignore.
  }
}

function timeAgo(at: number, now: number): string {
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr${h === 1 ? '' : 's'} ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} day${d === 1 ? '' : 's'} ago`;
  if (d < 30) { const w = Math.round(d / 7); return `${w} week${w === 1 ? '' : 's'} ago`; }
  return new Date(at).toLocaleDateString();
}

export const SearchInputWithSuggestions: React.FC<{
  value: string;
  onChange: (value: string) => void;
  // Run the search now (no debounce), e.g. on Enter or picking a suggestion.
  onCommit: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, onCommit, placeholder, className }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<Recent[]>([]);
  const [debounced, setDebounced] = useState(value);
  const [now, setNow] = useState(() => Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setRecent(readRecent()); }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value.trim()), 200);
    return () => clearTimeout(t);
  }, [value]);

  const { data: suggestions } = useQuery({
    queryKey: ['search-suggest', debounced],
    queryFn: async () => {
      const res = await fetch('/api/opensearch?suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchString: debounced }),
      });
      return res.json();
    },
    enabled: open && debounced.length >= 2,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  const remember = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const lower = t.toLowerCase();
    const next = [{ text: t, at: Date.now() }, ...readRecent().filter(r => r.text.toLowerCase() !== lower)].slice(0, MAX_RECENT);
    writeRecent(next);
    setRecent(next);
  };

  const forget = (text: string) => {
    const next = readRecent().filter(r => r.text !== text);
    writeRecent(next);
    setRecent(next);
  };

  const items: Item[] = useMemo(() => {
    const q = value.trim().toLowerCase();
    const recentItems: Item[] = recent
      .filter(r => !q || (r.text.toLowerCase().includes(q) && r.text.toLowerCase() !== q))
      .slice(0, q ? 4 : MAX_RECENT)
      .map(r => ({ kind: 'recent', text: r.text, at: r.at }));
    if (q.length < 2 || !suggestions || debounced.toLowerCase() !== q) return recentItems;
    const s: any = suggestions;
    return [
      ...recentItems,
      ...(s.ids || []).map((i: any) => ({ kind: 'id', text: i.osuid, docType: i.docType })),
      ...(s.rvNames || []).map((r: any) => ({ kind: 'rv', text: r.name, count: r.count })),
      ...(s.publications || []).map((p: any) => ({ kind: 'pub', text: p.doi, citation: p.citation })),
    ];
  }, [value, recent, suggestions, debounced]);

  useEffect(() => { setActive(-1); }, [value]);

  const choose = (text: string) => {
    onChange(text);
    onCommit(text);
    remember(text);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive(a => Math.min(items.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(-1, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && active >= 0 && items[active]) choose(items[active].text);
      else choose(value);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showDropdown = open && items.length > 0;
  let lastKind: Item['kind'] | null = null;
  const headings: Record<Item['kind'], string> = { recent: 'Recent searches', id: 'OSU IDs', rv: 'Research vessels', pub: 'Publications' };

  return (
    <div className={`relative ${className || ''}`}>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        placeholder={placeholder}
        className="input input-bordered w-full rounded-r-none"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => { setNow(Date.now()); setRecent(readRecent()); setOpen(true); }}
        // Remember what was typed when leaving the box, e.g. to click a result.
        onBlur={() => { setOpen(false); remember(value); }}
        onKeyDown={onKeyDown}
      />
      {showDropdown && (
        <ul role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[60vh] overflow-y-auto bg-base-100 border border-base-300 rounded-box shadow-lg list-none p-1 m-0 not-prose text-sm"
          // Keep focus in the input so blur does not close the list before a click lands.
          onMouseDown={e => e.preventDefault()}>
          {items.map((item, idx) => {
            const heading = item.kind !== lastKind ? headings[item.kind] : null;
            lastKind = item.kind;
            return (
              <React.Fragment key={`${item.kind}-${item.text}`}>
                {heading && <li className="px-3 pt-2 pb-1 text-xs font-semibold uppercase opacity-60">{heading}</li>}
                <li role="option" aria-selected={idx === active}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer ${idx === active ? 'bg-base-200' : 'hover:bg-base-200'}`}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => choose(item.text)}>
                  {item.kind === 'recent' && <>
                    <Icon name="BiHistory" size="xxs" className="opacity-60 flex-shrink-0" />
                    <div className="flex-grow truncate">{item.text}</div>
                    <div className="text-xs opacity-60 whitespace-nowrap">{timeAgo(item.at, now)}</div>
                    <button type="button" className="btn btn-ghost btn-xs btn-circle" title="Remove from recent searches"
                      onClick={e => { e.stopPropagation(); forget(item.text); }}>
                      <Icon name="BiX" size="xxs" />
                    </button>
                  </>}
                  {item.kind === 'id' && <>
                    <Icon name="BiSearch" size="xxs" className="opacity-60 flex-shrink-0" />
                    <div className="flex-grow truncate">{item.text}</div>
                    <div className="text-xs opacity-60">{DOC_TYPE_LABELS[item.docType] || item.docType}</div>
                  </>}
                  {item.kind === 'rv' && <>
                    <Icon name="BiSearch" size="xxs" className="opacity-60 flex-shrink-0" />
                    <div className="flex-grow truncate">{item.text}</div>
                    <div className="text-xs opacity-60">{item.count.toLocaleString()} records</div>
                  </>}
                  {item.kind === 'pub' && <>
                    <Icon name="BiBookOpen" size="xxs" className="opacity-60 flex-shrink-0 self-start mt-0.5" />
                    <div className="flex-grow min-w-0">
                      <div className="line-clamp-2">{item.citation}</div>
                      <div className="text-xs opacity-60 truncate">doi:{item.text}</div>
                    </div>
                  </>}
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      )}
    </div>
  );
};
