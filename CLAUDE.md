# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev`: Start development server with TinaCMS on port 3100 (datalayer on 3101)
- `npm run build`: Build production version with TinaCMS
- `npm start`: Build and start production server
- `npm run export`: Build and export static version
- `npm run lint`: Run ESLint on TypeScript files

## Architecture Overview

This is a Next.js website for the OSU Marine & Geology Repository with TinaCMS integration for content management.

### Core Technologies
- **Next.js 13**: React framework with dynamic routing
- **TinaCMS**: Git-based headless CMS for content editing
- **OpenSearch**: Full-text search backend for collections data
- **TypeScript**: Type safety throughout the codebase
- **Tailwind CSS**: Utility-first CSS framework with DaisyUI components

### Key Architecture Patterns

**Content Management Flow:**
- Content stored in `content/pages/*.mdx` files managed by TinaCMS
- Global configuration in `content/global/index.json`
- TinaCMS admin interface at `/admin` route
- Content schema defined in `tina/config.tsx`

**Page Rendering:**
- Dynamic routing via `pages/[filename].tsx` matches MDX files
- Special handling: OSU-* URLs redirect to `/search?osu=OSU-...` and show modal with landing page
- Blocks-based page composition using `components/blocks/`
- Layout wrapper provides consistent header/footer

**Search Architecture:**
- OpenSearch backend accessed via `pages/api/opensearch.ts`
- Complex filtering system with AND/OR logic for file types, methods, materials, RV names
- Search component in `components/blocks/search.tsx` with URL parameter support
- Collection data indexed by OSU ID with aggregation support
- URL parameter `?text=` automatically populates search box and triggers results
- URL parameter `?osu=` triggers modal with landing page content while maintaining search
- Modal header shows hierarchical breadcrumbs with clickable navigation (Section → Core → Cruise)
- Section breadcrumbs fetch core data via _coreUUID lookup to display proper hierarchy
- Modal uses fixed height with dedicated scroll pane to prevent content flashing during navigation

**Component Organization:**
- `components/blocks/`: Page content blocks (hero, features, search, etc.)
- `components/fields/`: Custom TinaCMS field components
- `components/layout/`: Site structure and theming
- `components/util/`: Shared utilities and helpers

### Important Implementation Details

**TinaCMS Integration:**
- Uses static configuration with client ID, branch, and token
- Media management through `public/uploads/` directory
- Custom field components for color picker, icon picker, link buttons
- Rich text with custom templates for markdown components

**Search Functionality:**
- Multi-type search (cores, cruises, dives, rocks)
- Advanced filtering with configurable AND/OR logic
- Sorting by modification date, alphabetical, or ID hierarchy
- Real-time aggregation counts for filter options

**Environment Variables Required:**
- `NEXT_PUBLIC_TINA_CLIENT_ID`: TinaCMS client identifier
- `NEXT_PUBLIC_TINA_BRANCH`: Git branch for content
- `TINA_TOKEN`: Authentication token for TinaCMS
- `OS_NODE`: OpenSearch cluster endpoint

### Development Notes

- ESLint errors are ignored during builds (configured in next.config.js)
- SVG files processed through @svgr/webpack for React components
- Image optimization configured for Tina.io remote patterns
- Node.js 20.x required (specified in package.json engines)

### Content Structure

Pages are composed of reusable blocks:
- `hero`: Landing page headers with call-to-action
- `features`: Multi-column feature highlights
- `content`: Rich text content blocks
- `search`: Collection search interface
- `table`: Data tables with filtering
- `download`: File download blocks
- `iframe`: Embedded content
- `landing-page`: Special collection landing pages

Navigation and footer content managed globally through TinaCMS with nested link structures supporting dropdowns.