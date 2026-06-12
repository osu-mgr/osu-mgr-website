import { Blocks } from "../components/blocks-renderer";
import { Layout } from "../components/layout";
import layoutData from "../content/global/index.json";

// This LDCR demo only serves the search interface, so we no longer depend on
// TinaCMS (which would require Tina Cloud credentials at build time). The page
// is rendered directly from the static global config + a single search block.
export default function Page(
  props: AsyncReturnType<typeof getStaticProps>["props"]
) {
  const data = (props as any)?.data;
  if (!data?.page) {
    return <div>Loading...</div>;
  }
  return (
    <Layout rawData={data} data={data.global as any}>
      <Blocks {...data.page} />
    </Layout>
  );
}

export const getStaticProps = async ({ params }) => {
  const filename: string = params.filename;

  // LDCR-* IDs are landing pages: open the search modal for that ID.
  if (/^LDCR-[^/]+$/i.test(filename)) {
    // Strip section half suffix (e.g. LDCR-7004Y-1PC-1A -> LDCR-7004Y-1PC-1)
    const osuId = filename.replace(/^(LDCR-[^-]+-[^-]+-\d+)[A-Za-z]$/i, '$1');
    return {
      redirect: {
        destination: `/search?osu=${osuId}`,
        permanent: false,
      },
    };
  }

  // Demo: the search page is the only content page. Everything else funnels
  // to /search (the middleware already does this at the edge; this is a backstop).
  if (filename !== "search") {
    return {
      redirect: {
        destination: "/search",
        permanent: false,
      },
    };
  }

  return {
    props: {
      data: {
        page: {
          title: "Search",
          blocks: [{ __typename: "PageBlocksSearch", _template: "search" }],
        },
        global: layoutData,
      },
    },
  };
};

export const getStaticPaths = async () => {
  return {
    paths: [{ params: { filename: "search" } }],
    // LDCR-* landing IDs and any stray routes are resolved on demand by
    // getStaticProps (redirects), so render them blocking rather than 404.
    fallback: "blocking",
  };
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
