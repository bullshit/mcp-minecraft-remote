import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 10000,
    // Enable globals for vi functions
    globals: true,
    // Enable unstable features if needed
    unstubEnvs: true,
    unstubGlobals: true,
    // Run tests serially to avoid container conflicts
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Set up environment variables for testcontainers
    env: {
      TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE: "/var/run/docker.sock",
      TESTCONTAINERS_RYUK_DISABLED: "true",
      DOCKER_HOST: "unix:///var/run/docker.sock",
    },
  },
  // Ensure proper module resolution
  resolve: {
    alias: {
      // Add any aliases if needed
    },
  },
});
