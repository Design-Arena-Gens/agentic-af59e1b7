import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['imapflow', 'mailparser', 'nodemailer', 'linkify-it'],
};

export default nextConfig;
