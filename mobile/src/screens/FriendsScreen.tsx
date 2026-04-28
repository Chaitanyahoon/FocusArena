import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFriendStore } from '../stores/friendStore'
import { mobileTheme } from '../theme'
import type { FriendEntry } from '../types'

type FriendTab = 'friends' | 'requests'

export default function FriendsScreen() {
  const [tab, setTab] = useState<FriendTab>('friends')
  const { friends, requests, isLoading, error, fetchFriends, fetchRequests, respond, removeFriend } = useFriendStore()

  useEffect(() => { fetchFriends(); fetchRequests() }, [fetchFriends, fetchRequests])

  const handleRemove = (entry: FriendEntry) => {
    Alert.alert('Remove Hunter', `Remove ${entry.name} from your network?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFriend(entry.id) },
    ])
  }

  const levelColor = (lvl: number) => lvl >= 25 ? '#FFD700' : lvl >= 10 ? mobileTheme.accent : mobileTheme.success

  const renderFriend = ({ item }: { item: FriendEntry }) => (
    <View style={s.row}>
      <LinearGradient colors={[`${levelColor(item.level)}30`, 'rgba(0,0,0,0.3)']} style={s.avatar}>
        <Text style={[s.avatarLetter, { color: levelColor(item.level) }]}>{item.name[0]?.toUpperCase()}</Text>
      </LinearGradient>
      <View style={s.info}>
        <Text style={s.name}>{item.name}</Text>
        <View style={s.metaRow}>
          <View style={[s.levelPill, { borderColor: `${levelColor(item.level)}40` }]}>
            <Text style={[s.levelText, { color: levelColor(item.level) }]}>LV.{item.level}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleRemove(item)} hitSlop={8} style={s.removeBtn}>
        <Ionicons name="close-circle" size={22} color="rgba(251,113,133,0.6)" />
      </TouchableOpacity>
    </View>
  )

  const renderRequest = ({ item }: { item: FriendEntry }) => (
    <View style={s.row}>
      <LinearGradient colors={[`${levelColor(item.level)}30`, 'rgba(0,0,0,0.3)']} style={s.avatar}>
        <Text style={[s.avatarLetter, { color: levelColor(item.level) }]}>{item.name[0]?.toUpperCase()}</Text>
      </LinearGradient>
      <View style={s.info}>
        <Text style={s.name}>{item.name}</Text>
        <Text style={s.reqMeta}>{item.isIncoming ? 'Wants to join your network' : 'Request sent'}</Text>
      </View>
      {item.isIncoming && (
        <View style={s.actionRow}>
          <TouchableOpacity style={s.acceptBtn} onPress={() => respond(item.id, true)}>
            <Ionicons name="checkmark" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={s.declineBtn} onPress={() => respond(item.id, false)}>
            <Ionicons name="close" size={18} color={mobileTheme.danger} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )

  return (
    <SafeAreaView style={s.container}>
      {/* Hero */}
      <LinearGradient
        colors={['rgba(103,232,165,0.14)', 'rgba(5,7,13,0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.hero}
      >
        <View>
          <Text style={s.heroEyebrow}>HUNTER CONNECTIONS</Text>
          <Text style={s.heroTitle}>Network</Text>
        </View>
        <View style={s.readoutRow}>
          <View style={s.readout}>
            <Text style={s.readoutLabel}>ALLIES</Text>
            <Text style={s.readoutValue}>{friends.length}</Text>
          </View>
          <View style={s.readout}>
            <Text style={s.readoutLabel}>PENDING</Text>
            <Text style={[s.readoutValue, requests.length > 0 ? { color: mobileTheme.warning } : {}]}>{requests.length}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={s.tabs}>
        {(['friends', 'requests'] as FriendTab[]).map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Ionicons name={t === 'friends' ? 'people' : 'mail'} size={16} color={tab === t ? mobileTheme.accent : mobileTheme.textDim} />
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === 'friends' ? `Allies (${friends.length})` : `Requests (${requests.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? <View style={s.errBanner}><Text style={s.errText}>{error}</Text></View> : null}

      <FlatList
        data={tab === 'friends' ? friends : requests}
        keyExtractor={item => item.id.toString()}
        renderItem={tab === 'friends' ? renderFriend : renderRequest}
        contentContainerStyle={s.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={tab === 'friends' ? fetchFriends : fetchRequests} tintColor={mobileTheme.accent} />}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <View style={s.emptyIcon}>
              <Ionicons name={tab === 'friends' ? 'people-outline' : 'mail-outline'} size={40} color={mobileTheme.textDim} />
            </View>
            <Text style={s.emptyTitle}>{tab === 'friends' ? 'No allies yet' : 'No pending requests'}</Text>
            <Text style={s.emptyBody}>{tab === 'friends' ? 'Add hunters from the leaderboard.' : 'Friend requests will appear here.'}</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: mobileTheme.background },

  // Hero
  hero: { marginHorizontal: 18, marginTop: 14, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(103,232,165,0.15)', gap: 16 },
  heroEyebrow: { color: mobileTheme.textDim, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  heroTitle: { color: mobileTheme.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginTop: 4 },
  readoutRow: { flexDirection: 'row', gap: 10 },
  readout: { flex: 1, minHeight: 68, borderRadius: 16, padding: 12, backgroundColor: 'rgba(0,0,0,0.22)', borderWidth: 1, borderColor: mobileTheme.borderSoft },
  readoutLabel: { color: mobileTheme.textDim, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  readoutValue: { marginTop: 8, color: mobileTheme.text, fontSize: 22, fontWeight: '900' },

  // Tabs
  tabs: { flexDirection: 'row', marginHorizontal: 18, marginTop: 16, backgroundColor: mobileTheme.panelSoft, borderRadius: 14, padding: 4, marginBottom: 4, borderWidth: 1, borderColor: mobileTheme.borderSoft },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 11, borderRadius: 12, gap: 6 },
  tabActive: { backgroundColor: mobileTheme.accentSoft },
  tabText: { color: mobileTheme.textDim, fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: mobileTheme.accent },

  // List
  listContent: { padding: 18, paddingBottom: 100 },

  // Rows
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: mobileTheme.panel, borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: mobileTheme.borderSoft, gap: 14, minHeight: 72 },
  avatar: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: mobileTheme.borderSoft },
  avatarLetter: { fontSize: 20, fontWeight: '900' },
  info: { flex: 1 },
  name: { color: mobileTheme.text, fontSize: 16, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  levelPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  levelText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  reqMeta: { color: mobileTheme.textDim, fontSize: 12, fontWeight: '600', marginTop: 4 },
  removeBtn: { padding: 6 },
  actionRow: { flexDirection: 'row', gap: 8 },
  acceptBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: mobileTheme.accent, alignItems: 'center', justifyContent: 'center' },
  declineBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(127,29,29,0.3)', borderWidth: 1, borderColor: 'rgba(251,113,133,0.2)', alignItems: 'center', justifyContent: 'center' },

  // Error
  errBanner: { marginHorizontal: 18, marginTop: 10, borderRadius: 16, backgroundColor: 'rgba(127,29,29,0.28)', borderWidth: 1, borderColor: 'rgba(251,113,133,0.25)', padding: 14 },
  errText: { color: mobileTheme.danger, fontSize: 13, fontWeight: '600' },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 50, gap: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: mobileTheme.panelSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: mobileTheme.borderSoft },
  emptyTitle: { color: mobileTheme.text, fontSize: 18, fontWeight: '800' },
  emptyBody: { color: mobileTheme.textMuted, fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
})
