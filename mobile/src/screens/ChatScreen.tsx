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
import type { PrivateMessage } from '../types'

interface ChatScreenProps {
  route: { params: { userId: number; userName: string } }
  navigation: any
}

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
  const { userId, userName } = route.params
  const { auth } = useAppStore()
  const myId = auth?.userId || 0

  const [messages, setMessages] = useState<PrivateMessage[]>([])
  const [input, setInput] = useState('')
  const listRef = useRef<FlatList>(null)

  useEffect(() => {
    const unsub = signalRService.onMessage((msg: PrivateMessage) => {
      if (msg.senderId === userId || msg.receiverId === userId) {
        setMessages(prev => [...prev, { ...msg, isMe: msg.senderId === myId }])
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
      }
    })
    return unsub
  }, [userId, myId])

  const handleSend = useCallback(async () => {
    if (!input.trim()) return
    const content = input.trim()
    setInput('')
    try {
      await signalRService.sendPrivateMessage(myId, userId, content)
      const optimistic: PrivateMessage = {
        id: Date.now(),
        senderId: myId,
        senderName: auth?.name || '',
        receiverId: userId,
        content,
        sentAt: new Date().toISOString(),
        isRead: false,
        isMe: true,
      }
      setMessages(prev => [...prev, optimistic])
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    } catch {
      setInput(content)
    }
  }, [input, myId, userId, auth])

  const renderMessage = ({ item }: { item: PrivateMessage }) => (
    <View style={[s.bubble, item.isMe ? s.bubbleMine : s.bubbleTheirs]}>
      <Text style={[s.bubbleText, item.isMe ? s.bubbleTextMine : s.bubbleTextTheirs]}>{item.content}</Text>
      <Text style={s.bubbleTime}>
        {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={mobileTheme.text} />
        </TouchableOpacity>
        <View style={s.headerAvatar}>
          <Ionicons name="person" size={18} color="rgba(255,255,255,0.5)" />
        </View>
        <Text style={s.headerName}>{userName}</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={s.messageList}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={mobileTheme.textDim} />
            <Text style={s.emptyText}>Start the conversation</Text>
          </View>
        }
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <View style={s.inputBar}>
          <TextInput
            style={s.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="rgba(255,255,255,0.28)"
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={[s.sendBtn, !input.trim() && { opacity: 0.3 }]} onPress={handleSend} disabled={!input.trim()}>
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
  headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: mobileTheme.blackGlass, alignItems: 'center', justifyContent: 'center' },
  headerName: { color: mobileTheme.text, fontSize: 17, fontWeight: '800', flex: 1 },
  messageList: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1 },
  bubble: { maxWidth: '78%', borderRadius: 18, padding: 12, marginBottom: 8 },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: mobileTheme.accent, borderBottomRightRadius: 4 },
  bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: mobileTheme.panel, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: mobileTheme.borderSoft },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  bubbleTextMine: { color: '#fff' },
  bubbleTextTheirs: { color: mobileTheme.text },
  bubbleTime: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 4, textAlign: 'right' },
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
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: mobileTheme.accent, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 10 },
  emptyText: { color: mobileTheme.textDim, fontSize: 15 },
})
