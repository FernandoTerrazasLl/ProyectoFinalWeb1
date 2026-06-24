import postcssPresetEnv from "postcss-preset-env";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

const isProduction = process.env.NODE_ENV === "production";

export default {
  plugins: [
    postcssPresetEnv({ stage: 2 }),
    autoprefixer(),
    ...(isProduction ? [cssnano()] : []),
  ],
};
