import React from "react";
import useScrollbarSize from 'react-scrollbar-size';
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { TinaMarkdown, TinaMarkdownContent } from "tinacms/dist/rich-text";
import { tinaField } from 'tinacms/dist/react'
import { components } from "../util/md-components";
import { mdToString } from "../util/md-to-string";
import logo from "../../public/logo.png";
import Image from "next/image";
import { Icon } from "../util/icon";
import { Container } from "../util/container";
import { BiMenu as MenuIcon, BiArrowToRight as CloseIcon } from "react-icons/bi";
import layoutData from "../../content/global/index.json";
import { Theme } from "./theme";
import { sub } from "date-fns";

export const Layout = ({ rawData = {} as any, data = layoutData, children }) => {
  const { width: scrollbarWidth } = useScrollbarSize();
  const router = useRouter();

  // If we're on an admin path, other links should also link to their admin paths
  const [prefix, setPrefix] = React.useState("");
  React.useEffect(() => {
    if (window && window.location.pathname.startsWith("/admin")) {
      setPrefix("/admin");
    }
  }, []);

  const items = data?.header?.nav?.map((item, i) => {
    let isActive = false;
    if (item.href === "" || item.href === "/")
      isActive = (router.asPath === "/home" || router.asPath === "/");
    else
      isActive = router.asPath.includes(item.href) || item.subnav?.some((subitem) => router.asPath.includes(subitem.href));
    return {
      ...item,
      isActive
    };
  });
  const activeItem = items.find((item) => item.isActive);
 
  const subItems = activeItem?.subnav?.map((subitem, j) => {
    return {
      ...subitem,
      isActive: router.asPath.includes(subitem.href)
    };
  });
  // const activeSubItem = subItems.find((subitem) => subitem.isActive);
  
  const LargeHorizontalHeader = ({ fixed = false }) => 
    <div className={`z-50 p-0 bg-neutral-900 hidden lg:block ${ fixed && "fixed"}`} style={fixed && { width: `calc(100% - ${scrollbarWidth}px)` } || { visibility: 'hidden' }}>
      <div className="navbar flex">
        <div className="relative p-4 h-28 flex-shrink-0">
          <Link href="/" className="h-20"><Image alt="Logo" src={logo} style={{ position: 'relative', height: '100%', width: '100%', inset: 0, objectFit: 'contain' }} /></Link>
        </div>
        <div className="tabs h-28 items-center flex-nowrap overflow-clip">
          {items.map((item, i) => 
            <Link 
                key={i} href={`${prefix}${prefix && "/"}${item.href}`} passHref legacyBehavior>
              <a
                className={`tab tab-lg h-28 tab-bordered border-b-4 ${item.isActive ? "tab-active !border-primary" : ""} text-white`}
              >
                <span data-tina-field={tinaField(item)}><TinaMarkdown content={item.label as unknown as TinaMarkdownContent} /></span>
              </a>
            </Link>
          )}
        </div>
      </div>
      {subItems?.length > 0 &&
        <div className="bg-primary">
          <Container
            className="py-2"
            width="medium"
          >
            <div className="tabs">
              {subItems.map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  className={`tab tab-bordered text-white ${item.isActive ? "tab-active !border-white" : ""}`}
                >
                  <span data-tina-field={tinaField(item)}><TinaMarkdown content={item.label as unknown as TinaMarkdownContent} /></span>
                </a>
              ))}
            </div>
          </Container>
        </div>
      }
    </div>;

  const SmallHorizontalHeader = ({ fixed = false }) => 
    <div className={`navbar z-50 p-0 bg-neutral-900 lg:hidden ${ fixed && "fixed"}`} style={fixed && {width: `calc(100% - ${scrollbarWidth}px)`} || {visibility: 'hidden'}}>
      <div className="navbar-start relative p-4 h-20">
        <Link href="/" className="h-16"><Image alt="Logo" src={logo} style={{ position: 'relative', height: '100%', width: '100%', inset: 0, objectFit: 'contain' }} /></Link>
      </div>
      <div className="navbar-end">
        <label tabIndex={0} htmlFor="side-menu" className="drawer-button btn btn-primary btn-link text-4xl">
          <MenuIcon />
        </label>
      </div>
    </div>;
  
  const SideMenu = () =>
    <ul className="menu !z-50 w-80 bg-neutral-900 text-white">
      <li>
        <label htmlFor="side-menu" className="text-4xl h-24">
          <CloseIcon />
        </label>
      </li>
      {items.map((item, i) => 
        <li
          key={i}
          className={`${item.isActive ? "bordered !border-primary" : ""}`} 
        >
          <Link href={`${prefix}${prefix && "/"}${item.href}`} passHref legacyBehavior>
            <a>
              <span data-tina-field={tinaField(item)}><TinaMarkdown content={item.label as unknown as TinaMarkdownContent} /></span>
            </a>
          </Link>
        </li>
      )}
    </ul>
  
  const Footer = () =>
    <footer className={`footer p-6 bg-neutral-900 text-neutral-content`}>
      {data?.footer?.sections?.map((section, i) => 
        <div className="text-center justify-self-center" key={i}>
          <div className="footer-title mx-auto" data-tina-field={tinaField(section, 'title')}>{section.title}</div>
          {mdToString({ body: section.content }, "").label &&
            <div
              data-tina-field={tinaField(section, 'content')}
              className="text-base opacity-80 leading-relaxed"
            >
              <TinaMarkdown components={components} content={(section.content) as unknown as TinaMarkdownContent} />
            </div>
          }
          <div className="mt-2 flex flex-row justify-self-center items-center space-x-4">
            {section.links?.map((link, j) =>
              <div data-tina-field={tinaField(link, 'link')} key={j}>
                <a href={link.link} target="_blank">
                  {link.image?.src && <Image src={link.image.src} alt={link.image.src} height={link.size == 'large' ? 100 : 50} width={link.size == 'large' ? 100 : 50} className={`w-auto ${link.size == 'large' ? 'max-h-24' : 'max-h-10'}`} />}
                  {link.icon && <Icon data={{ color: 'white', name: link.icon }} />}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>

  return (
    <>
      <Head>
        <title>{data?.header.name + " | " + rawData?.page?.title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Theme data={data?.theme}>
        <div
          data-theme="osu"
          className={`min-h-screen flex flex-col "font-sans"`}
        >
          <div className="drawer drawer-end">
            <input id="side-menu" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content !overflow-y-scroll bg-neutral-900">
              <SmallHorizontalHeader />
              <LargeHorizontalHeader fixed />
              <LargeHorizontalHeader />
              <div className="flex-1 text-gray-800 flex flex-col min-h-8 bg-white" data-tina-field={tinaField(rawData, 'page')}>
                {children}
              </div>
              <Footer/>
            </div>
            <div className="drawer-side">
              <SmallHorizontalHeader fixed />
              <label htmlFor="side-menu" className="drawer-overlay"></label>
              <SideMenu/>
            </div>
          </div>
        </div>
      </Theme>
    </>
  );
};
