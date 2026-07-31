import { View, ActivityIndicator } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuth } from '../src/lib/AuthContext.jsx'
import { colors } from '../src/lib/theme.js'

export default function Index() {
  const { session, kids, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 }}>
        <ActivityIndicator color={colors.fillPrimary} />
      </View>
    )
  }
  if (!session) return <Redirect href="/welcome" />
  if (!kids || kids.length === 0) return <Redirect href="/add-child" />
  return <Redirect href="/(tabs)/home" />
}
