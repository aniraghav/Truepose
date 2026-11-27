/** @type {import('next').NextConfig} */
// Not a static export any more: /api/book needs a server (Vercel runs it as a function).
const nextConfig = {
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
