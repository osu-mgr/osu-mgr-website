import { FunctionComponent } from 'react';
import Head from 'next/head';

export const HeadTitle: FunctionComponent<{
	siteTitle: string;
	pageTitle: string;
}> = ({ siteTitle, pageTitle }) => (
	<>
		<Head>
			<title>
				{pageTitle || ''}
				{(pageTitle && siteTitle && ' | ') || ''}
				{siteTitle || ''}
			</title>
		</Head>
	</>
);