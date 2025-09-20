/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow LAN origin in dev to avoid cross-origin warning
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://172.20.10.14:3000',
  ],
};

module.exports = nextConfig;

