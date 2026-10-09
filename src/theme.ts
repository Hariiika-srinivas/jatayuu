/**
 * JATAYU Command Center Theme Tokens
 * Team: IGNITE | Hackathon: VISTERA 2026
 * Centralized theme file for all command center color tokens, data colors, and typography.
 */

export const THEME = {
  colors: {
    bg: '#070708',
    surface: '#0F0F12',
    surface2: '#17171C',
    border: '#26262E',
    text: '#F4F4F5',
    textMuted: '#A1A1AA',
    brand: '#E10600',
    brandHover: '#FF2A1F',
    brandDeep: '#7A0A0A',
    brandGlow: 'rgba(225, 6, 0, 0.35)',
  },
  // Distinct data colors: Never rely on red alone
  dataColors: {
    severity: {
      CRITICAL: '#FF1744',
      HIGH: '#FF8F00',
      MODERATE: '#FFD600',
      LOW: '#00E676',
    },
    flood: {
      fill: 'rgba(0, 184, 212, 0.45)', // #00B8D4 at 45%
      outline: '#4DD0E1',
      sentinel1: '#00E5FF',
      nisar: '#B388FF', // violet for L-band
      gfm: '#00BFA5',   // teal for Copernicus GFM
    },
    damageClasses: {
      'no-damage': '#00E676',
      'minor': '#FFD600',
      'major': '#FF8F00',
      'destroyed': '#FF1744',
    },
    sourceStatus: {
      REAL: '#00E676',
      CACHED: '#FFB300',
      MOCK: '#71717A',
    },
  },
  fonts: {
    heading: "'Rajdhani', 'Orbitron', -apple-system, sans-serif",
    display: "'Orbitron', 'Rajdhani', monospace",
    body: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
} as const;

export type SeverityLevel = keyof typeof THEME.dataColors.severity;
export type DamageClass = keyof typeof THEME.dataColors.damageClasses;
export type DataSourceStatus = keyof typeof THEME.dataColors.sourceStatus;
