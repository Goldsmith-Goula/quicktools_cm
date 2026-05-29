import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { CATEGORIES } from '../constants/PredefinedData';
import UssdCard from '../components/UssdCard';
import { getAiUssdSuggestion } from '../services/GeminiService';

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
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Clear AI suggestion whenever user changes the search query
  useEffect(() => {
    setAiSuggestion(null);
    setAiError(null);
  }, [searchQuery]);

  const handleAskAi = async () => {
    if (!searchQuery.trim()) return;
    setAiLoading(true);
    setAiSuggestion(null);
    setAiError(null);
    try {
      const result = await getAiUssdSuggestion(searchQuery);
      setAiSuggestion(result);
    } catch (e) {
      setAiError('Could not get AI suggestion. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <View style={styles.flexOne}>
      {/* Search Input Box */}
      <View style={styles.searchSection}>
        <Ionicons name="search" size={16} color={COLORS.gray} style={{ marginRight: 8 }} />
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
            <Ionicons name="close-circle" size={16} color={COLORS.gray} style={{ paddingHorizontal: 6 }} />
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

      {/* USSD FlatList / Empty State */}
      {filteredUssd.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>

          {/* AI Error state */}
          {aiError && (
            <View style={styles.aiErrorCard}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" style={{ marginRight: 8 }} />
              <Text style={styles.aiErrorText}>{aiError}</Text>
            </View>
          )}

          {/* AI Suggestion card (shown after Ask AI is tapped) */}
          {aiSuggestion && (
            <View style={styles.aiSuggestionCard}>
              <View style={styles.aiSuggestionHeader}>
                <Ionicons name="sparkles" size={16} color="#7C3AED" style={{ marginRight: 6 }} />
                <Text style={styles.aiSuggestionLabel}>AI Suggestion</Text>
                <View style={[styles.networkTag, { backgroundColor: '#7C3AED', marginLeft: 'auto' }]}>
                  <Text style={styles.networkTagText}>{aiSuggestion.network}</Text>
                </View>
              </View>
              <Text style={styles.aiCode}>{aiSuggestion.code}</Text>
              <Text style={styles.aiName}>{aiSuggestion.name}</Text>
              <Text style={styles.aiDesc}>{aiSuggestion.description}</Text>
              <View style={styles.aiConfidenceRow}>
                {[1,2,3,4,5].map(s => (
                  <Ionicons key={s} name={s <= aiSuggestion.confidenceStars ? 'star' : 'star-outline'} size={14} color="#F59E0B" />
                ))}
                <Text style={styles.aiConfidenceText}>{aiSuggestion.confidencePercentage}% confidence</Text>
              </View>
              <View style={styles.aiActionRow}>
                <TouchableOpacity
                  style={[styles.aiDialButton, { flex: 1, marginRight: 8 }]}
                  onPress={() => onDial(aiSuggestion.code, aiSuggestion.network)}
                >
                  <Ionicons name="call" size={14} color="white" style={{ marginRight: 6 }} />
                  <Text style={styles.aiDialButtonText}>Dial</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.aiDialButton, { flex: 1, backgroundColor: '#059669' }]}
                  onPress={() => onTriggerSubmit(aiSuggestion)}
                >
                  <Ionicons name="add-circle-outline" size={14} color="white" style={{ marginRight: 6 }} />
                  <Text style={styles.aiDialButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Ionicons name="folder-open-outline" size={48} color={COLORS.gray} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>No Services Located</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? `No matches for "${searchQuery}"` : 'Your offline repository is empty.'}
          </Text>

          {/* Ask AI button — only shown when user typed a query */}
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity
              style={styles.askAiButton}
              onPress={handleAskAi}
              disabled={aiLoading}
            >
              {aiLoading
                ? <ActivityIndicator size="small" color={COLORS.white} />
                : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="sparkles" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
                    <Text style={styles.askAiButtonText}>Ask Gemini AI</Text>
                  </View>
                )
              }
            </TouchableOpacity>
          )}

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
        <Ionicons name="add" size={24} color={COLORS.white} />
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
  },
  aiSuggestionCard: {
    width: '100%',
    backgroundColor: '#F3E8FF', // Light purple
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D8B4FE',
  },
  aiSuggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiSuggestionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  aiCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  aiName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  aiDesc: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 12,
    lineHeight: 18,
  },
  aiConfidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiConfidenceText: {
    fontSize: 11,
    color: COLORS.gray,
    marginLeft: 6,
  },
  aiDialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 10,
    borderRadius: 8,
  },
  aiDialButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  askAiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  askAiButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  networkTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  networkTagText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  aiActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  aiErrorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  aiErrorText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
  }
});
