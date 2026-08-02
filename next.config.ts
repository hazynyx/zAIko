import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local network HMR connections
  allowedDevOrigins: ["192.168.162.115", "localhost"],
};

export default nextConfig;
