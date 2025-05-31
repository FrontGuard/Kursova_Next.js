const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {};
const isProd = process.env.NODE_ENV === 'production'
module.exports = withSentryConfig(
  nextConfig,
  {
   

    org: "ztueduua-96",
    project: "coursework",

    silent: !process.env.CI,
    output: 'export',
    
    assetPrefix: isProd ? '/' : '',


    widenClientFileUpload: true,


    tunnelRoute: "/monitoring",

    disableLogger: true,
    authToken: process.env.SENTRY_AUTH_TOKEN,

 
    automaticVercelMonitors: true,
  }
);
