import React from "react";
import { tinaField } from 'tinacms/dist/react'
import { Section } from "../util/section";
import { Container } from "../util/container";
import { mdToString } from "../util/md-to-string";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { components, templates } from "../util/md-components";

export const Table = ({ data }) => {
  const rowColor = {
    default: "text-gray-800 bg-white",
    tint: "text-gray-900 bg-gray-100",
    primary: "text-white bg-primary",
  };

  return (
    <Section color={data.color}>
      <Container
        className="justify-center overflow-x-auto text-gray-900"
        width="medium"
      >
        <table className={`table ${
          data.full_width ? 'w-full' : 'w-auto'
        }`}>
          <thead>
            <tr>
              {
                data.column_headers?.map((header, i) =>
                  <td key={i} data-tina-field={tinaField(header)}>
                    <TinaMarkdown components={components} content={header.body} />
                  </td>
                )
              }
            </tr>
          </thead>
          <tbody>
            {
              data.rows?.map((row, i) =>
                <tr key={i} className="">
                  {row.columns?.map((column, j) =>
                    <td key={j} data-tina-field={tinaField(column)} className={`whitespace-normal prose ${rowColor[row.color]}`}>
                      <TinaMarkdown components={components} content={column.body} />
                    </td>
                  )}
                </tr>
              )
            }
          </tbody>
        </table>
      </Container>
    </Section>
  );
};

export const tableBlockSchema = {
  name: "table",
  label: "Table",
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
      type: "boolean",
      label: "Full Width",
      name: "full_width",
    },
    {
      type: "object",
      label: "Column Headers",
      name: "column_headers",
      list: true,
      ui: {
        itemProps: (props) => mdToString(props, "Column Headers"),
      },
      fields: [
        {
          type: "rich-text",
          label: "Body",
          name: "body",
          templates
        },
      ],
    },
    {
      type: "object",
      label: "Rows",
      name: "rows",
      list: true,
      fields: [
        {
          type: "object",
          label: "Columns",
          name: "columns",
          list: true,
          ui: {
            itemProps: (props) => mdToString(props, "Columns"),
          },
          fields: [
            {
              type: "rich-text",
              label: "Body",
              name: "body",
              templates
            },
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
        }
      ],
    },
  ],
};
