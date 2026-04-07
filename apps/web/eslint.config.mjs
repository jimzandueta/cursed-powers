import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    rules: {
      // Math.random() in animation initial values is intentional
      "react-hooks/purity": "off",
    },
  },
];
