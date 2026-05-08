/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: {
    position: 'bottom-right'
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['localtest.me', 'ease-queensland-applied-cap.trycloudflare.com', 'operator-retirement-stage-treatments.trycloudflare.com', 'firework-studio.rookiedev.online'],
  serverExternalPackages: ['@google/genai', 'apify-client'],
};

export default nextConfig;
