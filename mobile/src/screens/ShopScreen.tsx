import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useShopStore } from '../stores/shopStore'
import { useAppStore } from '../stores/appStore'
import { mobileTheme } from '../theme'
import type { ShopItem, InventoryItem } from '../types'

type ShopTab = 'shop' | 'inventory'

const TYPE_ICON: Record<string, string> = { Consumable: 'flask', Cosmetic: 'color-palette', Passive: 'shield-half' }
const TYPE_COLOR: Record<string, string> = { Consumable: '#3b82f6', Cosmetic: '#f59e0b', Passive: '#10b981' }

export default function ShopScreen() {
  const [tab, setTab] = useState<ShopTab>('shop')
  const { items, inventory, isLoading, error, fetchItems, fetchInventory, buyItem, useItem } = useShopStore()
  const { profile } = useAppStore()
  const gold = profile?.gold || 0

  useEffect(() => { fetchItems(); fetchInventory() }, [fetchItems, fetchInventory])

  const handleBuy = (item: ShopItem) => {
    if (gold < item.price) return Alert.alert('Not Enough Gold', `You need ${item.price - gold} more gold.`)
    Alert.alert('Confirm Purchase', `Buy "${item.name}" for ${item.price} gold?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Buy', onPress: () => buyItem(item.id).catch(() => {}) },
    ])
  }

  const handleUse = (inv: InventoryItem) => {
    Alert.alert('Use Item', `Activate ${inv.shopItem?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Activate', onPress: () => useItem(inv.shopItemId) },
    ])
  }

  const renderShopItem = ({ item }: { item: ShopItem }) => {
    const tColor = TYPE_COLOR[item.type] || mobileTheme.accent
    const tIcon = TYPE_ICON[item.type] || 'cube'
    const canAfford = gold >= item.price
    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={[s.typeIcon, { backgroundColor: `${tColor}18` }]}>
            <Ionicons name={tIcon as any} size={18} color={tColor} />
          </View>
          <View style={s.typeBadge}>
            <Text style={[s.typeBadgeText, { color: tColor }]}>{item.type.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={s.cardName}>{item.name}</Text>
        {item.description ? <Text style={s.cardDesc}>{item.description}</Text> : null}
        <View style={s.cardFooter}>
          <View style={s.pricePill}>
            <Text style={s.priceText}>{item.price}</Text>
            <Text style={s.priceGold}>🪙</Text>
          </View>
          <TouchableOpacity style={[s.buyBtn, !canAfford && s.btnDisabled]} onPress={() => handleBuy(item)} disabled={isLoading} accessibilityLabel={`Buy ${item.name}`}>
            <Text style={s.buyBtnText}>{canAfford ? 'BUY' : 'LOCKED'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderInvItem = ({ item }: { item: InventoryItem }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={s.invQty}>
          <Text style={s.invQtyText}>×{item.quantity}</Text>
        </View>
      </View>
      <Text style={s.cardName}>{item.shopItem?.name || `Item #${item.shopItemId}`}</Text>
      {item.shopItem?.description ? <Text style={s.cardDesc}>{item.shopItem.description}</Text> : null}
      <TouchableOpacity style={s.useBtn} onPress={() => handleUse(item)} disabled={isLoading} accessibilityLabel={`Use ${item.shopItem?.name}`}>
        <Text style={s.useBtnText}>ACTIVATE</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={s.container}>
      {/* Hero */}
      <LinearGradient
        colors={['rgba(255,215,0,0.14)', 'rgba(5,7,13,0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.hero}
      >
        <View style={s.heroTop}>
          <View>
            <Text style={s.heroEyebrow}>HUNTER MARKETPLACE</Text>
            <Text style={s.heroTitle}>The Shop</Text>
          </View>
          <View style={s.goldBadge}>
            <Ionicons name="sparkles" size={14} color="#FFD700" />
            <Text style={s.goldText}>{gold.toLocaleString()}</Text>
          </View>
        </View>
        <View style={s.readoutRow}>
          <View style={s.readout}>
            <Text style={s.readoutLabel}>AVAILABLE</Text>
            <Text style={s.readoutValue}>{items.length}</Text>
          </View>
          <View style={s.readout}>
            <Text style={s.readoutLabel}>OWNED</Text>
            <Text style={s.readoutValue}>{inventory.length}</Text>
          </View>
          <View style={s.readout}>
            <Text style={s.readoutLabel}>GOLD</Text>
            <Text style={[s.readoutValue, { color: '#FFD700' }]}>{gold}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={s.tabs}>
        {(['shop', 'inventory'] as ShopTab[]).map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)} accessibilityRole="button">
            <Ionicons name={t === 'shop' ? 'storefront' : 'cube'} size={16} color={tab === t ? mobileTheme.accent : mobileTheme.textDim} />
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t === 'shop' ? 'Shop' : 'Inventory'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? <View style={s.errBanner}><Text style={s.errText}>{error}</Text></View> : null}

      <FlatList
        data={tab === 'shop' ? items : inventory}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={tab === 'shop' ? renderShopItem as any : renderInvItem as any}
        contentContainerStyle={s.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={tab === 'shop' ? fetchItems : fetchInventory} tintColor={mobileTheme.accent} />}
        ListEmptyComponent={
          isLoading ? <ActivityIndicator color={mobileTheme.accent} style={{ marginTop: 40 }} /> : (
            <View style={s.emptyState}>
              <View style={s.emptyIcon}>
                <Ionicons name={tab === 'shop' ? 'storefront-outline' : 'cube-outline'} size={40} color={mobileTheme.textDim} />
              </View>
              <Text style={s.emptyTitle}>{tab === 'shop' ? 'Shop is empty' : 'No items owned'}</Text>
              <Text style={s.emptyBody}>{tab === 'shop' ? 'Check back later for new items.' : 'Buy items from the shop.'}</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: mobileTheme.background },

  // Hero
  hero: { marginHorizontal: 18, marginTop: 14, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,215,0,0.15)', gap: 16 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroEyebrow: { color: mobileTheme.textDim, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  heroTitle: { color: mobileTheme.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginTop: 4 },
  goldBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,215,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  goldText: { color: '#FFD700', fontSize: 16, fontWeight: '900' },

  // Readouts
  readoutRow: { flexDirection: 'row', gap: 10 },
  readout: { flex: 1, minHeight: 68, borderRadius: 16, padding: 12, backgroundColor: 'rgba(0,0,0,0.22)', borderWidth: 1, borderColor: mobileTheme.borderSoft },
  readoutLabel: { color: mobileTheme.textDim, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  readoutValue: { marginTop: 8, color: mobileTheme.text, fontSize: 18, fontWeight: '900' },

  // Tabs
  tabs: { flexDirection: 'row', marginHorizontal: 18, marginTop: 16, backgroundColor: mobileTheme.panelSoft, borderRadius: 14, padding: 4, marginBottom: 4, borderWidth: 1, borderColor: mobileTheme.borderSoft },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 11, borderRadius: 12, gap: 6 },
  tabActive: { backgroundColor: mobileTheme.accentSoft },
  tabText: { color: mobileTheme.textDim, fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: mobileTheme.accent },

  // List
  listContent: { padding: 18, paddingBottom: 100 },

  // Cards
  card: { backgroundColor: mobileTheme.panel, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: mobileTheme.borderSoft, marginBottom: 12, gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  typeBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  cardName: { color: mobileTheme.text, fontSize: 17, fontWeight: '800' },
  cardDesc: { color: mobileTheme.textMuted, fontSize: 13, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  pricePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  priceText: { color: '#FFD700', fontSize: 15, fontWeight: '900' },
  priceGold: { fontSize: 14 },
  buyBtn: { backgroundColor: mobileTheme.accent, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 20 },
  btnDisabled: { opacity: 0.35 },
  buyBtnText: { color: mobileTheme.text, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  invQty: { backgroundColor: mobileTheme.accentSoft, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: mobileTheme.border },
  invQtyText: { color: mobileTheme.accent, fontSize: 14, fontWeight: '900' },
  useBtn: { backgroundColor: mobileTheme.panelSoft, borderWidth: 1, borderColor: mobileTheme.border, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  useBtnText: { color: mobileTheme.accent, fontSize: 12, fontWeight: '900', letterSpacing: 1 },

  // Error
  errBanner: { marginHorizontal: 18, marginTop: 10, borderRadius: 16, backgroundColor: 'rgba(127,29,29,0.28)', borderWidth: 1, borderColor: 'rgba(251,113,133,0.25)', padding: 14 },
  errText: { color: mobileTheme.danger, fontSize: 13, fontWeight: '600' },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 50, gap: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: mobileTheme.panelSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: mobileTheme.borderSoft },
  emptyTitle: { color: mobileTheme.text, fontSize: 18, fontWeight: '800' },
  emptyBody: { color: mobileTheme.textMuted, fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
})
// aria-label
