const plugins = [
  "@babel/plugin-transform-async-to-generator",
  "@babel/plugin-proposal-class-properties",
  "import-graphql"
];

const presets = ["@babel/preset-env", "@babel/preset-typescript"];

module.exports = {
  plugins,
  presets
};
