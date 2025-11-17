import React from "react";
import { mdToString } from "../util/md-to-string";
import { Icon } from "../util/icon";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { tinaField } from 'tinacms/dist/react'
import { components, templates } from "../util/md-components";

export const Modal = ({ data }) => {
  const [showModal, setShowModal] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState(0);

  const safeActiveIndex = Math.min(activeTab, data.tabs?.length - 1);
  const activeTabData = data.tabs?.[safeActiveIndex] || { title: '', text: '' };

  if (!showModal) { return null; }
  
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-6xl w-11/12 h-[80vh] flex flex-col p-0">
          <div className="flex-shrink-0  min-w-0">
            <div className="tabs tabs-bordered overflow-x-auto no-scrollbar" role="tablist">
              {data.tabs?.map((tab, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={safeActiveIndex === idx}
                  className={`tab tab-lg tab-bordered border-b-4 px-4 ${safeActiveIndex === idx ? 'tab-active !border-primary text-primary' : ''}`}
                  onClick={() => setActiveTab(idx)}
                  data-tina-field={tinaField(data.tabs[idx].title)}
                  title={(tab?.title || `Tab ${idx + 1}`) as string}
                >
                  {tab?.title || `Tab ${idx + 1}`}
                </button>
              ))}
              <div className="tab tab-lg tab-bordered border-b-4 px-4 flex-grow" />
              <button 
                className="tab tab-lg tab-bordered border-b-4"
                onClick={() => setShowModal(false)}
              >
                <Icon name="BiX" size="small" />
              </button>
            </div>
        </div>
        <div className="flex-1 overflow-y-scroll overflow-x-hidden prose max-w-full" style={{ scrollbarGutter: 'stable' }}>
          <div className="p-6" data-tina-field={tinaField(activeTabData.text)}>
            <TinaMarkdown components={components} content={activeTabData.text} />
          </div>
        </div>
      </div>
      <div 
        className="modal-backdrop"
        onClick={() => setShowModal(false)}
      ></div>
    </div>
  );
};

export const modalBlockSchema = {
  name: "modal",
  label: "Modal",
  ui: {
    itemProps: (props) => mdToString(props, "Modal"),
  },
  fields: [
    {
      type: "object",
      label: "Tabbed Content",
      name: "tabs",
      list: true,
      ui: {
        itemProps: (item) => {
          return {
            label: item?.title,
          };
        },
      },
      fields: [
        {
          type: "string",
          label: "Title",
          name: "title",
        },
        {
          type: "rich-text",
          label: "Text",
          name: "text",
          templates
        },
      ],
    },
  ],
};
