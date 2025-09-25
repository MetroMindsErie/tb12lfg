// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['via.placeholder.com'], // Add any external image domains you use here
  },
  env: {
    // You can add environment variables here for local development
    // In production, you'd use environment variables from your hosting provider
  },
};

module.exports = nextConfig;