import React from "react";
import { renderToString } from 'react-dom/server';
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { components } from "./md-components";

export const mdToString = (props, defaultLabel = "Item", field = "body") => {
  let label = defaultLabel;
  try {
    if (props?.[field]) {
      const mdString = renderToString(
        <TinaMarkdown components={components} content={props[field]} />
      ).replace(/<\/?[^>]+(>|$)/g, "");
      if (mdString.length > 100)
        label = mdString.slice(0, 100) + '...';
      else if (mdString.length > 0)
        label = mdString;
    }
  } catch (e) {
    console.error(e);
  }
  return { label };
}
