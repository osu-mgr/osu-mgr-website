import { SWRResponse } from "swr";
import useSWRImmutable from 'swr/immutable';

const useCollectionFileExists = (file: string | null): SWRResponse => useSWRImmutable(
  file !== null && (() => {
    return { url: `/api/collection?fileExists`, payload: {
      url: `${process.env.COLLECTION}${file}`
    }};
  }) || null,
  async ({ url, payload }) => {
    const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
    return res.status === 200;
  }
);

export default useCollectionFileExists;
