import React from "react";
import Image from "next/image";
import { Container } from "../util/container";
import { Section } from "../util/section";
import { tinaField } from 'tinacms/dist/react'
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { components } from "../util/md-components";

export const ImageBlock = ({ data }) => {
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
        <div className={`flex ${
          data.alignment === 'center' ? 'justify-center' :
          data.alignment === 'right' ? 'justify-end' :
          'justify-start'
        }`}>
          <figure className="bg-white rounded-lg drop-shadow-lg" style={{
            width: data.width || '100%',
            float: data.float || 'none',
            marginLeft: data.float === 'right' ? '1em' : 'auto',
            marginRight: data.float === 'left' ? '1em' : 'auto',
            marginTop: 0,
            marginBottom: '1em',
          }}>
            {data.width && data.height ? (
              <div style={{
                height: data.height,
                width: data.width,
                position: 'relative',
                margin: 0,
              }}>
                <Image
                  className={`w-full m-0 object-cover ${data.showCaption ? 'rounded-tl-lg rounded-tr-lg' : 'rounded-lg'}`}
                  src={data.image}
                  fill
                  sizes={data.width + 'px'}
                  alt={data.caption ? String(data.caption) : ''}
                  data-tina-field={tinaField(data, 'image')}
                />
              </div>
            ) : (
              <Image
                className={`w-full m-0 h-auto ${data.showCaption ? 'rounded-tl-lg rounded-tr-lg' : 'rounded-lg'}`}
                src={data.image}
                width={1200}
                height={800}
                alt={data.caption ? String(data.caption) : ''}
                data-tina-field={tinaField(data, 'image')}
              />
            )}
            {data.showCaption && data.caption &&
              <figcaption
                className="px-5 py-px mt-0 text-center text-lg font-semibold"
                data-tina-field={tinaField(data, 'caption')}
              >
                <div className="-my-4">
                  <TinaMarkdown content={data.caption} components={components} />
                </div>
              </figcaption>
            }
          </figure>
        </div>
      </Container>
    </Section>
  );
};

export const imageBlockSchema = {
  name: "image",
  label: "Image",
  ui: {
    itemProps: (props) => {
      return { label: props?.caption ? 'Image: ' + String(props.caption).slice(0, 30) : 'Image' };
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
      type: "image",
      label: "Image",
      name: "image",
      required: true,
    },
    {
      type: "boolean",
      label: "Show Caption",
      name: "showCaption",
    },
    {
      type: "rich-text",
      label: "Caption",
      name: "caption",
      templates: [
        {
          name: "Subscript",
          label: "Subscript",
          inline: true,
          fields: [
            {
              type: "string",
              label: "Value",
              name: "value",
              required: true,
              isTitle: true,
            },
          ],
        },
        {
          name: "Superscript",
          label: "Superscript",
          inline: true,
          fields: [
            {
              type: "string",
              label: "Value",
              name: "value",
              required: true,
              isTitle: true,
            },
          ],
        },
        {
          name: "Anchor",
          label: "Anchor",
          inline: true,
          fields: [
            {
              type: "string",
              label: "Value",
              name: "value",
              required: true,
              isTitle: true,
            },
          ],
        },
      ],
    },
    {
      type: "string",
      label: "Hyperlink",
      name: "hyperlink",
    },
    {
      type: "number",
      label: "Width in Pixels",
      name: "width",
    },
    {
      type: "number",
      label: "Height in Pixels",
      name: "height",
    },
    {
      label: "Float",
      name: "float",
      type: "string",
      options: [
        { value: "left", label: "Left" },
        { value: "none", label: "None" },
        { value: "right", label: "Right" }
      ]
    }
  ],
};
