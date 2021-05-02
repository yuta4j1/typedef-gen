require('esbuild')
  .build({
    entryPoints: ['index.ts'],
    bundle: true,
    minify: process.env.NODE_ENV === 'prod',
    platform: 'node',
    outfile: 'dist/app.js',
  })
  .catch(() => process.exit(1))
