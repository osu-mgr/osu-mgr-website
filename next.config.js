require('dotenv').config();

module.exports = require('next-images')({
	env: {
		GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
		REPO_FULL_NAME: process.env.REPO_FULL_NAME,
		BASE_BRANCH: process.env.BASE_BRANCH,
		OS_NODE: process.env.OS_NODE,
		COLLECTION: process.env.COLLECTION,
	},
	webpack: function (config) {
		config.node = {
			fs: 'empty',
		};
		return config;
	},
});
