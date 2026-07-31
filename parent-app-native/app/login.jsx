import { useState } from 'react'
import { View, Text, TextInput, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import { supabase } from '../src/lib/supabaseClient.js'
import { colors } from '../src/lib/theme.js'
import { PrimaryButton, GhostButton } from '../src/components/ui.jsx'

export default function Login() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit() {
    setError(null)
    setInfo(null)
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setInfo('Account created. If email confirmation is on, check your inbox, then sign in.')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <View style={{ width: '100%', maxWidth: 340 }}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.sub}>
          {mode === 'signin' ? "Sign in to see what's happening at your child's school." : 'Create your parent account.'}
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}

        <PrimaryButton
          title={mode === 'signin' ? 'Sign in' : 'Create account'}
          onPress={handleSubmit}
          busy={busy}
          style={{ marginTop: 4 }}
        />
        <GhostButton
          title={mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
          onPress={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError(null)
            setInfo(null)
          }}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  sub: { fontSize: 13, color: colors.textSecondary, marginBottom: 20 },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: colors.surface1,
    color: colors.textPrimary
  },
  error: { fontSize: 12, color: colors.textDanger, marginTop: 12 },
  info: { fontSize: 12, color: colors.textSuccess, marginTop: 12 }
})
