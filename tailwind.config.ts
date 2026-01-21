import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        roblox: {
          red: '#e2231a',
          dark: '#1a1a1a',
        },
      },
    },
  },
  plugins: [],
}
export default config
