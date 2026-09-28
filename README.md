# OSU-MGR Website

Public website for the [Oregon State University Marine and Geology Repository](https://osu-mgr.org) (OSU-MGR). It serves the repository's informational pages, the searchable collections catalogue of cores, dredges, dives and rocks, and per-sample landing pages.

The site is a [Next.js](https://nextjs.org/) 13 application with [TinaCMS](https://tina.io/) for Git-based content editing, an [OpenSearch](https://opensearch.org/) backend for the collections search, and an S3 proxy for sample files. It is deployed on Vercel.

## Quick start

Requirements: Node.js 24.x and [pnpm](https://pnpm.io/) (a `pnpm-lock.yaml` is checked in).

If you manage Node with nvm, run `nvm use 24` first. pnpm is installed per Node version, so a shell on another Node version may report `pnpm: command not found` even when it works on Node 24. `corepack enable pnpm` installs it for the active version if it is missing.

```bash
pnpm install
# create .env.local; see Environment variables below
pnpm dev
```

`pnpm dev` starts TinaCMS in local mode alongside the Next.js dev server:

| Service                | URL                          |
| ---------------------- | ---------------------------- |
| Site                   | http://localhost:4100        |
| TinaCMS admin          | http://localhost:4100/admin  |
| TinaCMS local datalayer| http://localhost:4101        |

Other scripts:

| Command        | What it does                                                        |
| -------------- | ------------------------------------------------------------------- |
| `pnpm build`   | Build TinaCMS admin, patch it, then `next build`                     |
| `pnpm start`   | Same as build, then `next start`                                     |
| `pnpm export`  | Same as build, then `next export` for a static site                  |
| `pnpm lint`    | ESLint over `.ts` and `.tsx` files                                   |

The build steps run `scripts/patch-admin.mjs`, which rewrites Tina Cloud asset URLs shown in the admin media manager to the local `/uploads/` path so that copied image links work on the site.

## Environment variables

Create `.env.local` in the project root. Never commit it.

| Variable                      | Required | Purpose                                                                                     |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_TINA_CLIENT_ID`  | yes      | Tina Cloud project client ID                                                                 |
| `NEXT_PUBLIC_TINA_BRANCH`     | yes      | Git branch Tina reads and writes content on. `prod` selects the production search index.    |
| `TINA_TOKEN`                  | yes      | Tina Cloud read-only content token                                                          |
| `OS_NODE`                     | yes      | OpenSearch endpoint, including credentials if the cluster needs them                        |
| `COLLECTION`                  | yes      | Base URL of the collection file store used for file-existence and moratorium checks        |
| `AWS_ACCESS_KEY_ID`           | no       | Credentials for the S3 file proxy. Falls back to the default AWS credential chain.          |
| `AWS_SECRET_ACCESS_KEY`       | no       | See above                                                                                    |
| `AWS_REGION`                  | no       | Defaults to `us-west-2`                                                                      |
| `AWS_S3_ENDPOINT`             | no       | Defaults to the `us-west-2` S3 endpoint                                                      |

The search API picks its OpenSearch index from the Tina branch: `osu-mgr` when `NEXT_PUBLIC_TINA_BRANCH` is `prod`, otherwise `osu-mgr-dev`. Both indices are built by the separate [osu-mgr-pipeline](https://github.com/osu-mgr/osu-mgr-pipeline) project, not by this repository.

## Project layout

```
components/
  blocks/          Page building blocks selectable in TinaCMS (hero, features, content,
                   search, table, download, iframe, image, landing-page, modal)
  blocks-renderer  Maps a page's block list to the components above
  search/          Search UI: filter panels, data-issue flags, row and file downloads,
                   and the MapLibre maps (Esri Ocean, with polar caps)
  fields/          Custom TinaCMS field editors (colour picker, icon picker, link buttons)
  layout/          Header, footer, theme
  hooks/           React hooks (file-existence check, localStorage)
  util/            Shared pieces: map thumbnails, file cards, markdown helpers
content/
  pages/*.mdx      One file per site page, edited through TinaCMS
  global/index.json  Site-wide settings: navigation, footer, theme
pages/
  [filename].tsx   Renders any content/pages/*.mdx file; handles OSU-* sample URLs
  api/opensearch.ts  Search, aggregation and lookup endpoint over OpenSearch
  api/collection.ts  File-existence and moratorium checks against the collection store
  api/file/[...path].ts  Streams sample files from the osu-corelab-storage S3 bucket
public/uploads/    Media managed by TinaCMS
scripts/patch-admin.mjs  Post-build patch for the Tina admin page
tina/config.tsx    TinaCMS schema for pages and global settings
vercel.json        Vercel build config and redirects (/monitor, /progress)
```

## How the pieces fit together

**Content.** Every page is an MDX file in `content/pages/` composed of blocks. Editors sign in at `/admin` and TinaCMS commits their changes to the branch named in `NEXT_PUBLIC_TINA_BRANCH`. The schema for pages, blocks and global settings lives in `tina/config.tsx`, and the generated client in `tina/__generated__/` is rebuilt on every dev or build run.

**Search.** The `search` block renders the collections catalogue. It calls `/api/opensearch`, which queries the OpenSearch index for cores, cruises, dives and rocks, supports AND/OR filtering across file types, methods, materials and research-vessel names, and returns aggregation counts for the filter panels. Search state is mirrored in the URL: `?text=` pre-fills the query box and `?osu=` opens a modal with the sample's landing page while keeping the result list underneath.

**Sample landing pages.** A URL such as `/OSU-7004Y-1PC-1` redirects to `/search?osu=OSU-7004Y-1PC-1`. Section-half suffixes are stripped so `OSU-7004Y-1PC-1A` resolves to the same section. The modal header shows a clickable breadcrumb trail (section, core, cruise) built from the index.

**Files.** Sample files are served through `/api/file/<path>`, which streams objects from S3 so that the bucket stays private. File-existence and moratorium checks go through `/api/collection`.

## Branches and deployment

| Branch | Role                                                             |
| ------ | ---------------------------------------------------------------- |
| `dev`  | Default branch. Pull requests target this branch.                |
| `prod` | Production. TinaCMS content commits from editors land here.      |

Vercel builds from these branches with the settings in `vercel.json`. A GitHub Action builds every pull request. Dependabot keeps npm dependencies current.

## Notes for contributors

- ESLint errors do not fail the build. Run `pnpm lint` before opening a pull request.
- SVG files import as React components through `@svgr/webpack`.
- Remote images from any `*.tina.io` host are allowed by the Next.js image loader.
- The dev and build scripts raise the Node heap to 8 GB because the TinaCMS build is memory hungry.
- Do not edit `content/` files and TinaCMS admin content at the same time on the same branch, or you will race the editor's commits.

## License

Apache License 2.0. See [LICENSE](LICENSE). The project started from the Tina Cloud Starter, see [NOTICE](NOTICE).
