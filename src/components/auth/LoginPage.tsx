import { useState } from 'react'
import type { FormEvent } from 'react'
import { LockKeyhole } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Field, FieldGroup, FieldLabel } from '../ui/Field'
import { Input } from '../ui/FormControls'

type LoginPageProps = {
  error: string | null
  isLoading: boolean
  onSignIn: (email: string, password: string) => Promise<void>
}

export function LoginPage({ error, isLoading, onSignIn }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSignIn(email, password)
  }

  return (
    <main className="login-shell">
      <Card className="login-card">
        <CardHeader>
          <div className="login-card__icon">
            <LockKeyhole aria-hidden="true" />
          </div>
          <CardTitle>Spielejournal anmelden</CardTitle>
          <CardDescription>Bitte melde dich mit deinem Supabase-Nutzer an.</CardDescription>
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
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Passwort</FieldLabel>
                <Input
                  autoComplete="current-password"
                  id="password"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </Field>
            </FieldGroup>
            {error ? <div className="app-alert">{error}</div> : null}
            <Button disabled={isLoading} type="submit">
              {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

