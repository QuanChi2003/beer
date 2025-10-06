
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
}
export default nextConfig
