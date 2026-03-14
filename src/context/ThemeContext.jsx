import { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

// ─── Theme Definitions ────────────────────────────────────────────
export const themes = {
  programming: {
    name: 'programming',
    label: 'البرمجة',
    // Core colors (RGB format for Tailwind opacity support)
    primary:        '0 212 170',     // #00d4aa
    primaryDark:    '0 168 132',     // #00a884
    primaryGlow:    'rgba(0, 212, 170, 0.4)',
    accent:         '0 255 136',     // #00ff88
    accentSecond:   '14 165 233',    // #0ea5e9
    // Background gradient
    bgFrom:    'rgba(0, 212, 170, 0.12)',
    bgMid:     'rgba(14, 165, 233, 0.08)',
    bgTo:      'rgba(0, 255, 136, 0.06)',
    // UI states
    cardBorder:     'rgba(0, 212, 170, 0.2)',
    cardBorderHover:'rgba(0, 212, 170, 0.6)',
    // Body tint
    bodyBg:  '#021a14',
    // Particle / canvas color
    particleColor:  '#00d4aa',
    type: 'matrix',
  },
  networks: {
    name: 'networks',
    label: 'الشبكات',
    primary:        '14 165 233',    // #0ea5e9
    primaryDark:    '2 132 199',     // #0284c7
    primaryGlow:    'rgba(14, 165, 233, 0.4)',
    accent:         '56 189 248',    // #38bdf8
    accentSecond:   '129 140 248',   // #818cf8
    bgFrom:    'rgba(14, 165, 233, 0.12)',
    bgMid:     'rgba(56, 189, 248, 0.07)',
    bgTo:      'rgba(99, 102, 241, 0.06)',
    cardBorder:     'rgba(14, 165, 233, 0.2)',
    cardBorderHover:'rgba(14, 165, 233, 0.6)',
    bodyBg:  '#020c1a',
    particleColor:  '#0ea5e9',
    type: 'nodes',
  },
  communications: {
    name: 'communications',
    label: 'الاتصالات',
    primary:        '249 115 22',    // #f97316
    primaryDark:    '234 88 12',     // #ea580c
    primaryGlow:    'rgba(249, 115, 22, 0.4)',
    accent:         '251 146 60',    // #fb923c
    accentSecond:   '192 132 252',   // #c084fc
    bgFrom:    'rgba(249, 115, 22, 0.12)',
    bgMid:     'rgba(192, 132, 252, 0.09)',
    bgTo:      'rgba(251, 146, 60, 0.06)',
    cardBorder:     'rgba(249, 115, 22, 0.2)',
    cardBorderHover:'rgba(249, 115, 22, 0.6)',
    bodyBg:  '#140a00',
    particleColor:  '#f97316',
    type: 'waves',
  },
  // default fallback (no dept selected yet)
  default: {
    name: 'default',
    primary:        '99 102 241',    // #6366f1
    primaryDark:    '79 70 229',     // #4f46e5
    primaryGlow:    'rgba(99, 102, 241, 0.4)',
    accent:         '129 140 248',   // #818cf8
    accentSecond:   '167 139 250',   // #a78bfa
    bgFrom:    'rgba(99, 102, 241, 0.15)',
    bgMid:     'rgba(139, 92, 246, 0.10)',
    bgTo:      'rgba(236, 72, 153, 0.08)',
    cardBorder:     'rgba(99, 102, 241, 0.2)',
    cardBorderHover:'rgba(99, 102, 241, 0.5)',
    bodyBg:  '#0f172a',
    particleColor:  '#6366f1',
    type: 'default',
  },
};

// Apply CSS variables to :root
const applyTheme = (theme) => {
  const root = document.documentElement;
  root.style.setProperty('--theme-primary',         theme.primary);
  root.style.setProperty('--theme-primary-dark',    theme.primaryDark);
  root.style.setProperty('--theme-primary-glow',    theme.primaryGlow);
  root.style.setProperty('--theme-accent',          theme.accent);
  root.style.setProperty('--theme-accent-second',   theme.accentSecond);
  root.style.setProperty('--theme-bg-from',         theme.bgFrom);
  root.style.setProperty('--theme-bg-mid',          theme.bgMid);
  root.style.setProperty('--theme-bg-to',           theme.bgTo);
  root.style.setProperty('--theme-card-border',     theme.cardBorder);
  root.style.setProperty('--theme-card-border-hover', theme.cardBorderHover);
  root.style.setProperty('--theme-body-bg',         theme.bodyBg);
  root.style.setProperty('--theme-particle-color',  theme.particleColor);

  // Apply body bg
  document.body.style.backgroundColor = theme.bodyBg;

  // Set theme class on body
  document.body.className = document.body.className
    .replace(/\btheme-\w+\b/g, '')
    .trim();
  document.body.classList.add(`theme-${theme.name}`);
};

// ─── Provider ─────────────────────────────────────────────────────
export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const dept = user?.department;
  const theme = themes[dept] || themes.default;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
