import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["remotion", "@remotion/player", "@remotion/web-renderer"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cmiygjfdlaimierwfcaw.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/paiement/success",
        destination: "/api/checkout/complete",
        permanent: false,
      },
      {
        source: "/vendre/paiement/success",
        destination: "/api/checkout/complete",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
