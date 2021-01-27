#!/usr/bin/env node

// build configuration for esbuild.
// This file can be executed directly to run a build.

require("esbuild").build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    outfile: "./build/index.js",
    external: ["sqlite3 "],
    platform: "node",
})