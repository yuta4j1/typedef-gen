require("esbuild")
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: 'node',
    outfile: "dist/app.js",
  })
  .catch(() => process.exit(1));
