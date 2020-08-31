//import { NextApiRequest, NextApiResponse } from 'next';
import { apiProxy } from 'next-tinacms-github';

/*export default (_req: NextApiRequest, res: NextApiResponse): void => {
  // eslint-disable-next-line no-console
  // console.log('proxy-github', _req.headers, _req.body, res);
  apiProxy(process.env.SIGNING_KEY);
	res.status(200).end();
};*/

export default apiProxy(process.env.SIGNING_KEY);
