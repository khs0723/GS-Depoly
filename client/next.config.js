/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "www.gravatar.com",
      "localhost",
      "ec2-184-169-203-106.us-west-1.compute.amazonaws.com",
    ],
  },
};

module.exports = nextConfig;
