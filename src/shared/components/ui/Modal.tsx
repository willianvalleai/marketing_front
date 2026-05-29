import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 1000;
`

const Panel = styled.div`
  width: min(920px, 100%);
  max-height: min(86vh, 920px);
  overflow: auto;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadow.lg};
`

const Header = styled.div`
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  z-index: 1;
`

const Title = styled.div`
  font-size: ${({ theme }) => theme.font.md};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
`

const Body = styled.div`
  padding: 16px 18px;
`

const Footer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 12px 18px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <Backdrop onMouseDown={onClose} role="dialog" aria-modal="true">
      <Panel onMouseDown={(e) => e.stopPropagation()}>
        {(title ?? footer) && (
          <Header>
            <Title>{title ?? ''}</Title>
            <button
              onClick={onClose}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'inherit',
                fontSize: 16,
                opacity: 0.7,
              }}
              aria-label="Fechar"
              type="button"
            >
              ×
            </button>
          </Header>
        )}
        <Body>{children}</Body>
        {footer && <Footer>{footer}</Footer>}
      </Panel>
    </Backdrop>,
    document.body,
  )
}

