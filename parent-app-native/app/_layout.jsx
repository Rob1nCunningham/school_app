import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '../src/lib/AuthContext.jsx'
import { colors } from '../src/lib/theme.js'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: colors.surface1 },
            headerTitleStyle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
            headerTintColor: colors.textAccent,
            contentStyle: { backgroundColor: colors.surface2 }
          }}
        />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
