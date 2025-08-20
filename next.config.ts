import withNextIntl from 'next-intl/plugin';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use the recommended output option for SSR
  output: "standalone",
  // Add trailing slash to help with routing
  trailingSlash: true,
  // Configure allowed image domains
  images: {
    domains: [
      'd3nx09olfb6r4i.cloudfront.net' // CloudFront CDN for Braincore S3 storage
    ],
  },
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
      // Redirects from old wellbeing URLs to new structure
      {
        source: "/optimum-metoden-mediyoga-yogasteungsund-funktionsmedicin",
        destination: "/valbefinnande/optimum-metoden",
        permanent: true,
      },
      {
        source: "/pt-yoga",
        destination: "/valbefinnande/pt-yoga",
        permanent: true,
      },
      {
        source: "/elinsternsjo",
        destination: "/valbefinnande/elin-sternsjo",
        permanent: true,
      },
      {
        source: "/yogaterapi-restorative-behandling",
        destination: "/valbefinnande/restorative",
        permanent: true,
      },
      {
        source: "/tibetansk-ansiktsmassage",
        destination: "/valbefinnande/ansiktsmassage",
        permanent: true,
      },
      {
        source: "/malinmorander-funktionsmedicin",
        destination: "/valbefinnande/malins-friskvard",
        permanent: true,
      },
      {
        source: "/yst-rekommenderar",
        destination: "/valbefinnande/rekommenderar",
        permanent: true,
      },
      // Also handle English versions of wellbeing pages
      {
        source: "/en/wellbeing/:path*",
        destination: "/en/valbefinnande/:path*",
        permanent: true,
      },
      {
        source: "/wellness/:path*",
        destination: "/valbefinnande/:path*",
        permanent: true,
      },
    ];
  },
};

// Wrap the config with next-intl
export default withNextIntl('./i18n.ts')(nextConfig);
