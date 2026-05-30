export const theme = {
  colors: {
    // Backgrounds
    bg: '#131313',
    bgSecondary: '#1a1a1a',
    surface: 'rgba(25, 25, 25, 0.4)',
    surfaceHover: 'rgba(35, 35, 35, 0.5)',
    surfaceSolid: '#2a2a2a',
    sidebar: '#131313',
    sidebarActive: 'rgba(143, 216, 255, 0.1)',
    sidebarActiveBorder: '#8fd8ff',

    // Borders
    border: 'rgba(255, 255, 255, 0.05)',
    borderStrong: 'rgba(65, 71, 85, 0.2)',
    borderMedium: 'rgba(255, 255, 255, 0.1)',

    // Text
    text: '#8b90a0',
    textDark: '#e2e2e2',
    textLight: '#8b90a0',
    textMuted: '#6b7280',
    textWhite: '#ffffff',

    // Brand (Cyan from Figma)
    primary: '#8fd8ff',
    primaryHover: '#adc6ff',
    primaryLight: '#c2c1ff',
    primaryFaint: 'rgba(143, 216, 255, 0.1)',
    primaryMid: 'rgba(143, 216, 255, 0.2)',

    // Status
    success: '#10b981',
    successHover: '#059669',
    successFaint: 'rgba(16, 185, 129, 0.1)',
    successMid: 'rgba(16, 185, 129, 0.2)',
    successText: '#6ee7b7',

    danger: '#ffb4ab',
    dangerHover: '#ff9b8f',
    dangerFaint: 'rgba(147, 0, 10, 0.1)',
    dangerMid: 'rgba(147, 0, 10, 0.2)',
    dangerText: '#ffb4ab',

    warning: '#f59e0b',
    warningHover: '#d97706',
    warningFaint: 'rgba(245, 158, 11, 0.1)',
    warningMid: 'rgba(245, 158, 11, 0.2)',
    warningText: '#fbbf24',

    info: '#adc6ff',
    infoFaint: 'rgba(173, 198, 255, 0.1)',
    infoMid: 'rgba(173, 198, 255, 0.2)',
    infoText: '#adc6ff',

    // Extras (legado, não remover)
    panel: 'rgba(25, 25, 25, 0.4)',
    panel2: '#1a1a1a',
    muted: '#8b90a0',
    mutedDark: '#6b7280',
    successLight: '#6ee7b7',

    // Kanban specific
    kanbanTodo: '#adc6ff',
    kanbanInProgress: '#8fd8ff',
    kanbanReview: '#c2c1ff',
    kanbanChanges: '#ffb4ab',
    kanbanDone: '#10b981',
  },
  radii: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    xxl: '24px',
    pill: '9999px',
  },
  shadow: {
    none: 'none',
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
    md: '0 4px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
    lg: '0 12px 20px -4px rgb(0 0 0 / 0.10), 0 4px 8px -4px rgb(0 0 0 / 0.06)',
    xl: '0 24px 40px -8px rgb(0 0 0 / 0.12), 0 8px 16px -6px rgb(0 0 0 / 0.06)',
    card: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
    focus: '0 0 0 3px rgba(124, 58, 237, 0.18)',
  },
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    xxxxl: 48,
  },
  font: {
    xs: '0.625rem',     // 10px (era 11px)
    sm: '0.6875rem',    // 11px (era 12px)
    md: '0.75rem',      // 12px (era 13px)
    lg: '0.8125rem',    // 13px (era 15px)
    xl: '0.9375rem',    // 15px (era 17px)
    xxl: '1.0625rem',   // 17px (era 20px)
    xxxl: '1.25rem',    // 20px (era 24px)
    xxxxl: '1.5rem',    // 24px (era 30px)
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
} as const

export type AppTheme = typeof theme
