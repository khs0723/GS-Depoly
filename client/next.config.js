/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "www.gravatar.com",
      "localhost",
      "ec2-54-183-189-54.us-west-1.compute.amazonaws.com",
    ],
  },
};

module.exports = nextConfig;
