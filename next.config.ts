import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' web.archive.org",
              "style-src 'self' 'unsafe-inline' web.archive.org",
              "img-src 'self' data: blob: web.archive.org *.walgreens.com *.cvs.com *.walmart.com *.kroger.com *.costco.com",
              "frame-src web.archive.org",
              "connect-src 'self' archive-api.open-meteo.com api.delphi.cmu.edu data.cdc.gov web.archive.org *.supabase.co",
              "font-src 'self' data:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
