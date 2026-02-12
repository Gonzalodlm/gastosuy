import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Necesario para que pdf-parse funcione en el servidor
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
