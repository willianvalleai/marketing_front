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
    color: #131313;
    font-weight: ${({ theme }) => theme.weights.medium};
    box-shadow: 0 0 20px rgba(143, 216, 255, 0.3);
    &:hover:not(:disabled) { 
      background: ${({ theme }) => theme.colors.primaryHover}; 
      box-shadow: 0 0 25px rgba(173, 198, 255, 0.4);
    }
  }

  /* secondary */
  &[data-variant='secondary'] {
    background: ${({ theme }) => theme.colors.surfaceSolid};
    border-color: transparent;
    color: ${({ theme }) => theme.colors.textDark};
    &:hover:not(:disabled) { 
      background: rgba(42, 42, 42, 0.8); 
    }
  }

  /* ghost */
  &[data-variant='ghost'] {
    background: transparent;
    color: ${({ theme }) => theme.colors.textLight};
    &:hover:not(:disabled) { background: rgba(255, 255, 255, 0.05); }
  }

  /* danger */
  &[data-variant='danger'] {
    background: ${({ theme }) => theme.colors.dangerFaint};
    border-color: ${({ theme }) => theme.colors.borderStrong};
    color: ${({ theme }) => theme.colors.dangerText};
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.dangerMid}; }
  }

  /* danger-filled */
  &[data-variant='danger-filled'] {
    background: ${({ theme }) => theme.colors.danger};
    color: #131313;
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.dangerHover}; }
  }
`
