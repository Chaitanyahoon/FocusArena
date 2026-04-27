import React from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Gate } from '../types'
import { mobileTheme } from '../theme'

interface GateCardProps {
  gate: Gate
  onAction: () => void
}

function getRankColor(rank: number) {
  switch (rank) {
    case 5: return '#F6C177'
    case 4: return '#C4B5FD'
    case 3: return '#8B5CF6'
    case 2: return '#7C5CFF'
    case 1: return '#67E8A5'
    default: return '#7B8191'
  }
}

function getRankLabel(rank: number) {
  switch (rank) {
    case 5: return 'S-RANK'
    case 4: return 'A-RANK'
    case 3: return 'B-RANK'
    case 2: return 'C-RANK'
    case 1: return 'D-RANK'
    default: return 'E-RANK'
  }
}

export default function GateCard({ gate, onAction }: GateCardProps) {
  const rankColor = getRankColor(gate.rank)

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.rankBadge, { borderColor: `${rankColor}66`, backgroundColor: `${rankColor}16` }]}>
            <Text style={styles.rankText}>{getRankLabel(gate.rank)}</Text>
          </View>
          <View style={styles.typeBadge}>
            <Ionicons 
              name={gate.type === 2 ? 'warning' : 'skull'} 
              size={12} 
              color={mobileTheme.text} 
            />
            <Text style={styles.typeText}>
              {gate.type === 2 ? 'ANOMALY' : 'DUNGEON'}
            </Text>
          </View>
        </View>

        <View style={styles.bossInfo}>
          <Text style={styles.gateName}>{gate.name}</Text>
          <Text style={styles.bossTitle}>Boss: {gate.bossName}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Level Req</Text>
            <Text style={styles.statValue}>Lv.{gate.requiredLevel}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Party Size</Text>
            <Text style={styles.statValue}>{gate.recommendedPartySize}</Text>
          </View>
        </View>

        <Pressable 
          onPress={onAction} 
          style={styles.actionButton}
          hitSlop={8}
        >
          <Text style={styles.actionButtonText}>ENTER GATE</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: mobileTheme.border,
    backgroundColor: mobileTheme.panel,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  rankText: {
    color: mobileTheme.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 113, 133, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeText: {
    color: mobileTheme.danger,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bossInfo: {
    gap: 4,
  },
  gateName: {
    color: mobileTheme.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  bossTitle: {
    color: mobileTheme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: mobileTheme.blackGlass,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
  },
  statLabel: {
    color: mobileTheme.textDim,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    color: mobileTheme.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: mobileTheme.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: mobileTheme.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
})

// aria-label
