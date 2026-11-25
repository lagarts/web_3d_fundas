import type { Config } from "tailwindcss";
// Preflight desactivado para no alterar el diseño existente; las utilidades de Tailwind están disponibles.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  theme: { extend: {} },
  plugins: [],
};
export default config;
