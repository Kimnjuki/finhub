import { defineConfig } from "convex/config";

export default defineConfig({
  // Mark Convex runtime as external to avoid bundler issues
  externalModules: ["convex/runtime"],
});