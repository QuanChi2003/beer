
import type { Config } from 'tailwindcss'
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}","./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#f59e0b",
        beer: { amber:"#f59e0b", foam:"#fff7e6", dark:"#3b2f2f", hop:"#0f766e" }
      },
      boxShadow: { card: "0 4px 18px rgba(0,0,0,0.06)" },
      borderRadius: { xl: "14px" }
    },
  },
  plugins: [],
}
export default config
