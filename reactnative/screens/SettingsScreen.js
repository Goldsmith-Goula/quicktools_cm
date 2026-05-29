import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/Colors';

export default function SettingsScreen({
  defaultNetwork,
  selectedCountry,
  onNetworkShow,
  onCountryShow,
  onResetShow
}) {
  return (
    <ScrollView style={styles.scrollScreen}>
      <View style={styles.panelBlockSpacing}>
        <Text style={styles.infoDescriptionText}>
          Configure default values for cellular connections and manage stored user caches.
        </Text>

        <Text style={styles.inputLabelField}>General Preferences</Text>
        
        <TouchableOpacity onPress={onNetworkShow} style={styles.settingCardRow}>
          <View>
            <Text style={styles.settingCardTitle}>Preferred Telephony Network</Text>
            <Text style={styles.settingCardSub}>{defaultNetwork} (Used for priority badges formatting)</Text>
          </View>
          <Text style={styles.arrowChevron}>➔</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onCountryShow} style={styles.settingCardRow}>
          <View>
            <Text style={styles.settingCardTitle}>Standard Country DirectPrefix</Text>
            <Text style={styles.settingCardSub}>{selectedCountry.flag} {selectedCountry.name} ({selectedCountry.code})</Text>
          </View>
          <Text style={styles.arrowChevron}>➔</Text>
        </TouchableOpacity>

        <Text style={styles.inputLabelField}>Database Maintenance</Text>
        
        <TouchableOpacity onPress={onResetShow} style={styles.settingCardRowDangerous}>
          <View>
            <Text style={styles.settingCardTitleDangerous}>Inbound DB Scrub (Clear Cache)</Text>
            <Text style={styles.settingCardSubDangerous}>Wipes custom USSD registries, favorites, and WhatsApp recents</Text>
          </View>
          <Text style={styles.dangerCrossSymbol}>✕</Text>
        </TouchableOpacity>

        {/* Informational About area */}
        <View style={styles.dividerBlockSpace} />
        <View style={styles.aboutPlateCard}>
          <Text style={styles.aboutTitle}>QuickTools CM ReactNative</Text>
          <Text style={styles.aboutVersion}>Production Version 1.0.0 (Expo Core)</Text>
          <Text style={styles.aboutCredits}>
            Mirroring standard styling guidelines: Material 3 container design, 24-hr custom fixed window submission throttling, offline AsyncStorage architecture, and instant WhatsApp link triggers.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollScreen: {
    flex: 1
  },
  panelBlockSpacing: {
    padding: 16
  },
  infoDescriptionText: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
    marginBottom: 16
  },
  inputLabelField: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 6,
    marginTop: 12
  },
  settingCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray
  },
  settingCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.black
  },
  settingCardSub: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2
  },
  arrowChevron: {
    fontSize: 12,
    color: COLORS.gray
  },
  settingCardRowDangerous: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(211, 47, 47, 0.04)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.15)'
  },
  settingCardTitleDangerous: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.red
  },
  settingCardSubDangerous: {
    fontSize: 11,
    color: COLORS.red,
    opacity: 0.8,
    marginTop: 2
  },
  dangerCrossSymbol: {
    color: COLORS.red,
    fontWeight: 'bold'
  },
  dividerBlockSpace: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 16
  },
  aboutPlateCard: {
    backgroundColor: 'rgba(0, 86, 198, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 86, 198, 0.1)'
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  aboutVersion: {
    fontSize: 11,
    color: COLORS.gray,
    marginVertical: 2
  },
  aboutCredits: {
    fontSize: 11,
    color: COLORS.black,
    lineHeight: 16,
    marginTop: 6
  }
});
