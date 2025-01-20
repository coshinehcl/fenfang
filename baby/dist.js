const { build } = require('esbuild');
build({
    entryPoints: ['index.ts'],
    outfile: 'dist/index.js',
    bundle: true,
    // minify: true,
    loader: {
      '.ts': 'ts',
    },
}).catch(() => process.exit(1));