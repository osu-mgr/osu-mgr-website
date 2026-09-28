import React from "react";
import { Section } from "../util/section";
import { Container } from "../util/container";
import { tinaField } from 'tinacms/dist/react'

export const IFrame = ({ data }) => {
  let height = 'auto';
  if (data.height && !isNaN(data.height)) {
    height = `${data.height}px`;
  }
  if (data.fullscreen) {
    height = '50vw';
  }
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
};

export const iframeBlockSchema = {
  name: "iframe",
  label: "IFrame",
  fields: [
    {
      type: "string",
      label: "HTML Source",
      name: "source",
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
