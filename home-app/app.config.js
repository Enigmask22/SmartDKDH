module.exports = {
  name: "home-app",
  slug: "home-app",
  version: "1.0.0",
  // Các cấu hình khác...
  extra: {
    serverIp: process.env.SERVER_IP,
    apiPort: process.env.API_PORT,
  },
};
