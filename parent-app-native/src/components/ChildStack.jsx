import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useAuth } from '../lib/AuthContext.jsx'
import { colors } from '../lib/theme.js'

const PEEK = 34
const CARD_H = 150

export default function ChildStack() {
  const { kids, activeChildId, setActiveChildId } = useAuth()
  if (!kids || kids.length === 0) return null

  const active = kids.find((k) => k.id === activeChildId) || kids[0]
  const others = kids.filter((k) => k.id !== active.id)
  const order = [active, ...others] // pos 0 = front/active
  const n = order.length

  return (
    <View style={{ height: CARD_H + (n - 1) * PEEK, marginBottom: 16 }}>
      {order.map((k, pos) => {
        const top = (n - 1 - pos) * PEEK
        const z = n - pos
        const initials = k.name.split(' ').map((p) => p[0]).slice(0, 2).join('')
        return (
          <Pressable
            key={k.id}
            onPress={() => setActiveChildId(k.id)}
            style={{
              position: 'absolute',
              top,
              left: 0,
              right: 0,
              height: CARD_H,
              borderRadius: 16,
              backgroundColor: k.school?.brand_color || colors.fillPrimary,
              zIndex: z,
              elevation: pos === 0 ? 6 : 2,
              padding: 16,
              paddingTop: 8
            }}
          >
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Text style={styles.name}>{k.name}</Text>
            </View>
            {pos === 0 && (
              <Text style={styles.sub}>
                {k.school?.name} · {k.className}
              </Text>
            )}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  name: { fontSize: 14, fontWeight: '600', color: '#fff' },
  sub: { marginTop: 10, marginLeft: 30, fontSize: 11, color: 'rgba(255,255,255,0.85)' }
})
