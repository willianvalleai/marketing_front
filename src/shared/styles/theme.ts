export const theme = {
  colors: {
    // Backgrounds
    bg: '#f0f2f5',
    surface: '#ffffff',
    surfaceHover: '#fafafa',
    sidebar: '#ffffff',
    sidebarActive: '#f5f3ff',
    sidebarActiveBorder: '#7c3aed',

    // Borders
    border: '#e4e4e7',
    borderStrong: '#d1d5db',

    // Text
    text: '#374151',
    textDark: '#111827',
    textLight: '#6b7280',
    textMuted: '#9ca3af',
    textWhite: '#ffffff',

    // Brand (Violet)
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    primaryLight: '#a78bfa',
    primaryFaint: '#f5f3ff',
    primaryMid: '#ede9fe',

    // Status
    success: '#059669',
    successHover: '#047857',
    successFaint: '#ecfdf5',
    successMid: '#d1fae5',
    successText: '#065f46',

    danger: '#dc2626',
    dangerHover: '#b91c1c',
    dangerFaint: '#fef2f2',
    dangerMid: '#fee2e2',
    dangerText: '#991b1b',

    warning: '#d97706',
    warningHover: '#b45309',
    warningFaint: '#fffbeb',
    warningMid: '#fef3c7',
    warningText: '#92400e',

    info: '#2563eb',
    infoFaint: '#eff6ff',
    infoMid: '#dbeafe',
    infoText: '#1e40af',

    // Extras (legado, não remover)
    panel: '#ffffff',
    panel2: '#f9fafb',
    muted: '#9ca3af',
    mutedDark: '#6b7280',
    successLight: '#6ee7b7',
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
    xs: '0.75rem',
    sm: '0.8125rem',
    md: '0.9375rem',
    lg: '1.0625rem',
    xl: '1.25rem',
    xxl: '1.5rem',
    xxxl: '1.875rem',
    xxxxl: '2.25rem',
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
