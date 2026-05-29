import styled, { css } from 'styled-components'

const base = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid transparent;
  font-weight: ${({ theme }) => theme.weights.medium};
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.1s, opacity 0.15s;
  white-space: nowrap;
  user-select: none;
  outline: none;
  svg { width: 15px; height: 15px; flex-shrink: 0; }
  &:active:not(:disabled) { transform: scale(0.97); }
  &:disabled { opacity: 0.45; cursor: not-allowed; pointer-events: none; }
  &[data-loading='true'] { opacity: 0.65; pointer-events: none; }
  &:focus-visible { box-shadow: ${({ theme }) => theme.shadow.focus}; }
`

const sm = css`
  padding: 5px 12px;
  font-size: ${({ theme }) => theme.font.sm};
  height: 30px;
`
const md = css`
  padding: 7px 16px;
  font-size: ${({ theme }) => theme.font.sm};
  height: 36px;
`
const lg = css`
  padding: 9px 20px;
  font-size: ${({ theme }) => theme.font.md};
  height: 42px;
`

export const Button = styled.button`
  ${base}
  ${md}
  &[data-size='sm'] { ${sm} }
  &[data-size='md'] { ${md} }
  &[data-size='lg'] { ${lg} }

  /* primary */
  &[data-variant='primary'] {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primaryHover}; }
  }

  /* secondary */
  &[data-variant='secondary'] {
    background: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textDark};
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.bg}; border-color: ${({ theme }) => theme.colors.borderStrong}; }
  }

  /* ghost */
  &[data-variant='ghost'] {
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.bg}; }
  }

  /* danger */
  &[data-variant='danger'] {
    background: ${({ theme }) => theme.colors.dangerFaint};
    border-color: ${({ theme }) => theme.colors.dangerMid};
    color: ${({ theme }) => theme.colors.danger};
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.dangerMid}; border-color: ${({ theme }) => theme.colors.danger}; }
  }

  /* danger-filled */
  &[data-variant='danger-filled'] {
    background: ${({ theme }) => theme.colors.danger};
    color: white;
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.dangerHover}; }
  }
`
