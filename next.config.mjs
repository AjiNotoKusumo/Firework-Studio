/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['localtest.me'],
  serverExternalPackages: ['@google/genai', 'apify-client'],
};

export default nextConfig;
