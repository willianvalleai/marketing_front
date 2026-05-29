import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useAuth } from '@/app/providers/AuthContext'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Zap, Mail, Lock, AlertCircle } from 'lucide-react'

const Page = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: ${({ theme }) => theme.colors.bg};

  @media (max-width: 900px) { grid-template-columns: 1fr; }
`

/* ── Left panel ────────────────────────────────────── */
const Left = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 60px 64px;
  position: relative;
  overflow: hidden;

  @media (max-width: 900px) { display: none; }

  /* decorative circles */
  &::before, &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
  }
  &::before { width: 420px; height: 420px; right: -120px; bottom: -80px; }
  &::after  { width: 240px; height: 240px; right: 60px; top: -60px; }
`

const LeftInner = styled.div`
  position: relative;
  z-index: 1;
  max-width: 440px;
`

const LeftLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 56px;
`

const LeftLogoMark = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: ${({ theme }) => theme.radii.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  svg { width: 20px; height: 20px; color: white; }
`

const LeftLogoText = styled.span`
  font-size: ${({ theme }) => theme.font.xl};
  font-weight: ${({ theme }) => theme.weights.bold};
  color: rgba(255,255,255,0.95);
`

const LeftHeading = styled.h1`
  font-size: 2.25rem;
  font-weight: ${({ theme }) => theme.weights.extrabold};
  color: white;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
`

const LeftSub = styled.p`
  font-size: ${({ theme }) => theme.font.md};
  color: rgba(255,255,255,0.75);
  line-height: 1.7;
  margin-bottom: 40px;
`

const FeatureList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: ${({ theme }) => theme.font.sm};
  color: rgba(255,255,255,0.85);

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.6);
    flex-shrink: 0;
  }
`

/* ── Right panel ────────────────────────────────────── */
const Right = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  background: ${({ theme }) => theme.colors.surface};
`

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Form = styled.div`
  width: 100%;
  max-width: 380px;
  animation: ${fadeUp} 0.4s ease both;
`

const FormTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.xxxl};
  font-weight: ${({ theme }) => theme.weights.extrabold};
  color: ${({ theme }) => theme.colors.textDark};
  letter-spacing: -0.02em;
  margin-bottom: 6px;
`

const FormSub = styled.p`
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 36px;
`

const Fields = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Label = styled.label`
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.medium};
  color: ${({ theme }) => theme.colors.textDark};
`

const InputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 11px;
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.textMuted};
    pointer-events: none;
  }

  input {
    padding-left: 36px;
  }
`

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.dangerFaint};
  border: 1px solid ${({ theme }) => theme.colors.dangerMid};
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.font.sm};
  svg { width: 15px; height: 15px; flex-shrink: 0; }
`

const SubmitBtn = styled(Button)`
  width: 100%;
  margin-top: 4px;
`

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 24px 0;
`

const HintRow = styled.p`
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  line-height: 1.7;

  strong {
    color: ${({ theme }) => theme.colors.textLight};
    font-weight: ${({ theme }) => theme.weights.medium};
  }
`

export function LoginPage() {
  const nav = useNavigate()
  const { status, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') nav('/home', { replace: true })
  }, [status, nav])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      nav('/home', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page>
      <Left>
        <LeftInner>
          <LeftLogo>
            <LeftLogoMark><Zap /></LeftLogoMark>
            <LeftLogoText>Marketing Hub</LeftLogoText>
          </LeftLogo>
          <LeftHeading>Gerencie projetos com clareza</LeftHeading>
          <LeftSub>
            Uma plataforma completa para sua equipe de marketing: Kanban, chat em tempo real e controle de projetos num só lugar.
          </LeftSub>
          <FeatureList>
            <FeatureItem>Kanban drag-and-drop estilo Jira</FeatureItem>
            <FeatureItem>Chat em tempo real por canais e DMs</FeatureItem>
            <FeatureItem>Controle de projetos e clientes</FeatureItem>
            <FeatureItem>Administração completa de equipe</FeatureItem>
          </FeatureList>
        </LeftInner>
      </Left>

      <Right>
        <Form>
          <FormTitle>Entrar</FormTitle>
          <FormSub>Acesse sua conta para continuar</FormSub>

          <Fields onSubmit={onSubmit}>
            <FieldGroup>
              <Label htmlFor="email">E-mail</Label>
              <InputWrap>
                <Mail />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </InputWrap>
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="password">Senha</Label>
              <InputWrap>
                <Lock />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </InputWrap>
            </FieldGroup>

            {error && (
              <ErrorBanner>
                <AlertCircle />
                {error}
              </ErrorBanner>
            )}

            <SubmitBtn
              data-variant="primary"
              data-size="lg"
              data-loading={loading ? 'true' : 'false'}
              disabled={loading}
            >
              {loading ? 'Entrando…' : 'Entrar na conta'}
            </SubmitBtn>
          </Fields>

          <Divider />
          <HintRow>
            <strong>Admin:</strong> admin@marketing.com · admin123<br />
            <strong>Colab:</strong> carlos@marketing.com · colab123
          </HintRow>
        </Form>
      </Right>
    </Page>
  )
}
