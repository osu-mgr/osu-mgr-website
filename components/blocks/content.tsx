import React from "react";
import { mdToString } from "../util/md-to-string";
import { Container } from "../util/container";
import { Section } from "../util/section";
import { tinaField } from 'tinacms/dist/react'
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { components, templates } from "../util/md-components";

export const Content = ({ data }) => {
  const columns = data.body || [];
  const columnCount = columns.length || 1;

  return (
    <Section color={data.color}>
      <Container
        className={`my-4 ${
          data.top_padding || 'pt-0'
        } ${
          data.bottom_padding || 'pb-0'
        }`}
        width="medium"
      >
        <div className={`grid gap-6 ${
          columnCount === 2 ? 'md:grid-cols-2' :
          columnCount === 3 ? 'md:grid-cols-3' :
          columnCount === 4 ? 'md:grid-cols-4' :
          'grid-cols-1'
        }`}>
          {columns.map((column, index) => (
            <div
              key={index}
              className={`min-h-4 min-w-full ${
                data.color === "primary" ? `text-2xl font-bold text-center` : 'prose'
              } ${
                data.alignment === 'center' ? 'text-center' :
                data.alignment === 'right' ? 'text-right' :
                'text-left'
              }`}
              data-tina-field={tinaField(data.body[index], 'content')}
            >
              <TinaMarkdown components={components} content={column.content} />
              <div className="clear-both"></div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export const contentBlockSchema = {
  name: "content",
  label: "Content",
  ui: {
    itemProps: (props) => {
      const firstColumn = props.body?.[0]?.content;
      return mdToString({ body: firstColumn }, "Content");
    },
  },
  fields: [
    {
      type: "string",
      label: "Color",
      name: "color",
      options: [
        { label: "Default", value: "default" },
        { label: "Tint", value: "tint" },
        { label: "Primary", value: "primary" },
      ],
    },
    {
      type: "string",
      label: "Top Padding",
      name: "top_padding",
      options: [
        { label: "None", value: "pt-0" },
        { label: "Small", value: "pt-4" },
        { label: "Medium", value: "pt-6" },
        { label: "Large", value: "pt-8" },
      ],
    },
    {
      type: "string",
      label: "Bottom Padding",
      name: "bottom_padding",
      options: [
        { label: "None", value: "pb-0" },
        { label: "Small", value: "pb-4" },
        { label: "Medium", value: "pb-6" },
        { label: "Large", value: "pb-8" },
      ],
    },
    {
      type: "string",
      label: "Alignment",
      name: "alignment",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    {
      type: "object",
      label: "Columns",
      name: "body",
      list: true,
      fields: [
        {
          type: "rich-text",
          label: "Content",
          name: "content",
          templates,
        },
      ],
    },
  ],
};
