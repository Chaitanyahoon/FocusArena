import React, { useEffect } from 'react'
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAppStore } from '../stores/appStore'
import GateCard from '../components/GateCard'
import { mobileTheme } from '../theme'
import { LinearGradient } from 'expo-linear-gradient'

export default function GateScreen() {
  const { gates, gateLoading, fetchGate, scanAnomaly, error } = useAppStore()

  useEffect(() => {
    fetchGate()
  }, [fetchGate])

  const handleScan = async () => {
    await scanAnomaly()
  }

  const handleEnterGate = (gateId: number) => {
    // In a real app, this would navigate to a combat/dungeon view
    console.log('Entering gate:', gateId)
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={gateLoading && gates.length > 0} onRefresh={fetchGate} tintColor={mobileTheme.accent} />
      }
    >
      <LinearGradient
        colors={['rgba(124,92,255,0.22)', 'rgba(16,21,34,0.95)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.header}>
          <View style={styles.heroIcon}>
            <Ionicons name="planet" size={26} color={mobileTheme.text} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Procedural engine</Text>
            <Text style={styles.title}>The Gates</Text>
            <Text style={styles.subtitle}>
              Manifestations of delay and drift. Clear them before they spread into the week.
            </Text>
          </View>
        </View>

        <View style={styles.heroReadoutRow}>
          <View style={styles.heroReadout}>
            <Text style={styles.heroReadoutLabel}>ACTIVE</Text>
            <Text style={styles.heroReadoutValue}>{gates.length}</Text>
          </View>
          <View style={styles.heroReadout}>
            <Text style={styles.heroReadoutLabel}>STATUS</Text>
            <Text style={styles.heroReadoutValue}>{gateLoading ? 'SCANNING' : gates.length > 0 ? 'HOSTILE' : 'CLEAR'}</Text>
          </View>
        </View>
      </LinearGradient>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {gates.length === 0 && !gateLoading && (
        <View style={styles.emptyState}>
          <View style={styles.radarCircle}>
            <Ionicons name="scan-outline" size={48} color={mobileTheme.textDim} />
          </View>
          <Text style={styles.emptyTitle}>All clear.</Text>
          <Text style={styles.emptyBody}>
            There are no active anomalies detected in your sector.
          </Text>
          <Pressable onPress={handleScan} style={styles.scanButton}>
            <Ionicons name="search" size={16} color={mobileTheme.text} />
            <Text style={styles.scanButtonText}>SCAN FOR ANOMALIES</Text>
          </Pressable>
        </View>
      )}

      {gates.length === 0 && gateLoading && (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={mobileTheme.accent} />
          <Text style={styles.loadingText}>Analyzing recent tasks...</Text>
          <Text style={styles.loadingSubtext}>Generating procedural anomaly</Text>
        </View>
      )}

      {gates.length > 0 && (
        <View style={styles.gateWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Active Threats</Text>
            <Pressable onPress={handleScan} hitSlop={10} style={styles.scanPill}>
              <Ionicons name="scan" size={14} color={mobileTheme.text} />
              <Text style={styles.scanPillText}>RESCAN</Text>
            </Pressable>
          </View>
          
          {gates.map(gate => (
            <GateCard key={gate.id} gate={gate} onAction={() => handleEnterGate(gate.id)} />
          ))}
          
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={16} color="#FCA5A5" />
            <Text style={styles.warningText}>
              Entering a gate locks your focus. Ensure you have the time to clear it.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mobileTheme.background,
  },
  content: {
    padding: 18,
    paddingTop: 60,
    paddingBottom: 40,
    gap: 20,
  },
  hero: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: mobileTheme.border,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    gap: 14,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
  },
  heroCopy: {
    flex: 1,
  },
  eyebrow: {
    color: mobileTheme.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: mobileTheme.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: mobileTheme.textMuted,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
    marginTop: 4,
  },
  heroReadoutRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroReadout: {
    flex: 1,
    minHeight: 72,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
  },
  heroReadoutLabel: {
    color: mobileTheme.textDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  heroReadoutValue: {
    marginTop: 10,
    color: mobileTheme.text,
    fontSize: 20,
    fontWeight: '900',
  },
  errorBanner: {
    borderRadius: 16,
    backgroundColor: 'rgba(127, 29, 29, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.25)',
    padding: 16,
  },
  errorText: {
    color: mobileTheme.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
    backgroundColor: mobileTheme.panel,
    gap: 12,
  },
  radarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: mobileTheme.panelSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    color: mobileTheme.text,
    fontSize: 20,
    fontWeight: '800',
  },
  emptyBody: {
    color: mobileTheme.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: mobileTheme.accent,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14, // 48px touch target
    marginTop: 16,
  },
  scanButtonText: {
    color: mobileTheme.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    color: mobileTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  loadingSubtext: {
    color: mobileTheme.textMuted,
    fontSize: 13,
  },
  gateWrapper: {
    gap: 12,
  },
  sectionLabel: {
    color: mobileTheme.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: mobileTheme.panelSoft,
    borderWidth: 1,
    borderColor: mobileTheme.borderSoft,
  },
  scanPillText: {
    color: mobileTheme.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(127, 29, 29, 0.24)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.2)',
  },
  warningText: {
    flex: 1,
    color: mobileTheme.danger,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
})
