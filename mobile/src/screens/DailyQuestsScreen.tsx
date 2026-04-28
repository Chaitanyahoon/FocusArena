import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Modal, TextInput, KeyboardAvoidingView, Pressable,
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useDailyQuestStore } from '../stores/dailyQuestStore'
import { mobileTheme } from '../theme'
import type { DailyQuest } from '../types'

const DIFFICULTIES = [
  { id: 1, label: 'F-Rank', color: mobileTheme.success },
  { id: 3, label: 'D-Rank', color: mobileTheme.warning },
  { id: 5, label: 'B-Rank', color: mobileTheme.danger },
]

export default function DailyQuestsScreen() {
  const { quests, status, isLoading, fetchQuests, createQuest, logProgress, error } = useDailyQuestStore()
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('5')
  const [unit, setUnit] = useState('times')
  const [difficulty, setDifficulty] = useState(1)

  useEffect(() => { fetchQuests() }, [fetchQuests])

  const handleCreate = async () => {
    if (!title.trim()) return
    await createQuest({ title: title.trim(), targetCount: parseInt(target) || 5, unit, difficulty })
    setTitle('')
    setTarget('5')
    setShowModal(false)
  }

  const pct = (q: DailyQuest) => Math.min(Math.round((q.currentCount / q.targetCount) * 100), 100)
  const diffColor = (d: number) => d >= 5 ? mobileTheme.danger : d >= 3 ? mobileTheme.warning : mobileTheme.success

  const renderQuest = ({ item }: { item: DailyQuest }) => (
    <View style={[s.questCard, item.isCompleted && s.questDone]}>
      <View style={s.questTop}>
        <View style={s.questInfo}>
          <View style={s.questBadgeRow}>
            <View style={[s.diffDot, { backgroundColor: diffColor(item.difficulty) }]} />
            <Text style={s.questLabel}>
              {item.isCompleted ? 'CLEARED' : `${item.currentCount}/${item.targetCount} ${item.unit}`}
            </Text>
          </View>
          <Text style={[s.questTitle, item.isCompleted && s.questTitleDone]}>{item.title}</Text>
        </View>
        {!item.isCompleted && (
          <TouchableOpacity
            style={s.incrementBtn}
            onPress={() => logProgress(item.id, 1)}
            accessibilityLabel={`Increment ${item.title}`}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[mobileTheme.accent, 'rgba(124,92,255,0.7)']}
              style={s.incrementGradient}
            >
              <Ionicons name="add" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
        {item.isCompleted && (
          <View style={s.checkCircle}>
            <Ionicons name="checkmark" size={20} color={mobileTheme.success} />
          </View>
        )}
      </View>
      <View style={s.progressBg}>
        <Animated.View style={[
          s.progressFill,
          { width: `${pct(item)}%` },
          item.isCompleted && { backgroundColor: mobileTheme.success },
        ]} />
      </View>
    </View>
  )

  const completedCount = status?.completedQuests || 0
  const totalCount = status?.totalQuests || 0
  const allDone = status?.isAllCompleted
  const hasPenalty = status?.hasPenalty

  return (
    <SafeAreaView style={s.container}>
      {/* Hero Header */}
      <LinearGradient
        colors={['rgba(124,92,255,0.18)', 'rgba(5,7,13,0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.hero}
      >
        <View style={s.heroTop}>
          <View>
            <Text style={s.heroEyebrow}>REPEATING CONTRACTS</Text>
            <Text style={s.heroTitle}>Daily Quests</Text>
          </View>
          <Pressable onPress={() => setShowModal(true)} style={s.addChip}>
            <Ionicons name="add" size={16} color={mobileTheme.text} />
            <Text style={s.addChipText}>NEW</Text>
          </Pressable>
        </View>

        {status && (
          <View style={s.readoutRow}>
            <View style={s.readout}>
              <Text style={s.readoutLabel}>CLEARED</Text>
              <Text style={s.readoutValue}>{completedCount}/{totalCount}</Text>
            </View>
            <View style={s.readout}>
              <Text style={s.readoutLabel}>CYCLE</Text>
              <Text style={[
                s.readoutValue,
                allDone ? { color: mobileTheme.success } : hasPenalty ? { color: mobileTheme.danger } : {},
              ]}>
                {allDone ? 'COMPLETE' : hasPenalty ? 'PENALTY' : 'ACTIVE'}
              </Text>
            </View>
            <View style={s.readout}>
              <Text style={s.readoutLabel}>RESET</Text>
              <Text style={s.readoutValue}>24H</Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {error ? (
        <View style={s.errorBanner}><Text style={s.errorText}>{error}</Text></View>
      ) : null}

      <FlatList
        data={quests}
        keyExtractor={item => item.id.toString()}
        renderItem={renderQuest}
        contentContainerStyle={s.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchQuests} tintColor={mobileTheme.accent} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={s.emptyState}>
              <View style={s.emptyIcon}>
                <Ionicons name="today-outline" size={40} color={mobileTheme.textDim} />
              </View>
              <Text style={s.emptyTitle}>No daily contracts active</Text>
              <Text style={s.emptyBody}>Create a repeating challenge to keep your streak alive.</Text>
            </View>
          ) : null
        }
      />

      {/* Create Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior="padding" style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Issue Daily Contract</Text>
              <Pressable onPress={() => setShowModal(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={mobileTheme.textMuted} />
              </Pressable>
            </View>

            <Text style={s.inputLabel}>OBJECTIVE</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder="E.g. Read 20 pages" placeholderTextColor="rgba(231,237,246,0.28)" style={s.input} autoFocus />

            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.inputLabel}>TARGET</Text>
                <TextInput value={target} onChangeText={setTarget} keyboardType="number-pad" style={s.input} placeholderTextColor="rgba(231,237,246,0.28)" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.inputLabel}>UNIT</Text>
                <TextInput value={unit} onChangeText={setUnit} placeholder="pages, reps..." placeholderTextColor="rgba(231,237,246,0.28)" style={s.input} />
              </View>
            </View>

            <Text style={s.inputLabel}>RANK (DIFFICULTY)</Text>
            <View style={s.pillRow}>
              {DIFFICULTIES.map(d => (
                <TouchableOpacity key={d.id} onPress={() => setDifficulty(d.id)} style={[s.pill, difficulty === d.id && { backgroundColor: `${d.color}20`, borderColor: `${d.color}40` }]}>
                  <View style={[s.diffDot, { backgroundColor: d.color }]} />
                  <Text style={[s.pillText, difficulty === d.id && { color: d.color, fontWeight: '900' }]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Pressable onPress={handleCreate} style={s.submitBtn}>
              <Text style={s.submitText}>ADD TO DAILY LOG</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: mobileTheme.background },

  // Hero
  hero: { marginHorizontal: 18, marginTop: 14, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: mobileTheme.border, gap: 16 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroEyebrow: { color: mobileTheme.textDim, fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  heroTitle: { color: mobileTheme.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginTop: 4 },
  addChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: mobileTheme.accent, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, minHeight: 44 },
  addChipText: { color: mobileTheme.text, fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },

  // Readouts
  readoutRow: { flexDirection: 'row', gap: 10 },
  readout: { flex: 1, minHeight: 68, borderRadius: 16, padding: 12, backgroundColor: 'rgba(0,0,0,0.22)', borderWidth: 1, borderColor: mobileTheme.borderSoft },
  readoutLabel: { color: mobileTheme.textDim, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  readoutValue: { marginTop: 8, color: mobileTheme.text, fontSize: 18, fontWeight: '900' },

  // List
  listContent: { padding: 18, paddingBottom: 100 },

  // Quest Card
  questCard: { backgroundColor: mobileTheme.panel, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: mobileTheme.borderSoft, marginBottom: 12, gap: 12 },
  questDone: { opacity: 0.55 },
  questTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questInfo: { flex: 1, marginRight: 12 },
  questBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  diffDot: { width: 8, height: 8, borderRadius: 4 },
  questLabel: { color: mobileTheme.textDim, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  questTitle: { color: mobileTheme.text, fontSize: 16, fontWeight: '800', marginTop: 6, lineHeight: 22 },
  questTitleDone: { textDecorationLine: 'line-through', color: mobileTheme.textMuted },
  incrementBtn: { borderRadius: 16, overflow: 'hidden' },
  incrementGradient: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  checkCircle: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(103,232,165,0.12)', borderWidth: 1, borderColor: 'rgba(103,232,165,0.3)', alignItems: 'center', justifyContent: 'center' },
  progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: mobileTheme.accent },

  // Error
  errorBanner: { marginHorizontal: 18, marginTop: 12, borderRadius: 16, backgroundColor: 'rgba(127,29,29,0.28)', borderWidth: 1, borderColor: 'rgba(251,113,133,0.25)', padding: 14 },
  errorText: { color: mobileTheme.danger, fontSize: 13, fontWeight: '600' },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 50, gap: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: mobileTheme.panelSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: mobileTheme.borderSoft },
  emptyTitle: { color: mobileTheme.text, fontSize: 18, fontWeight: '800' },
  emptyBody: { color: mobileTheme.textMuted, fontSize: 13, textAlign: 'center', paddingHorizontal: 40, lineHeight: 18 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(6,9,19,0.92)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: mobileTheme.backgroundElevated, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, borderColor: mobileTheme.border, padding: 24, paddingBottom: 40, gap: 14 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { color: mobileTheme.accent, fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  inputLabel: { color: mobileTheme.textDim, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 4 },
  input: { borderRadius: 16, borderWidth: 1, borderColor: mobileTheme.borderSoft, backgroundColor: mobileTheme.panelSoft, paddingHorizontal: 16, paddingVertical: 14, color: mobileTheme.text, fontSize: 16, fontWeight: '600', minHeight: 48 },
  row: { flexDirection: 'row', gap: 12 },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: mobileTheme.panelSoft, borderWidth: 1, borderColor: 'transparent' },
  pillText: { color: mobileTheme.textMuted, fontSize: 13, fontWeight: '700' },
  submitBtn: { backgroundColor: mobileTheme.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  submitText: { color: mobileTheme.text, fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },
})
