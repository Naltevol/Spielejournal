import { useState } from 'react'
import type { FormEvent } from 'react'
import { LockKeyhole, UserPlus } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../ui/Field'
import { Input } from '../ui/FormControls'

type AuthResult = {
  message?: string
}

type LoginPageProps = {
  error: string | null
  isLoading: boolean
  onSignIn: (email: string, password: string) => Promise<AuthResult>
  onSignUp: (email: string, password: string) => Promise<AuthResult>
  onSendMagicLink: (email: string) => Promise<AuthResult>
}

export function LoginPage({
  error,
  isLoading,
  onSignIn,
  onSignUp,
  onSendMagicLink,
}: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [message, setMessage] = useState<string | null>(null)

  const isSignUp = mode === 'sign-up'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setMessage(null)

    const result = isSignUp
      ? await onSignUp(email.trim(), password)
      : await onSignIn(email.trim(), password)

    setMessage(result.message ?? null)
  }

  async function handleMagicLink() {
    setMessage(null)
    const result = await onSendMagicLink(email.trim())
    setMessage(result.message ?? null)
  }

  return (
    <main className="login-shell">
      <Card className="login-card">
        <CardHeader>
          <div className="login-card__icon">
            {isSignUp ? <UserPlus aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
          </div>
          <CardTitle>{isSignUp ? 'App-Konto erstellen' : 'Spielejournal anmelden'}</CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Lege einen eigenen App-Login mit E-Mail und Passwort an.'
              : 'Melde dich mit deinem Spielejournal-App-Konto an.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="entry-form" onSubmit={handleSubmit}>
            <FieldGroup className="field-group--single">
              <Field>
                <FieldLabel htmlFor="email">E-Mail</FieldLabel>
                <Input
                  autoComplete="email"
                  id="email"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
                <FieldDescription>
                  Dein GitHub-Login für das Supabase-Dashboard ist davon getrennt.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Passwort</FieldLabel>
                <Input
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  id="password"
                  minLength={6}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </Field>
            </FieldGroup>
            {error ? <div className="app-alert">{error}</div> : null}
            {message ? <div className="app-notice">{message}</div> : null}
            <Button disabled={isLoading} type="submit">
              {isLoading ? 'Bitte warten...' : isSignUp ? 'Konto erstellen' : 'Anmelden'}
            </Button>
            {!isSignUp ? (
              <Button
                disabled={isLoading || !email.trim()}
                onClick={handleMagicLink}
                type="button"
                variant="secondary"
              >
                Login-Link per E-Mail senden
              </Button>
            ) : null}
            <Button
              disabled={isLoading}
              onClick={() => {
                setMode(isSignUp ? 'sign-in' : 'sign-up')
                setMessage(null)
              }}
              type="button"
              variant="ghost"
            >
              {isSignUp ? 'Ich habe schon ein Konto' : 'Eigenes App-Konto erstellen'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
