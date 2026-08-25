const nextConfig = {
  transpilePackages: ["design-system-zeroz"],

  webpack: (config, { isServer }) => {
    // Exclude 'bcrypt' from server-side webpack bundling
    if (isServer) {
      config.externals.push("bcrypt");
    }

    config.module.rules.push({
      test: /\.html$/,
      use: "html-loader",
    });

    return config;
  },
};

module.exports = nextConfig;
