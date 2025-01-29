import React from "react";
import { mdToString } from "../util/md-to-string";
import { Container } from "../util/container";
import { Section } from "../util/section";
import { tinaField } from 'tinacms/dist/react'
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { components, templates } from "../util/md-components";

export const Content = ({ data }) => {
  return (
    <Section color={data.color}>
      <Container
        className={`my-4 ${
          data.color === "primary" ? `text-2xl font-bold text-center` : 'prose'
        } ${
          data.top_padding || 'pt-0'
        } ${
          data.bottom_padding || 'pb-0'
        }`}
        width="medium"
      >
        <div className="min-h-4" data-tina-field={tinaField(data, 'body')}>
          <TinaMarkdown components={components} content={data.body} />
          <div className="clear-both"></div>
        </div>
      </Container>
    </Section>
  );
};

export const contentBlockSchema = {
  name: "content",
  label: "Content",
  ui: {
    itemProps: (props) => mdToString(props, "Content"),
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
      type: "rich-text",
      label: "Body",
      name: "body",
      templates,
    },
  ],
};
