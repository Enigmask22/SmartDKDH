module.exports = ({ config }) => {
  const serverIp = process.env.SERVER_IP || "YOUR_DEFAULT_IP";
  const apiPort = process.env.API_PORT || "8000";

  return {
    ...config,
    expo: {
      name: "home-app",
      slug: "home-app",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "myapp",
      userInterfaceStyle: "automatic",
      splash: {
        image: "./assets/images/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
      ios: {
        supportsTablet: true,
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/images/adaptive-icon.png",
          backgroundColor: "#ffffff",
        },
      },
      web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png",
      },
      plugins: ["expo-router"],
      experiments: {
        typedRoutes: true,
      },
      extra: {
        router: {
          origin: false,
        },
        eas: {
          projectId: "b2195014-57bb-4de8-b768-18f0ec682774",
        },
        serverIp: serverIp,
        apiPort: apiPort,
      },
      updates: {
        url: "https://u.expo.dev/b2195014-57bb-4de8-b768-18f0ec682774",
      },
      runtimeVersion: {
        policy: "appVersion",
      },
    },
  };
};
