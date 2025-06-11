import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Console } from 'console';

const useCollectionFileExists = (
  file: string | null
): UseQueryResult<boolean, Error> => {
  const fetchFileExists = async (): Promise<boolean> => {
    if (!file) {
      return false;
    }
    const res = await fetch('/api/collection?fileExists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: file }),
    });
    return res.status === 200;
  };

  return useQuery<boolean, Error, boolean, (string | null)[]>({
    queryKey: ['collectionFileExists', file],
    queryFn: fetchFileExists,
    enabled: !!file, 
    staleTime: Infinity,
  });
};

export default useCollectionFileExists;