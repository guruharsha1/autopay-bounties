/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose",
    externalDir: true
  }
};

export default nextConfig;
