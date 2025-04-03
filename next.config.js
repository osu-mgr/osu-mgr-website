require('dotenv').config();

module.exports = require('next-images')({
	images: {
		disableStaticImages: true, // Disable Next.js built-in image optimization
	},
	env: {
		GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
		REPO_FULL_NAME: process.env.REPO_FULL_NAME,
		BASE_BRANCH: process.env.BASE_BRANCH,
		OS_NODE: process.env.OS_NODE,
		COLLECTION: process.env.COLLECTION,
	},
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				path: false,
				process: require.resolve('process/browser'),
			};
		}

		return config;
	},
});
