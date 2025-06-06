import { withContentlayer } from "next-contentlayer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-5f7cbdfd9ffa4c838e386788f395f0c4.r2.dev",
      },
    ],
  },
};

export default withContentlayer(nextConfig);
