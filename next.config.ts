import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  { key: "X-Frame-Options", value: "DENY" }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  transpilePackages: ["@powerchain/integration", "@powerchain/shared", "@powerchain/ai-core", "@powerchain/ai-gateway", "@powerchain/ai-ui", "@powerchain/credits", "@powerchain/contracts"],
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s2.coinmarketcap.com", pathname: "/static/img/coins/**" },
      { protocol: "https", hostname: "cryptoicons.cc", pathname: "/**" }
    ]
  },
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons", "recharts"]
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: "/login", destination: "/auth/signin", permanent: true },
      { source: "/profile", destination: "/settings", permanent: true },
      { source: "/integration", destination: "/integrations", permanent: true },
    ];
  },
  turbopack: {}

};

export default nextConfig;
