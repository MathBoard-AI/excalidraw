const path = require("path");

const { build } = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");

const { parseEnvVariables } = require("../packages/excalidraw/env.cjs");

const ENV_VARS = {
  development: {
    ...parseEnvVariables(`${__dirname}/../.env.development`),
    DEV: true,
  },
  production: {
    ...parseEnvVariables(`${__dirname}/../.env.production`),
    PROD: true,
  },
};

// build config factory
const getConfig = (outdir) => ({
  outdir,
  bundle: true,
  splitting: true,
  format: "esm",
  packages: "external", // still allows normal node_modules resolution
  plugins: [sassPlugin()],
  target: "es2020",
  assetNames: "[dir]/[name]",
  chunkNames: "[dir]/[name]-[hash]",
  alias: {
    "@excalidraw/utils": path.resolve(__dirname, "../packages/utils/src"),
  },
  external: [
    // keep React external since it’s a peer dependency
    "react",
    "react-dom",
    "@mathboard-ai/common",
    "@mathboard-ai/element",
    "@mathboard-ai/math",
  ],
  loader: {
    ".woff2": "file",
  },
});

function buildDev(config) {
  return build({
    ...config,
    sourcemap: true,
    define: {
      "import.meta.env": JSON.stringify(ENV_VARS.development),
    },
  });
}

function buildProd(config) {
  return build({
    ...config,
    minify: true,
    define: {
      "import.meta.env": JSON.stringify(ENV_VARS.production),
    },
  });
}

const createESMRawBuild = async () => {
  const chunksConfig = {
    entryPoints: ["index.tsx", "**/*.chunk.ts"],
    entryNames: "[name]",
  };

  // development build (unminified, with source maps)
  await buildDev({
    ...getConfig("dist/dev"),
    ...chunksConfig,
  });

  // production build (minified, no source maps)
  await buildProd({
    ...getConfig("dist/prod"),
    ...chunksConfig,
  });
};

(async () => {
  await createESMRawBuild();
})();
