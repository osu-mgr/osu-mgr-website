import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Section } from "../util/section";
import { Container } from "../util/container";
import { tinaField } from 'tinacms/dist/react'

const slugify = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const IFrame = ({ data }) => {
  const router = useRouter();

  // Toggleable sources take precedence; fall back to the single legacy source.
  const sources = (data.sources || [])
    .filter((s) => s?.source)
    .map((s, idx) => ({ ...s, slug: slugify(s.name || `source-${idx + 1}`), idx }));
  const [activeIndex, setActiveIndex] = useState(0);
  // Sources are mounted on first view and kept alive so toggling back doesn't reload the map.
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));

  const select = (idx: number) => {
    setActiveIndex(idx);
    setLoaded((prev) => (prev.has(idx) ? prev : new Set(prev).add(idx)));
  };

  // Deep link to a source by its slugified name, e.g. /map#antarctic-cores.
  useEffect(() => {
    if (sources.length < 2) return;
    const selectFromHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
      const match = sources.find((s) => s.slug === hash);
      if (match) select(match.idx);
    };
    selectFromHash();
    window.addEventListener('hashchange', selectFromHash);
    router.events.on('hashChangeComplete', selectFromHash);
    return () => {
      window.removeEventListener('hashchange', selectFromHash);
      router.events.off('hashChangeComplete', selectFromHash);
    };
  }, [sources.map((s) => s.slug).join('|')]);

  const onToggle = (idx: number) => {
    select(idx);
    window.history.replaceState(window.history.state, '', `#${sources[idx].slug}`);
  };

  let height = 'auto';
  if (data.height && !isNaN(data.height)) {
    height = `${data.height}px`;
  }
  if (data.fullscreen) {
    height = '50vw';
  }

  if (sources.length === 0) {
    return (
      <Section color="default">
        <Container
          className="min-h-4"
          style={data.fullscreen ? { padding: 0 } : {}}
          width={data.fullscreen ? "custom" : "medium"}
          data-tina-field={tinaField(data, 'source')}
        >
          <div className="min-h-4">
            <iframe
              src={data.source}
              style={{ width: "100%", height: height }} />
          </div>
        </Container>
      </Section>
    );
  }

  const safeActiveIndex = Math.min(activeIndex, sources.length - 1);

  return (
    <Section color="default">
      <Container
        className="min-h-4"
        style={data.fullscreen ? { padding: 0 } : {}}
        width={data.fullscreen ? "custom" : "medium"}
        data-tina-field={tinaField(data, 'sources')}
      >
        {sources.length > 1 && (
          <div className="tabs tabs-bordered overflow-x-auto no-scrollbar" role="tablist">
            {sources.map((s) => (
              <button
                key={s.idx}
                type="button"
                role="tab"
                aria-selected={safeActiveIndex === s.idx}
                className={`tab tab-lg tab-bordered border-b-4 px-4 whitespace-nowrap ${safeActiveIndex === s.idx ? 'tab-active !border-primary text-primary' : ''}`}
                onClick={() => onToggle(s.idx)}
                data-tina-field={tinaField(data.sources[s.idx], 'name')}
              >
                {s.name || `Map ${s.idx + 1}`}
              </button>
            ))}
            <div className="tab tab-lg tab-bordered border-b-4 px-4 flex-grow" />
          </div>
        )}
        <div className="min-h-4 relative" style={{ height: height === 'auto' ? '50vw' : height }}>
          {sources.map((s) => (loaded.has(s.idx) || s.idx === safeActiveIndex) && (
            <iframe
              key={s.idx}
              src={s.source}
              title={s.name || undefined}
              // visibility (not display:none) keeps hidden maps sized so they render correctly when shown
              className={`absolute inset-0 ${s.idx === safeActiveIndex ? 'visible' : 'invisible'}`}
              style={{ width: "100%", height: "100%" }} />
          ))}
        </div>
      </Container>
    </Section>
  );
};

export const iframeBlockSchema = {
  name: "iframe",
  label: "IFrame",
  fields: [
    {
      type: "string",
      label: "HTML Source",
      name: "source",
      description: "Single source. Ignored when Toggleable Sources are set.",
    },
    {
      type: "object",
      label: "Toggleable Sources",
      name: "sources",
      list: true,
      description: "Shown as tabs above the frame. Link to one with #name-in-lowercase-dashes, e.g. /map#antarctic-cores.",
      ui: {
        itemProps: (item) => {
          return {
            label: item?.name,
          };
        },
      },
      fields: [
        {
          type: "string",
          label: "Name",
          name: "name",
        },
        {
          type: "string",
          label: "HTML Source",
          name: "source",
        },
      ],
    },
    {
      type: "boolean",
      label: "Full Screen",
      name: "fullscreen",
    },
    {
      type: "number",
      label: "Height in Pixels",
      name: "height",
    }
  ],
};
