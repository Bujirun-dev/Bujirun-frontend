import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "http", hostname: "tong.visitkorea.or.kr" },
      { protocol: "https", hostname: "bujirun-storage.s3.ap-northeast-2.amazonaws.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.svg": [
        {
          condition: { query: /[?&]url(?=&|$)/ },
          type: "asset",
        },
        {
          condition: {
            any: [{ query: /[?&]svgr(?=&|$)/ }, { not: { query: /[?&]url(?=&|$)/ } }],
          },
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      ],
    },
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule: { test?: RegExp }) =>
      rule.test?.test?.(".svg"),
    );
    if (fileLoaderRule) fileLoaderRule.exclude = /\.svg$/i;

    config.module.rules.push({
      test: /\.svg$/i,
      resourceQuery: /url/,
      type: "asset/resource",
    });

    config.module.rules.push({
      test: /\.svg$/i,
      resourceQuery: { not: [/url/] },
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;
