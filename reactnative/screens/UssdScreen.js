import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { COLORS } from '../constants/Colors';
import { CATEGORIES } from '../constants/PredefinedData';
import UssdCard from '../components/UssdCard';

export default function UssdScreen({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  filteredUssd,
  onDial,
  onCopy,
  onToggleFavorite,
  onDelete,
  onTriggerSubmit
}) {
  return (
    <View style={styles.flexOne}>
      {/* Search Input Box */}
      <View style={styles.searchSection}>
        <Text style={styles.searchIconSymbol}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search check balance, buy data bundles..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearchAccent}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Filter Chips */}
      <View style={styles.chipRowWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.chipScrollContainer}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.chipBlock,
                  isActive && { backgroundColor: COLORS.primary }
                ]}
              >
                <Text style={[styles.chipText, isActive && { color: COLORS.white, fontWeight: '700' }]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* USSD FlatList */}
      {filteredUssd.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📁</Text>
          <Text style={styles.emptyTitle}>No Services Located</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? `No matches discovered for "${searchQuery}"` : 'Your offline repository is empty.'}
          </Text>
          <TouchableOpacity onPress={onTriggerSubmit} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Add Custom Code</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredUssd}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentPadding}
          renderItem={({ item }) => (
            <UssdCard
              item={item}
              onDial={onDial}
              onCopy={onCopy}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDelete}
            />
          )}
        />
      )}

      {/* Float Action FAB to trigger Submit Dialog */}
      <TouchableOpacity 
        onPress={onTriggerSubmit} 
        style={styles.fabButton} 
        accessibilityLabel="Create Custom USSD"
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1
  },
  searchSection: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 48,
    alignItems: 'center'
  },
  searchIconSymbol: {
    fontSize: 16,
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
    height: '100%'
  },
  clearSearchAccent: {
    fontSize: 16,
    color: COLORS.gray,
    paddingHorizontal: 6
  },
  chipRowWrapper: {
    height: 46,
    marginBottom: 8
  },
  chipScrollContainer: {
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  chipBlock: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.black
  },
  listContentPadding: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 80
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.black
  },
  emptySubtitle: {
    fontSize: 11,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 16
  },
  emptyButton: {
    paddingHorizontal: 16,
    height: 38,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700'
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  fabIcon: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '600'
  }
});
