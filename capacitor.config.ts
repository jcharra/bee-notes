import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "de.charra.beenotes",
  appName: "Bee Notes",
  webDir: "www",
  bundledWebRuntime: false,
  plugins: {
    LocalNotifications: {
      smallIcon: "tbd",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
  cordova: {
    preferences: {
      ScrollEnabled: "false",
      "android-minSdkVersion": "19",
      BackupWebStorage: "none",
      SplashMaintainAspectRatio: "true",
      FadeSplashScreenDuration: "300",
      SplashShowOnlyFirstTime: "false",
      SplashScreen: "screen",
      SplashScreenDelay: "0",
    },
  },
};

export default config;
