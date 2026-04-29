const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  additionalManifestEntries: [],
  importScripts: ['/notification-handler.js'],
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  reactStrictMode: true,
});