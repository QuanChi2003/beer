
import type { Config } from 'tailwindcss'
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}","./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {
    colors:{ brand:"#f59e0b", beer:{amber:"#f59e0b", foam:"#fff7e6", dark:"#1f2937"} },
    boxShadow:{card:"0 12px 36px rgba(0,0,0,.10)" },
    fontFamily:{ display:['ui-sans-serif','system-ui','-apple-system','Segoe UI','Roboto','Inter','sans-serif'] },
    backgroundImage:{ foam:"radial-gradient(40% 60% at 20% 0%, #fff7e6 0, #fff 100%)", mesh:"radial-gradient(circle at 10% 20%, rgba(255,210,122,.35) 0 20%, transparent 20%), radial-gradient(circle at 90% 10%, rgba(245,158,11,.35) 0 20%, transparent 20%), radial-gradient(circle at 20% 90%, rgba(255,255,255,.5) 0 25%, transparent 25%)" }
  } },
  plugins: [],
}
export default config
