import withNextIntl from 'next-intl/plugin';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use the recommended output option for SSR
  output: "standalone",
  // Add trailing slash to help with routing
  trailingSlash: true,
  // Ensure all routes are accessible
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "/:path*",
      },
    ];
  },
  // Redirects from English paths to Swedish paths (default language)
  async redirects() {
    return [
      {
        source: "/classes",
        destination: "/klasser",
        permanent: true,
      },
      {
        source: "/schedule",
        destination: "/schema",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/kontakt",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/om-oss",
        permanent: true,
      },
      {
        source: "/prices",
        destination: "/priser",
        permanent: true,
      },
      {
        source: "/teachers",
        destination: "/larare",
        permanent: true,
      },
    ];
  },
};

// Wrap the config with next-intl
export default withNextIntl('./i18n.ts')(nextConfig);
