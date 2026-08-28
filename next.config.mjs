import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // No basePath — this app serves at root of console.domain.com
  // (Previously it was /console when co-hosted with landing on one domain)
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    VITE_ENV: process.env.VITE_ENV,
    VITE_API_URL: process.env.VITE_API_URL,
    VITE_APP_URL: process.env.VITE_APP_URL,
    VITE_APP_BASE_DOMAIN: process.env.VITE_APP_BASE_DOMAIN,
    VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,
    VITE_REDX_TOKEN: process.env.VITE_REDX_TOKEN,
    VITE_STEADFAST_API_KEY: process.env.VITE_STEADFAST_API_KEY,
    VITE_STEADFAST_SECRET_KEY: process.env.VITE_STEADFAST_SECRET_KEY,
    VITE_PATHAO_CLIENT_ID: process.env.VITE_PATHAO_CLIENT_ID,
    VITE_PATHAO_CLIENT_SECRET: process.env.VITE_PATHAO_CLIENT_SECRET,
  },
  async rewrites() {
    const isDev = process.env.NODE_ENV !== 'production';
    return [
      {
        // Dev: proxy /api/* → api-console (Super Admin backend) on port 8001
        // Prod: handled by nginx routing console.domain.com/api → api-console
        source: '/api/:path*',
        destination:
          (
            process.env.API_CONSOLE_URL ||
            'http://localhost:8001'
          ) + '/api/:path*',
      },
    ];
  },
  webpack: (config, { webpack }) => {
    config.resolve.alias['react-router-dom'] = path.resolve(__dirname, './src/lib/react-router-dom-shim.jsx');
    config.resolve.alias['react-i18next'] = path.resolve(__dirname, './src/lib/react-i18next-shim.jsx');
    config.resolve.alias['@/pages'] = path.resolve(__dirname, './src/views');
    config.resolve.alias['@'] = path.resolve(__dirname, './src');
    
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    const envKeys = Object.keys(process.env).reduce((acc, key) => {
      if (key.startsWith('VITE_') || key === 'NODE_ENV') {
        acc[key] = process.env[key];
      }
      return acc;
    }, {
      VITE_ENV: 'PRODUCTION',
      VITE_API_URL: '/api',
      VITE_APP_BASE_DOMAIN: 'squadcart.com',
    });

    config.plugins.push(
      new webpack.DefinePlugin({
        'import.meta.env': JSON.stringify(envKeys),
      })
    );
    
    return config;
  },
};

export default nextConfig;
