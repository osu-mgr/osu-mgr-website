import React from "react";
import { Actions, actionsSchema } from "../util/actions";
import { Section } from "../util/section";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { tinaField } from 'tinacms/dist/react'
import { components, templates } from "../util/md-components";

export const Hero: React.FC<{ data: any }> = ({ data }) => {

  return (
    <Section color={data.color}>
      <div
        data-tina-field={tinaField(data, 'bg_image')}
        className="relative overflow-hidden bg-no-repeat bg-cover h-[32rem]"
        style={data.bg_image && {
          backgroundPosition: "50%",
          backgroundImage: `url(${data.bg_image.src})`
        } || {}}
      >
        <div
          className="absolute top-0 right-0 bottom-0 left-0 w-full h-[32rem] overflow-hidden bg-fixed"
          style={{backgroundColor: "rgba(0, 0, 0, 0.5)"}}
        >
          {data.bg_video && (
            <>
              <video
                data-tina-field={tinaField(data, 'bg_video')}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-[32rem] object-cover object-center"
                src={data.bg_video.src}
              />
              <div className="relative w-full h-[32rem] -mt-[32rem] bg-black opacity-50"></div>
            </>
          )}
          <div className={`relative w-full flex justify-center items-center h-[32rem] ${data.bg_video && "-mt-[32rem]" || ""}`}>
            <div className="text-center text-white p-12">
              <h1 data-tina-field={tinaField(data, 'headline')} className="text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight m-3">
                <TinaMarkdown components={components} content={data.headline} />
              </h1>
              {data.actions && (
                <Actions
                  className="justify-center py-2"
                  actions={data.actions}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export const heroBlockSchema = {
  name: "hero",
  label: "Hero",
  ui: {
    defaultItem: {
      tagline: "Here's some text above the other text",
      headline: "This Big Text is Totally Awesome",
      text: "Phasellus scelerisque, libero eu finibus rutrum, risus risus accumsan libero, nec molestie urna dui a leo.",
    },
  },
  fields: [
    {
      type: "object",
      label: "Background Image",
      name: "bg_image",
      fields: [
        {
          name: "src",
          label: "Image Source",
          type: "image",
        },
        {
          name: "alt",
          label: "Alt Text",
          type: "string",
        },
      ],
    },
    {
      type: "object",
      label: "Background Video",
      name: "bg_video",
      fields: [
        {
          name: "src",
          label: "Video Source",
          type: "image",
        }
      ],
    },
    {
      label: "Headline",
      name: "headline",
      type: "rich-text",
      templates
    },
    actionsSchema
  ],
};
