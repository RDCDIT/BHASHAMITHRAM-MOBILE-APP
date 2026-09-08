const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

if (config.resolver && config.resolver.assetExts) {
  if (!config.resolver.assetExts.includes('db')) {
    config.resolver.assetExts.push('db');
  }
}

module.exports = config;
