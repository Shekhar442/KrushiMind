/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Disable service worker in development
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Enable service worker only in production
      const workboxPlugin = require('workbox-webpack-plugin');
      config.plugins.push(
        new workboxPlugin.GenerateSW({
          exclude: [
            /\.map$/,
            /_buildManifest\.js$/,
            /_ssgManifest\.js$/,
            /_middlewareManifest\.js$/,
            /_edgeMiddlewareManifest\.js$/,
            /_middleware\.js$/,
            /_edgeMiddleware\.js$/,
            /manifest\.json$/,
            /\.next\//,
            /static\/chunks\/pages\/_app\.js$/,
            /static\/chunks\/pages\/_error\.js$/,
            /static\/chunks\/pages\/_document\.js$/
          ],
          swDest: 'static/service-worker.js',
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                }
              }
            }
          ]
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;