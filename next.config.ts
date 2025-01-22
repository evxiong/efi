import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // {
      //   protocol: "https",
      //   hostname: "a.espncdn.com",
      //   pathname: "/i/teamlogos/soccer/500/*",
      //   port: "",
      //   search: "",
      // },
      {
        protocol: "https",
        hostname: "resources.premierleague.com",
        pathname: "/premierleague/badges/50/*",
        port: "",
        search: "",
      },
    ],
  },
};

export default nextConfig;
