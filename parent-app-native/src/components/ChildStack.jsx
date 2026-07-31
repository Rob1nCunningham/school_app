import { View, Text, Pressable, Linking, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
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
              paddingTop: 14,
              justifyContent: 'space-between'
            }}
          >
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={18} color={k.school?.brand_color || colors.fillPrimary} />
              </View>
              <View>
                <Text style={styles.name}>{k.name}</Text>
                {pos === 0 && (
                  <Text style={styles.sub}>
                    {k.school?.name} · {k.className}
                  </Text>
                )}
              </View>
            </View>

            {pos === 0 && k.school?.website_url && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.()
                  Linking.openURL(k.school.website_url)
                }}
                style={styles.websiteButton}
              >
                <Text style={styles.websiteButtonText}>Visit school website</Text>
                <Ionicons name="open-outline" size={14} color="#fff" />
              </Pressable>
            )}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  name: { fontSize: 14, fontWeight: '600', color: '#fff' },
  sub: { marginTop: 2, fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  websiteButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },
  websiteButtonText: { color: '#fff', fontSize: 12, fontWeight: '500' }
})
