import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "resources.premierleague.com",
        pathname: "/premierleague/badges/50/*",
        port: "",
        search: "",
      },
      {
        protocol: "https",
        hostname: "images.fotmob.com",
        pathname: "/image_resources/logo/teamlogo/*",
        port: "",
        search: "",
      },
    ],
  },
};

export default nextConfig;
