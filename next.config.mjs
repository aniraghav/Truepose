/** @type {import('next').NextConfig} */
const relative = process.env.RELATIVE_ASSETS === "1"; // used only for the private preview build

const nextConfig = {
  output: "export",          // static site: host anywhere (Vercel, Netlify, S3)
  images: { unoptimized: true },
  reactStrictMode: true,
  ...(relative ? { assetPrefix: "." } : {}),
};

export default nextConfig;
