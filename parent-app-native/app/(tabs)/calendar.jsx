import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Linking, Share, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../src/lib/supabaseClient.js'
import { useAuth } from '../../src/lib/AuthContext.jsx'
import { colors } from '../../src/lib/theme.js'
import ChildBanner from '../../src/components/ChildBanner.jsx'
import { Card, PrimaryButton, GhostButton, EmptyState } from '../../src/components/ui.jsx'

const FEED_BASE = 'https://xjlcvzmkihuqvpbafpdg.supabase.co/functions/v1/calendar-feed'

export default function CalendarPage() {
  const { user, activeChild } = useAuth()
  const [events, setEvents] = useState([])
  const [feedUrl, setFeedUrl] = useState(null)
  const [showSubscribe, setShowSubscribe] = useState(false)

  useEffect(() => {
    if (!activeChild?.school) return
    supabase
      .from('events')
      .select('*')
      .eq('school_id', activeChild.school.id)
      .order('starts_at', { ascending: true })
      .then(({ data }) => setEvents(data || []))
  }, [activeChild])

  async function getFeedUrl() {
    let { data } = await supabase.from('calendar_feed_tokens').select('token').eq('parent_id', user.id).maybeSingle()
    if (!data) {
      const { data: inserted } = await supabase.from('calendar_feed_tokens').insert({ parent_id: user.id }).select('token').single()
      data = inserted
    }
    setFeedUrl(`${FEED_BASE}?token=${data.token}`)
    setShowSubscribe(true)
  }

  // On iOS, the webcal:// scheme tells the OS to open Calendar and subscribe
  // directly, one tap. On Android it falls back to sharing the link so it
  // can be added in Google Calendar > Settings > Add calendar > From URL.
  function subscribeNow() {
    const webcalUrl = feedUrl.replace(/^https?:\/\//, 'webcal://')
    Linking.openURL(webcalUrl).catch(() => Share.share({ message: feedUrl }))
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface2 }}>
      <ChildBanner />
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Card>
          {!showSubscribe ? (
            <PrimaryButton title="Subscribe with your calendar app" onPress={getFeedUrl} />
          ) : (
            <View>
              <Text style={styles.subTitle}>Your personal calendar link is ready</Text>
              <Text style={styles.subBody}>
                Add this as a subscribed calendar and new events appear automatically — no need to add each one by hand.
              </Text>
              <PrimaryButton title="Open in Calendar app" onPress={subscribeNow} />
              <GhostButton title="Share link instead" onPress={() => Share.share({ message: feedUrl })} />
            </View>
          )}
        </Card>

        {events.map((e) => (
          <Card key={e.id}>
            <Text style={styles.eventTitle}>{e.title}</Text>
            <Text style={styles.eventDate}>{new Date(e.starts_at).toLocaleString()}</Text>
            {e.attachment_url && (
              <Text
                style={styles.attachment}
                onPress={() => Linking.openURL(e.attachment_url)}
              >
                <Ionicons name="attach-outline" size={12} /> {e.attachment_name}
              </Text>
            )}
          </Card>
        ))}
        {events.length === 0 && <EmptyState>Nothing scheduled.</EmptyState>}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  subTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  subBody: { fontSize: 12, color: colors.textSecondary, marginBottom: 12 },
  eventTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  eventDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  attachment: { fontSize: 12, color: colors.textAccent, marginTop: 8 }
})
