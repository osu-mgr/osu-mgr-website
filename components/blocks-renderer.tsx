import React from "react";
import type { Page } from "../tina/__generated__/types";
import { Content } from "./blocks/content";
import { Features } from "./blocks/features";
import { Hero } from "./blocks/hero";
import { Table } from "./blocks/table";
import { Download } from "./blocks/download";
import { IFrame } from "./blocks/iframe";
import { Search } from "./blocks/search";
import { LandingPage } from "./blocks/landing-page";

const pageBlock = (key, block: React.JSX.Element) =>
  <div key={key}>
    {block}
  </div>;

export const Blocks = (props: Omit<Page, "id" | "_sys" | "_values">) => {
  return (
    <>
      {props.blocks
        ? props.blocks.map(function (block, i) {
            switch (block.__typename) {
              case "PageBlocksContent":
                return pageBlock(i + block.__typename, <Content data={block} />);
              case "PageBlocksHero":
                return pageBlock(i + block.__typename, <Hero data={block} />);
              case "PageBlocksFeatures":
                return pageBlock(i + block.__typename, <Features data={block} />);
              case "PageBlocksTable":
                return pageBlock(i + block.__typename, <Table data={block} />);
              case "PageBlocksDownload":
                return pageBlock(i + block.__typename, <Download data={block} />);
              case "PageBlocksIframe":
                return pageBlock(i + block.__typename, <IFrame data={block} />);
              case "PageBlocksSearch":
                return pageBlock(i + block.__typename, <Search data={block} />);
              case "PageBlocksLandingPage":
                return pageBlock(i + block.__typename, <LandingPage data={block} />);
              default:
                return null;
            }
          })
        : null}
    </>
  );
};
