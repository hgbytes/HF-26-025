/**
 * MedChain TN – Premium Healthcare Design System
 *
 * Palette: soft whites, cool slate greys, blue-teal accents.
 * Shadows are ultra-subtle. Radii are generous. Typography is crisp.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0891b2';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#0f172a',
    background: '#f8fafc',
    tint: tintColorLight,
    icon: '#64748b',
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

/* ─── Shared Design Tokens ──────────────────────────────── */
export const HC = {
  /* Primary palette – blue-teal */
  primary:      '#0891b2',
  primaryDark:  '#0e7490',
  primaryLight: '#cffafe',
  primaryFaint: '#f0fdfa',
  accent:       '#06b6d4',

  /* Surfaces */
  bg:           '#f8fafc',
  card:         '#ffffff',
  cardHover:    '#f1f5f9',

  /* Borders */
  border:       '#e2e8f0',
  borderLight:  '#f1f5f9',
  borderFocus:  '#0891b2',

  /* Text hierarchy */
  text:         '#0f172a',
  textSecondary:'#475569',
  textMuted:    '#94a3b8',
  textInverse:  '#ffffff',

  /* Semantic */
  success:      '#059669',
  successLight: '#d1fae5',
  successBg:    '#ecfdf5',
  warning:      '#d97706',
  warningLight: '#fef3c7',
  warningBg:    '#fffbeb',
  danger:       '#dc2626',
  dangerLight:  '#fee2e2',
  dangerBg:     '#fef2f2',
  info:         '#0284c7',
  infoBg:       '#e0f2fe',

  /* Radii */
  radius:       16,
  radiusSm:     10,
  radiusMd:     14,
  radiusLg:     20,
  radiusFull:   999,

  /* Spacing scale */
  sp1: 4,
  sp2: 8,
  sp3: 12,
  sp4: 16,
  sp5: 20,
  sp6: 24,
  sp8: 32,
} as const;

/* Backward-compatible alias */
export const MFG = {
  ...HC,
  primaryFaint: HC.primaryFaint,
  radiusLg:     HC.radiusLg,
} as const;

/* ─── Role Accent Colours ──────────────────────────────── */
export const RoleColors = {
  manufacturer: { accent: '#0891b2', accentBg: '#ecfeff', gradient: ['#0891b2', '#06b6d4'] as const },
  distributor:  { accent: '#7c3aed', accentBg: '#f5f3ff', gradient: ['#7c3aed', '#a78bfa'] as const },
  patient:      { accent: '#059669', accentBg: '#ecfdf5', gradient: ['#059669', '#34d399'] as const },
} as const;

/* ─── Elevation / Shadows ──────────────────────────────── */
export const CardShadow = {
  shadowColor: '#94a3b8',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
} as const;

export const CardShadowMd = {
  shadowColor: '#64748b',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 4,
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
