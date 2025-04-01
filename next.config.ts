/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: any) => {
    // This is to fix the canvas module error with pdfjs-dist
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
