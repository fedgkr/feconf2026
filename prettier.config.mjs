/** @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  // Tailwind v4: theme/custom utilities live in the CSS entry, not a JS config.
  tailwindStylesheet: "./src/app/globals.css",
};

export default config;
