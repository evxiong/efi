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
        pathname: "/image_resources/logo/*logo/*",
        port: "",
        search: "",
      },
      {
        protocol: "https",
        hostname: "www.premierleague.com",
        pathname: "/resources/rebrand/v7.153.44/i/elements/pl-main-logo.png",
        port: "",
        search: "",
      },
    ],
  },
};

export default nextConfig;
