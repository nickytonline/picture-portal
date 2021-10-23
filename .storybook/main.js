const path = require('path');

module.exports = {
  stories: ['../**/__stories__/*.stories.@(mdx|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  webpackFinal: async (config, { configType }) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@components': path.resolve(__dirname, '../components'),
        '@assets': path.resolve(__dirname, '../assets'),
      },
    };

    return config;
  },
};
