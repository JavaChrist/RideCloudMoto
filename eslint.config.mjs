import coreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...coreWebVitals,
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
  {
    rules: {
      // Pattern "chargement au montage" (fetch initial, lecture localStorage) :
      // légitime dans cette app, on garde un avertissement plutôt qu'une erreur.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
