import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

type AuthResult = {
  message?: string
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(supabase))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return undefined

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      setSession(data.session)
      setError(sessionError?.message ?? null)
      setIsLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return {}
    setIsLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setError(signInError?.message ?? null)
    setIsLoading(false)

    return signInError ? {} : { message: 'Du bist angemeldet.' }
  }, [])

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return {}
    setIsLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    setError(signUpError?.message ?? null)
    setIsLoading(false)

    if (signUpError) return {}
    if (!data.session) {
      return { message: 'Konto angelegt. Bitte bestätige deine E-Mail, falls Supabase eine Bestätigung verlangt.' }
    }

    return { message: 'Konto angelegt. Du bist angemeldet.' }
  }, [])

  const sendMagicLink = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return {}
    setIsLoading(true)
    setError(null)

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: window.location.origin,
      },
    })
    setError(otpError?.message ?? null)
    setIsLoading(false)

    return otpError ? {} : { message: 'Login-Link gesendet. Öffne die E-Mail auf diesem Gerät.' }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
  }, [])

  return {
    session,
    user: session?.user ?? null,
    isLoading,
    error,
    signIn,
    signUp,
    sendMagicLink,
    signOut,
  }
}
