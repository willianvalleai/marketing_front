import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
    font-size: 15px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
  }
  a { color: inherit; text-decoration: none; }
  button, input, select, textarea { font: inherit; }
  img { display: block; max-width: 100%; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors.border}; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: ${({ theme }) => theme.colors.borderStrong}; }
`
