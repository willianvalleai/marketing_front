import styled, { css } from 'styled-components'

export const Badge = styled.span<{ $variant?: 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'default' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.font.xs};
  font-weight: ${({ theme }) => theme.weights.semibold};
  letter-spacing: 0.01em;

  ${({ $variant = 'default', theme }) => {
    const map = {
      success: css`background: ${theme.colors.successMid}; color: ${theme.colors.successText};`,
      warning: css`background: ${theme.colors.warningMid}; color: ${theme.colors.warningText};`,
      danger: css`background: ${theme.colors.dangerMid}; color: ${theme.colors.dangerText};`,
      info: css`background: ${theme.colors.infoMid}; color: ${theme.colors.infoText};`,
      purple: css`background: ${theme.colors.primaryMid}; color: ${theme.colors.primary};`,
      default: css`background: ${theme.colors.bg}; color: ${theme.colors.textLight}; border: 1px solid ${theme.colors.border};`,
    }
    return map[$variant]
  }}
`
