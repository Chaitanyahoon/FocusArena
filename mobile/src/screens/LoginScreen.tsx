import React, { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppStore } from '../stores/appStore'
import { mobileTheme } from '../theme'

export default function LoginScreen({ navigation }: any) {
  const { login, authLoading, error, setError } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Enter both email and password.')
      return
    }
    await login({ email, password })
  }

  return (
    <LinearGradient colors={[mobileTheme.background, mobileTheme.backgroundElevated, mobileTheme.background]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.loginWrapper}
      >
        <View style={styles.loginCard}>
          <Text style={styles.eyebrow}>Mobile command center</Text>
          <Text style={styles.heroTitle}>Focus Arena</Text>
          <Text style={styles.loginSubtitle}>
            A tighter daily cockpit for quick check-ins and fast task closure.
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email address"
            placeholderTextColor="rgba(231, 237, 246, 0.28)"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="rgba(231, 237, 246, 0.28)"
            style={styles.input}
          />

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable onPress={handleLogin} disabled={authLoading} style={styles.loginButton}>
            {authLoading ? (
              <ActivityIndicator color={mobileTheme.text} />
            ) : (
              <Text style={styles.loginButtonLabel}>Enter arena</Text>
            )}
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.switchModeButton}>
            <Text style={styles.switchModeText}>Don't have an account? Register</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loginWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  loginCard: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: mobileTheme.border,
    backgroundColor: 'rgba(10, 13, 22, 0.92)',
    padding: 22,
    gap: 14,
  },
  eyebrow: {
    color: mobileTheme.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 8,
    color: mobileTheme.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  loginSubtitle: {
    color: mobileTheme.textMuted,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
    backgroundColor: mobileTheme.panelSoft,
    paddingHorizontal: 16,
    paddingVertical: 14, // Minimum 48px touch target essentially
    color: mobileTheme.text,
    fontSize: 15,
    fontWeight: '600',
    minHeight: 48,
  },
  errorBanner: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.24)',
    backgroundColor: 'rgba(127, 29, 29, 0.28)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    color: '#FECDD3',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  loginButton: {
    marginTop: 6,
    borderRadius: 18,
    backgroundColor: mobileTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52, // Mobile touch target best practices
  },
  loginButtonLabel: {
    color: mobileTheme.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  switchModeButton: {
    marginTop: 8,
    alignItems: 'center',
    padding: 10,
  },
  switchModeText: {
    color: mobileTheme.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
})
