
import type { Config } from 'tailwindcss'
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}","./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {
    colors:{ brand:"#f59e0b", beer:{amber:"#f59e0b", foam:"#fff7e6", dark:"#1f2937"} },
    boxShadow:{card:"0 8px 28px rgba(0,0,0,.08)" },
    fontFamily:{ display:['ui-sans-serif','system-ui','-apple-system','Segoe UI','Roboto','Inter','sans-serif'] },
    backgroundImage:{ foam:"radial-gradient(40% 60% at 20% 0%, #fff7e6 0%, #fff 100%)" }
  } },
  plugins: [],
}
export default config
