import styled from 'styled-components'

export const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  height: 38px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textDark};
  font-size: ${({ theme }) => theme.font.md};
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  appearance: auto;

  &:hover:not(:disabled) { border-color: ${({ theme }) => theme.colors.borderStrong}; }
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }
  &:disabled { opacity: 0.55; cursor: not-allowed; background: ${({ theme }) => theme.colors.bg}; }

  option { background: ${({ theme }) => theme.colors.surface}; }
`
