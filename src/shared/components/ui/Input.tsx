import styled from 'styled-components'

const inputBase = `
  width: 100%;
  border-radius: 8px;
  border: 1.5px solid;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  background: #fff;
`

export const Input = styled.input`
  ${inputBase}
  padding: 8px 12px;
  font-size: 0.9375rem;
  border-color: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textDark};
  height: 38px;

  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  &:hover:not(:disabled) { border-color: ${({ theme }) => theme.colors.borderStrong}; }
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }
  &:disabled { opacity: 0.55; cursor: not-allowed; background: ${({ theme }) => theme.colors.bg}; }
`

export const Textarea = styled.textarea`
  ${inputBase}
  padding: 8px 12px;
  font-size: 0.9375rem;
  border-color: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textDark};
  min-height: 90px;
  resize: vertical;
  line-height: 1.6;

  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  &:hover:not(:disabled) { border-color: ${({ theme }) => theme.colors.borderStrong}; }
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }
  &:disabled { opacity: 0.55; cursor: not-allowed; background: ${({ theme }) => theme.colors.bg}; }
`
