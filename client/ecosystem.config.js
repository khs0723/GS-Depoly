module.exports = {
  apps: [
    {
      name: "community",
      script: "env-cmd -f .env.production next start",
    },
  ],
};
