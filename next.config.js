/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: ["cdn.discordapp.com", "eqxyejlbojqgqvgience.supabase.co"], // ここに許可するホスト名を追加
  },
};

export default config;
