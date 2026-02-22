import { Blocks } from "../components/blocks-renderer";
import { useTina } from "tinacms/dist/react";
import { Layout } from "../components/layout";
import { client } from "../tina/__generated__/client";
import { gl } from "date-fns/locale";

export default function Page(
  props: AsyncReturnType<typeof getStaticProps>["props"]
) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });
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
  const isLandingPage = (path) => path.match(/^OSU-[^/]+$/i);
  if (isLandingPage(params.filename)) {
    // Strip section half suffix (e.g. OSU-7004Y-1PC-1A -> OSU-7004Y-1PC-1)
    const osuId = params.filename.replace(/^(OSU-[^-]+-[^-]+-\d+)[A-Za-z]$/i, '$1');
    // Client-side navigation to search with OSU ID
    return {
      redirect: {
        destination: `/search?osu=${osuId}`,
        permanent: false,
      },
    };
  }

  const tinaProps = await client.queries.contentQuery({
    relativePath: `${params.filename}.mdx`,
  });

  return {
    props: {
      data: tinaProps.data,
      query: tinaProps.query,
      variables: tinaProps.variables,
    },
  };
};

export const getStaticPaths = async () => {
  const pagesListData = await client.queries.pageConnection();

  return {
    paths: pagesListData.data.pageConnection.edges.map((page) => ({
      params: { filename: page.node._sys.filename },
    })),
    fallback: true,
  };
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
