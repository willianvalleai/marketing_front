import styled from 'styled-components'

export const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  height: 38px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: rgba(35, 35, 35, 0.5);
  color: ${({ theme }) => theme.colors.textDark};
  font-size: ${({ theme }) => theme.font.md};
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  appearance: auto;

  &:hover:not(:disabled) { border-color: ${({ theme }) => theme.colors.borderMedium}; }
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryFaint};
  }
  &:disabled { opacity: 0.55; cursor: not-allowed; background: ${({ theme }) => theme.colors.surfaceSolid}; }

  option { background: #1a1a1a; color: ${({ theme }) => theme.colors.textDark}; }
`
