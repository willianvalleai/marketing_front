import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  to { transform: rotate(360deg); }
`

export const Spinner = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 3px solid rgba(148, 163, 184, 0.25);
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: ${spin} 0.8s linear infinite;
`

const Center = styled.div`
  min-height: 70vh;
  display: grid;
  place-items: center;
`

export function CenterSpinner() {
  return (
    <Center>
      <Spinner />
    </Center>
  )
}

export function FullscreenSpinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <Spinner />
    </div>
  )
}

