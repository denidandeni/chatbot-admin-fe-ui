import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)'],
      },
      colors: {
        'input-bg': '#EEF6FF',
        primary: 'var(--color-primary)',
        'primary-foreground': 'var(--color-primary-foreground)',
        surface: 'var(--color-surface)',
        'surface-foreground': 'var(--color-surface-foreground)',
        border: 'var(--color-border)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
      },
      spacing: {
        'page': 'var(--padding-page)',
      },
    },
  },
  plugins: [],
}
export default config
