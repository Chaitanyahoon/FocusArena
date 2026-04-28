import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useSocialStore } from '../stores/socialStore'
import { useFriendStore } from '../stores/friendStore'
import type { LeaderboardEntry, ChatUser } from '../types'
import { mobileTheme } from '../theme'
import { LinearGradient } from 'expo-linear-gradient'

type ActiveView = 'leaderboard' | 'messages'

export default function SocialScreen() {
  const navigation = useNavigation<any>()
  const [activeView, setActiveView] = useState<ActiveView>('leaderboard')
  const { sendRequest } = useFriendStore()

  const {
    leaderboard, leaderboardTab, leaderboardLoading,
    recentChats, chatsLoading,
    setLeaderboardTab, fetchLeaderboard, fetchRecentChats, initRealtime,
  } = useSocialStore()

  useEffect(() => {
    const cleanup = initRealtime()
    return cleanup
  }, [initRealtime])

  useEffect(() => {
    if (activeView === 'leaderboard') fetchLeaderboard()
    else fetchRecentChats()
  }, [activeView, fetchLeaderboard, fetchRecentChats])

  const isLoading = activeView === 'leaderboard' ? leaderboardLoading : chatsLoading
  const onRefresh = activeView === 'leaderboard' ? fetchLeaderboard : fetchRecentChats

  const handleAddFriend = (userId: number, name: string) => {
    Alert.alert('Add Friend', `Send friend request to ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send', onPress: () => sendRequest(userId).catch(() => Alert.alert('Failed', 'Could not send request.')) },
    ])
  }

  const handleOpenChat = (user: ChatUser) => {
    navigation.navigate('Chat', { userId: user.id, userName: user.name })
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { bg: '#FFD700', text: '#1a1a2e' }
    if (rank === 2) return { bg: '#C0C0C0', text: '#1a1a2e' }
    if (rank === 3) return { bg: '#CD7F32', text: '#fff' }
    return { bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.6)' }
  }

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => {
    const rankStyle = getRankStyle(item.rank)
    return (
      <View style={styles.lbRow}>
        <View style={[styles.rankBadge, { backgroundColor: rankStyle.bg }]}>
          <Text style={[styles.rankText, { color: rankStyle.text }]}>{item.rank}</Text>
        </View>
        <View style={styles.lbAvatar}>
          <Ionicons name="person" size={20} color="rgba(255,255,255,0.5)" />
        </View>
        <View style={styles.lbInfo}>
          <Text style={styles.lbName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.lbMeta}>Level {item.level}</Text>
        </View>
        <Text style={styles.lbXp}>{item.xp.toLocaleString()} XP</Text>
        <TouchableOpacity onPress={() => handleAddFriend(item.userId, item.name)} hitSlop={8} style={styles.addFriendBtn}>
          <Ionicons name="person-add-outline" size={18} color={mobileTheme.accent} />
        </TouchableOpacity>
      </View>
    )
  }

  const renderChatItem = ({ item }: { item: ChatUser }) => (
    <TouchableOpacity style={styles.chatRow} activeOpacity={0.7} onPress={() => handleOpenChat(item)}>
      <View style={styles.chatAvatar}>
        <Ionicons name="person" size={20} color="rgba(255,255,255,0.5)" />
        {item.isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.chatLastMsg} numberOfLines={1}>{item.lastMessage || 'No messages yet'}</Text>
      </View>
      {item.unreadCount != null && item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color={mobileTheme.textDim} />
    </TouchableOpacity>
  )

  const EmptyState = ({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) => (
    <View style={styles.emptyContainer}>
      <Ionicons name={icon as any} size={48} color="rgba(255,255,255,0.15)" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Hero */}
      <LinearGradient
        colors={['rgba(124,92,255,0.14)', 'rgba(5,7,13,0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroEyebrow}>GLOBAL ARENA</Text>
            <Text style={styles.heroTitle}>Social Hub</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Friends')} style={styles.friendsBtn}>
            <Ionicons name="people" size={16} color={mobileTheme.accent} />
            <Text style={styles.friendsBtnText}>FRIENDS</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.segmentedControl}>
        <TouchableOpacity style={[styles.segment, activeView === 'leaderboard' && styles.segmentActive]} onPress={() => setActiveView('leaderboard')}>
          <Ionicons name="trophy" size={16} color={activeView === 'leaderboard' ? mobileTheme.accent : mobileTheme.textDim} />
          <Text style={[styles.segmentText, activeView === 'leaderboard' && styles.segmentTextActive]}>Leaderboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segment, activeView === 'messages' && styles.segmentActive]} onPress={() => setActiveView('messages')}>
          <Ionicons name="chatbubbles" size={16} color={activeView === 'messages' ? mobileTheme.accent : mobileTheme.textDim} />
          <Text style={[styles.segmentText, activeView === 'messages' && styles.segmentTextActive]}>Messages</Text>
        </TouchableOpacity>
      </View>

      {activeView === 'leaderboard' && (
        <View style={styles.subTabs}>
          {(['global', 'weekly'] as const).map(t => (
            <TouchableOpacity key={t} style={[styles.subTab, leaderboardTab === t && styles.subTabActive]} onPress={() => setLeaderboardTab(t)}>
              <Text style={[styles.subTabText, leaderboardTab === t && styles.subTabTextActive]}>{t === 'global' ? 'Global' : 'Weekly'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {activeView === 'leaderboard' ? (
        <FlatList
          data={leaderboard}
          keyExtractor={item => item.userId.toString()}
          renderItem={renderLeaderboardItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={mobileTheme.accent} />}
          ListEmptyComponent={
            isLoading ? <ActivityIndicator color={mobileTheme.accent} style={{ marginTop: 40 }} /> :
            <EmptyState icon="trophy-outline" title="No Rankings Yet" subtitle="The arena awaits its first champions." />
          }
        />
      ) : (
        <FlatList
          data={recentChats}
          keyExtractor={item => item.id.toString()}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={mobileTheme.accent} />}
          ListEmptyComponent={
            isLoading ? <ActivityIndicator color={mobileTheme.accent} style={{ marginTop: 40 }} /> :
            <EmptyState icon="chatbubbles-outline" title="No Conversations" subtitle="Find hunters to chat with from the leaderboard." />
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: mobileTheme.background },
  
  // Hero
  hero: { marginHorizontal: 18, marginTop: 14, marginBottom: 16, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(124,92,255,0.15)' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroEyebrow: { color: mobileTheme.textDim, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  heroTitle: { color: mobileTheme.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginTop: 4 },
  friendsBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: mobileTheme.accentSoft, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: mobileTheme.border },
  friendsBtnText: { color: mobileTheme.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },

  // Tabs
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  segmentActive: { backgroundColor: mobileTheme.accentSoft },
  segmentText: { color: mobileTheme.textDim, fontSize: 13, fontWeight: '700' },
  segmentTextActive: { color: mobileTheme.accent },
  subTabs: { flexDirection: 'row', marginHorizontal: 20, gap: 10, marginBottom: 10 },
  subTab: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: mobileTheme.borderSoft },
  subTabActive: { backgroundColor: mobileTheme.accentSoft, borderColor: mobileTheme.border },
  subTabText: { color: mobileTheme.textDim, fontSize: 12, fontWeight: '700' },
  subTabTextActive: { color: mobileTheme.accent },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  lbRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: mobileTheme.panelSoft, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: mobileTheme.borderSoft, gap: 12 },
  rankBadge: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontWeight: '900', fontSize: 14 },
  lbAvatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: mobileTheme.blackGlass, alignItems: 'center', justifyContent: 'center' },
  lbInfo: { flex: 1 },
  lbName: { color: mobileTheme.text, fontSize: 15, fontWeight: '800' },
  lbMeta: { color: mobileTheme.textDim, fontSize: 11, fontWeight: '600', marginTop: 2 },
  lbXp: { color: mobileTheme.accent, fontSize: 14, fontWeight: '900' },
  addFriendBtn: { padding: 6 },
  chatRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: mobileTheme.panelSoft, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: mobileTheme.borderSoft, gap: 12, minHeight: 64 },
  chatAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: mobileTheme.blackGlass, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: mobileTheme.success, borderWidth: 2, borderColor: mobileTheme.background },
  chatInfo: { flex: 1 },
  chatName: { color: mobileTheme.text, fontSize: 15, fontWeight: '800' },
  chatLastMsg: { color: mobileTheme.textDim, fontSize: 12, marginTop: 3 },
  unreadBadge: { minWidth: 22, height: 22, borderRadius: 11, backgroundColor: mobileTheme.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadText: { color: mobileTheme.text, fontSize: 11, fontWeight: '900' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { color: mobileTheme.textMuted, fontSize: 18, fontWeight: 'bold' },
  emptySubtitle: { color: mobileTheme.textDim, fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
})
