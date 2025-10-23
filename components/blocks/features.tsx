import React from "react";
import { Actions, actionsSchema } from "../util/actions";
import { Section } from "../util/section";
import { Container } from "../util/container";
import { Icon } from "../util/icon";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { tinaField } from 'tinacms/dist/react'
import { components, templates } from "../util/md-components";
import { IconPickerInput } from "../fields/icon";

export const Feature = ({ featuresColor, data }) => {
  return (
    <div
      className="flex-1 flex flex-col gap-6 items-center max-w-xl mx-auto"
      style={{ flexBasis: "16rem" }}
    >
      {data.icon && (
        <Icon
          parentColor={featuresColor}
          size="large"
          {...data.icon }
        />
      )}
      {data.title && (
        <h3
          data-tina-field={tinaField(data, 'title')}
          className="text-2xl font-semibold title-font"
        >
          {data.title}
        </h3>
      )}
      {data.text && (
        <div
          data-tina-field={tinaField(data, 'text')}
          className="text-base opacity-80 leading-relaxed"
        >
          <TinaMarkdown components={components} content={data.text || ""} />
        </div>
      )}
      {data.actions && (
        <Actions
          className="justify-center py-2"
          actions={data.actions}
        />
      )}
    </div>
  );
};

export const Features = ({ data }) => {
  return (
    <Section color={data.color}>
      <Container
        className={`m-6 flex flex-wrap gap-x-10 gap-y-8 text-left`}
        width="medium"
      >
        {data.items &&
          data.items.map(function (block, i) {
            return (
              <Feature
                featuresColor={data.color}
                key={i}
                data={block}
              />
            );
          })}
      </Container>
    </Section>
  );
};

const defaultFeature = {
  title: "Here's Another Feature",
  text: {
    type: "root",
    children: [
      {
        type: "p",
        children: [
          {
            type: "text",
            text: "This is where you might talk about the feature, if this wasn't just filler text.",
          },
        ],
      },
    ],
  },
  icon: {
    color: "",
    style: "regular",
    name: "",
  },
  actions: [
    {
      label: "Action Label",
      link: "/",
      icon: "BiRightArrowAlt"
    }
  ],
};

export const featureBlockSchema = {
  name: "features",
  label: "Features",
  ui: {
    defaultItem: {
      items: [defaultFeature, defaultFeature],
    },
  },
  fields: [
    {
      type: "object",
      label: "Feature Items",
      name: "items",
      list: true,
      ui: {
        itemProps: (item) => {
          return {
            label: item?.title,
          };
        },
        defaultItem: {
          ...defaultFeature,
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
        {
          type: "object",
          label: "Icon",
          name: "icon",
          fields: [
            {
              label: "Color",
              name: "color",
              type: "string",
              options: [
                { label: "Default", value: "" },
                { label: "Blue", value: "blue" },
                { label: "Teal", value: "teal" },
                { label: "Green", value: "green" },
                { label: "Red", value: "red" },
                { label: "Pink", value: "pink" },
                { label: "Purple", value: "purple" },
                { label: "Orange", value: "orange" },
                { label: "Yellow", value: "yellow" },
              ],
            },
            {
              label: "Style",
              name: "style",
              type: "string",
              options: [
                { label: "Regular", value: "regular" },
                { label: "Float", value: "float" },
                { label: "Circle", value: "circle" },
              ],
            },
            {
              label: "Name",
              name: "name",
              type: "string",
              ui: {
                component: IconPickerInput,
              }
            },
          ],
        },
        actionsSchema
      ],
    },
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
  ],
};
