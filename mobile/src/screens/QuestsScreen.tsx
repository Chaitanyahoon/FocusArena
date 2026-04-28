import React, { useCallback, useState } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppStore } from '../stores/appStore'
import TaskCard from '../components/TaskCard'
import type { Task } from '../types'
import { mobileTheme } from '../theme'

const CATEGORIES = [
  { id: 0, label: 'Main Quest' },
  { id: 1, label: 'Side Quest' },
  { id: 3, label: 'Daily Contract' },
]

const DIFFICULTIES = [
  { id: 1, label: 'F-Rank (Easy)' },
  { id: 3, label: 'D-Rank (Medium)' },
  { id: 5, label: 'B-Rank (Hard)' },
  { id: 7, label: 'S-Rank (Epic)' },
]

export default function QuestsScreen() {
  const navigation = useNavigation<any>()
  const { tasks, completeTask, createTask, deleteTask, hydrateDashboard, dashboardLoading } = useAppStore()
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskCategory, setNewTaskCategory] = useState(3)
  const [newTaskDifficulty, setNewTaskDifficulty] = useState(1)

  const activeTasks = tasks.filter((task) => task.category !== 5 && task.status !== 2)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const completedTasks = tasks.filter(t => {
      if (t.status !== 2) return false
      if (t.category === 5) return false
      if (!t.completedAt) return true
      const d = new Date(t.completedAt)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
  })

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return
    await createTask({
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      difficulty: newTaskDifficulty,
      recurrence: 0,
    })
    setNewTaskTitle('')
    setModalVisible(false)
  }

  // Memoized renderItem to prevent re-renders on FlatList scroll
  const renderItem = useCallback(
    ({ item }: { item: Task }) => <TaskCard task={item} onComplete={completeTask} onDelete={deleteTask} />,
    [completeTask, deleteTask]
  )

  const keyExtractor = useCallback((item: Task) => item.id.toString(), [])

  const renderFooter = () => {
    if (completedTasks.length === 0) return null;
    return (
      <View style={styles.footerContainer}>
        <View style={styles.footerHeader}>
          <Text style={styles.footerLabel}>TODAY'S COMPLETIONS</Text>
          <Text style={styles.footerXp}>
            {completedTasks.reduce((acc, curr) => acc + curr.xpReward, 0)} XP TOTAL
          </Text>
        </View>
        {completedTasks.map(task => (
          <View key={task.id} style={styles.completedCard}>
            <View style={styles.completedHeader}>
              <View style={[styles.taskTone, { backgroundColor: '#34D399', width: 6, height: 6 }]} />
              <Text style={styles.completedTitle}>{task.title}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.completedXp}>+{task.xpReward} XP</Text>
              <Pressable onPress={() => deleteTask(task.id)} hitSlop={8} style={styles.deleteButton}>
                <Text style={styles.deleteLabel}>✕</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(124,92,255,0.16)', 'rgba(5,7,13,0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.panelHeadingRow}>
          <View>
            <Text style={styles.panelLabel}>Active Contracts</Text>
            <Text style={styles.heroTitle}>{activeTasks.length} Quests</Text>
          </View>
          <Pressable onPress={() => setModalVisible(true)} style={styles.primaryChip} accessibilityRole="button">
            <Ionicons name="add" size={16} color={mobileTheme.text} />
            <Text style={styles.primaryChipLabel}>NEW</Text>
          </Pressable>
        </View>
        <TouchableOpacity
          style={styles.dailyLink}
          onPress={() => navigation.navigate('DailyQuests')}
          activeOpacity={0.7}
        >
          <Ionicons name="today" size={16} color={mobileTheme.accent} />
          <Text style={styles.dailyLinkText}>OPEN DAILY CONTRACTS</Text>
          <Ionicons name="chevron-forward" size={14} color={mobileTheme.textDim} />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={activeTasks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={dashboardLoading} onRefresh={hydrateDashboard} tintColor={mobileTheme.accent} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No active contracts loaded.</Text>
            <Text style={styles.emptyBody}>Tap "+ NEW QUEST" to add a target for today.</Text>
          </View>
        }
        removeClippedSubviews={true}
        ListFooterComponent={renderFooter}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Issue Contract</Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={10}>
                <Text style={styles.closeModalText}>✕</Text>
              </Pressable>
            </View>

            <TextInput
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholder="What needs to be done?"
              placeholderTextColor="rgba(231, 237, 246, 0.28)"
              style={styles.modalInput}
              autoFocus
            />

            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.pillRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setNewTaskCategory(cat.id)}
                  style={[styles.pill, newTaskCategory === cat.id && styles.pillActive]}
                >
                  <Text style={[styles.pillText, newTaskCategory === cat.id && styles.pillTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Rank (Difficulty)</Text>
            <View style={styles.pillRow}>
              {DIFFICULTIES.map(diff => (
                <TouchableOpacity
                  key={diff.id}
                  onPress={() => setNewTaskDifficulty(diff.id)}
                  style={[styles.pill, newTaskDifficulty === diff.id && styles.pillActive]}
                >
                  <Text style={[styles.pillText, newTaskDifficulty === diff.id && styles.pillTextActive]}>
                    {diff.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Pressable onPress={handleCreateTask} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>ADD TO QUEST LOG</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mobileTheme.background,
  },
  header: {
    marginHorizontal: 18,
    marginTop: 60,
    marginBottom: 8,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: mobileTheme.border,
    gap: 14,
  },
  panelHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  panelLabel: {
    color: mobileTheme.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 4,
    color: mobileTheme.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  primaryChip: {
    borderRadius: 14,
    backgroundColor: mobileTheme.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  primaryChipLabel: {
    color: mobileTheme.text,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  dailyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
  },
  dailyLinkText: {
    color: mobileTheme.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    flex: 1,
  },
  listContent: {
    padding: 18,
    paddingBottom: 100, // Space for bottom tabs
  },
  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
    backgroundColor: mobileTheme.panel,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    color: mobileTheme.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyBody: {
    color: mobileTheme.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 30,
    opacity: 0.8,
  },
  footerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerLabel: {
    color: mobileTheme.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  footerXp: {
    color: mobileTheme.success,
    fontSize: 11,
    fontWeight: '800',
  },
  completedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: mobileTheme.panelSoft,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
    borderRadius: 12,
    marginBottom: 8,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  completedTitle: {
    color: mobileTheme.textMuted,
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  completedXp: {
    color: mobileTheme.success,
    fontSize: 12,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  taskTone: {
    height: 10,
    width: 10,
    borderRadius: 999,
  },
  deleteButton: {
    padding: 4,
  },
  deleteLabel: {
    color: 'rgba(255, 100, 100, 0.8)',
    fontSize: 14,
    fontWeight: '800',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 9, 19, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: mobileTheme.backgroundElevated,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: mobileTheme.border,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: mobileTheme.text,
    fontSize: 20,
    fontWeight: '900',
  },
  closeModalText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 20,
    fontWeight: '700',
  },
  modalInput: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
    backgroundColor: mobileTheme.panelSoft,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: mobileTheme.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionLabel: {
    color: mobileTheme.textDim,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 4,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: mobileTheme.panelSoft,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: mobileTheme.accentSoft,
    borderColor: mobileTheme.border,
  },
  pillText: {
    color: mobileTheme.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: mobileTheme.accent,
    fontWeight: '800',
  },
  submitButton: {
    backgroundColor: mobileTheme.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: mobileTheme.text,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
})
