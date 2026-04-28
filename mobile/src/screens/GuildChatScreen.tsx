import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { signalRService } from '../services/signalr'
import { useAppStore } from '../stores/appStore'
import { mobileTheme } from '../theme'

interface GuildMessage {
  id: number
  userId: number
  userName: string
  avatarUrl?: string
  content: string
  sentAt: string
  isMe: boolean
}

interface GuildChatScreenProps {
  route: { params: { guildId: number; guildName: string } }
  navigation: any
}

export default function GuildChatScreen({ route, navigation }: GuildChatScreenProps) {
  const { guildId, guildName } = route.params
  const { auth } = useAppStore()
  const myId = auth?.userId || 0
  const myName = auth?.name || 'Hunter'

  const [messages, setMessages] = useState<GuildMessage[]>([])
  const [input, setInput] = useState('')
  const listRef = useRef<FlatList>(null)

  useEffect(() => {
    signalRService.joinGuild(guildId)

    const unsub = signalRService.onMessage((msg: any) => {
      if (msg.guildId === guildId || msg.type === 'guild') {
        setMessages(prev => [...prev, {
          id: msg.id || Date.now(),
          userId: msg.userId || msg.senderId,
          userName: msg.userName || msg.senderName || 'Unknown',
          avatarUrl: msg.avatarUrl,
          content: msg.content || msg.message,
          sentAt: msg.sentAt || new Date().toISOString(),
          isMe: (msg.userId || msg.senderId) === myId,
        }])
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
      }
    })

    return unsub
  }, [guildId, myId])

  const handleSend = useCallback(async () => {
    if (!input.trim()) return
    const content = input.trim()
    setInput('')
    try {
      await signalRService.sendGuildMessage(guildId, myId, myName, content)
      setMessages(prev => [...prev, {
        id: Date.now(),
        userId: myId,
        userName: myName,
        content,
        sentAt: new Date().toISOString(),
        isMe: true,
      }])
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    } catch {
      setInput(content)
    }
  }, [input, guildId, myId, myName])

  const renderMessage = ({ item }: { item: GuildMessage }) => (
    <View style={[s.bubbleRow, item.isMe && s.bubbleRowMine]}>
      {!item.isMe && (
        <View style={s.msgAvatar}>
          <Ionicons name="person" size={14} color="rgba(255,255,255,0.4)" />
        </View>
      )}
      <View style={[s.bubble, item.isMe ? s.bubbleMine : s.bubbleTheirs]}>
        {!item.isMe && <Text style={s.senderName}>{item.userName}</Text>}
        <Text style={[s.bubbleText, item.isMe ? s.textMine : s.textTheirs]}>{item.content}</Text>
        <Text style={s.bubbleTime}>
          {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={mobileTheme.text} />
        </TouchableOpacity>
        <View style={s.headerIcon}>
          <Ionicons name="shield" size={18} color={mobileTheme.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.headerName}>{guildName}</Text>
          <Text style={s.headerSub}>Guild Chat</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={s.messageList}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={mobileTheme.textDim} />
            <Text style={s.emptyTitle}>Guild chat is quiet</Text>
            <Text style={s.emptyBody}>Be the first to rally the hunters.</Text>
          </View>
        }
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.inputBar}>
          <TextInput
            style={s.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Message the guild..."
            placeholderTextColor="rgba(255,255,255,0.28)"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[s.sendBtn, !input.trim() && { opacity: 0.3 }]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={20} color={mobileTheme.text} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: mobileTheme.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: mobileTheme.borderSoft,
    backgroundColor: mobileTheme.backgroundElevated,
  },
  backBtn: { padding: 4 },
  headerIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: mobileTheme.accentSoft, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: mobileTheme.border,
  },
  headerName: { color: mobileTheme.text, fontSize: 17, fontWeight: '800' },
  headerSub: { color: mobileTheme.textDim, fontSize: 11, fontWeight: '600', marginTop: 1 },
  messageList: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8, gap: 8 },
  bubbleRowMine: { flexDirection: 'row-reverse' },
  msgAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: mobileTheme.blackGlass, alignItems: 'center', justifyContent: 'center',
  },
  bubble: { maxWidth: '75%', borderRadius: 18, padding: 12 },
  bubbleMine: { backgroundColor: mobileTheme.accent, borderBottomRightRadius: 4 },
  bubbleTheirs: {
    backgroundColor: mobileTheme.panel, borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: mobileTheme.borderSoft,
  },
  senderName: { color: mobileTheme.accent, fontSize: 11, fontWeight: '800', marginBottom: 4 },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  textMine: { color: '#fff' },
  textTheirs: { color: mobileTheme.text },
  bubbleTime: { color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 4, textAlign: 'right' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: mobileTheme.borderSoft,
    backgroundColor: mobileTheme.backgroundElevated,
  },
  textInput: {
    flex: 1, backgroundColor: mobileTheme.panelSoft, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 12, color: mobileTheme.text,
    fontSize: 15, maxHeight: 100, borderWidth: 1, borderColor: mobileTheme.borderSoft,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: mobileTheme.accent, alignItems: 'center', justifyContent: 'center',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 10 },
  emptyTitle: { color: mobileTheme.textDim, fontSize: 16, fontWeight: '700' },
  emptyBody: { color: mobileTheme.textDim, fontSize: 13 },
})
