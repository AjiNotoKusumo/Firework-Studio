/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['localtest.me', 'ease-queensland-applied-cap.trycloudflare.com', 'operator-retirement-stage-treatments.trycloudflare.com'],
  serverExternalPackages: ['@google/genai', 'apify-client'],
};

export default nextConfig;
