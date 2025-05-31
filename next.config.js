const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = withSentryConfig(
  nextConfig,
  {
   

    org: "ztueduua-96",
    project: "coursework",

    silent: !process.env.CI,
    


    widenClientFileUpload: true,


    tunnelRoute: "/monitoring",

    disableLogger: true,
    authToken: process.env.SENTRY_AUTH_TOKEN,

 
    automaticVercelMonitors: true,
  }
);
