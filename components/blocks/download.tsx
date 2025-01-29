import Link from "next/link";
import React from "react";
import { Container } from "../util/container";
import { Section } from "../util/section";
import { tinaField } from 'tinacms/dist/react'
import { FileUpload } from '../fields/file-upload';
import { BiSolidDownload } from "react-icons/bi";  

export const Download = ({ data }) => {
  return (
    <Section color={data.color} 
        data-tina-field={tinaField(data, 'color')}>
      {<Container
        width="medium"
        className={"grid justify-items-center"}
      >
        <Link href={data.src} download>
          <button
            data-tina-field={tinaField(data, 'src')}
            className="btn btn-primary btn-lg rounded-lg"
          >
            {data.icon && (
              <BiSolidDownload
                className={`mr-1 -ml-1 w-6 h-6 opacity-80`}
              />
            )}
            {data.label}
          </button>
        </Link>
      </Container>}
    </Section>
  );
};

export const downloadBlockSchema = {
  name: "download",
  label: "File Download",
  ui: {
    itemProps: (props) => {
      if (props?.label.length > 100)
        return props?.label.slice(0, 100) + '...';
      else if (props?.label.length > 0)
        return props?.label;
      return "File Download";
    }
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
      label: "File",
      name: "src",
      component: FileUpload,
      uploadDir: () => '/downloads/',
      ui: {
        parse: (media) =>
          `/uploads/downloads/${media.filename}`,
      }
    },
    {
      label: "Label",
      name: "label",
      type: "string",
    },
    {
      label: "Icon",
      name: "icon",
      type: "boolean",
    },
  ],
};