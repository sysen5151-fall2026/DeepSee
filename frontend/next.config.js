/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  output: 'standalone',
  images: {
    remotePatterns: [{ protocol: 'http', hostname: 'localhost' }],
  },
};

module.exports = nextConfig;
