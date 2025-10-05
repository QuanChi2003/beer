
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: { serverActions: { allowedOrigins: ['*'] } },
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] }
};
export default nextConfig;
