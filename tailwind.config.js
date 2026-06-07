/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        dram: {
          bg:      'rgb(var(--dram-bg)      / <alpha-value>)',
          surface: 'rgb(var(--dram-surface) / <alpha-value>)',
          border:  'rgb(var(--dram-border)  / <alpha-value>)',
          blue:    'rgb(var(--dram-blue)    / <alpha-value>)',
          green:   'rgb(var(--dram-green)   / <alpha-value>)',
          amber:   'rgb(var(--dram-amber)   / <alpha-value>)',
          red:     'rgb(var(--dram-red)     / <alpha-value>)',
          purple:  'rgb(var(--dram-purple)  / <alpha-value>)',
          text:    'rgb(var(--dram-text)    / <alpha-value>)',
          muted:   'rgb(var(--dram-muted)   / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}
