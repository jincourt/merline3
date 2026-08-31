import path from "path";
import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./remotion/index.ts");
Config.overrideWebpackConfig((current) => ({
  ...current,
  resolve: {
    ...current.resolve,
    alias: {
      ...(current.resolve?.alias ?? {}),
      "@": path.resolve(__dirname),
    },
  },
}));
