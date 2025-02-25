import React from "react";
import { Section } from "../util/section";
import { Container } from "../util/container";
import { tinaField } from 'tinacms/dist/react'

export const IFrame = ({ data }) => {
  return (
    <Section color="default">
      <Container
        className="my-4"
        width="medium"
      >
        <div className="min-h-4" data-tina-field={tinaField(data, 'source')}>
          <iframe
            src={data.source}
            style={{width: "100%", height: data.height || 'auto'}} />
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
      type: "string",
      label: "CSS Styles",
      name: "style",
    },
    {
      type: "number",
      label: "Height in Pixels",
      name: "height",
    }
  ],
};
