import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a.espncdn.com",
        pathname: "/i/teamlogos/soccer/500/*",
        port: "",
        search: "",
      },
    ],
  },
};

export default nextConfig;
