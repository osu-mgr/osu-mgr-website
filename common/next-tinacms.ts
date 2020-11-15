import {
	getGithubPreviewProps,
	GithubPreviewProps,
	PreviewData,
	parseJson,
	parseMarkdown,
} from 'next-tinacms-github';

export async function getGithubFilesStaticProps<T>({
	preview,
	previewData,
	files,
}: {
	preview: boolean;
	previewData: PreviewData<T>;
	files: {
		[key: string]: {
			fileRelativePath: string;
			parse: typeof parseJson | typeof parseMarkdown;
		};
	};
}): Promise<GithubPreviewProps<T>> {
	if (preview) {
		const props = {
			error: null,
			preview,
			file: null,
			content: {},
		};
		const fileKeys = Object.keys(files);
		return Promise.all(
			fileKeys.map((file) =>
				getGithubPreviewProps({
					...previewData,
					fileRelativePath: files[file].fileRelativePath,
					parse: files[file].parse,
				})
			)
		).then(
			(filesProps) =>
				new Promise((resolve) => {
					filesProps.forEach((fileProps, idx) => {
						props.content[fileKeys[idx]] = fileProps.props.file;
						props['error'] = props['error'] || fileProps.props.error || null;
					});
					resolve({ props });
				})
		);
	}
	const props = {
		sourceProvider: null,
		error: null,
		preview: false,
		file: null,
		content: {},
	};
	for (const file of Object.keys(files)) {
		props.content[file] = {
			fileRelativePath: files[file].fileRelativePath,
			data: (await import(`../${files[file].fileRelativePath}`)).default,
		};
	}
	return { props };
}
