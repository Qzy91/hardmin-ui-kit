import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './projects/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        main_color: '#1a56db',
        bg_primary: '#f8fafc',
      },
    },
  },
  plugins: [],
}

export default config
