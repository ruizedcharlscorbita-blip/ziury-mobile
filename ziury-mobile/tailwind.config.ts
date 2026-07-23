import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Surfaces
        background: '#fafafa',
        surface: '#ffffff',
        surfaceMuted: '#f3f4f6',
        border: '#e5e7eb',
        // Text
        primary: '#111827',
        secondary: '#6b7280',
        tertiary: '#9ca3af',
        // Brand
        accent: '#6366f1',
        accentMuted: '#a5b4fc',
        accentSoft: '#eef2ff',
        // Status
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        // Note colors
        noteYellow: '#fef9c3',
        noteGreen: '#d1fae5',
        noteBlue: '#dbeafe',
        notePink: '#fce7f3',
        notePurple: '#ede9fe',
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '16px',
        xl: '24px',
      },
      fontFamily: {
        sans: ['System'],
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
