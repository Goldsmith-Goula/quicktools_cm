import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/Colors';

export default function Header({ currentTab, onShowFavorites }) {
  const isWhatsapp = currentTab === 'whatsapp';
  const tabTitle = {
    ussd: 'USSD Smart Hub',
    whatsapp: 'WhatsApp Quick Chat',
    settings: 'Applet Settings'
  }[currentTab];

  const brandCode = currentTab === 'ussd' ? 'US' : currentTab === 'whatsapp' ? 'WA' : 'ST';

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={[styles.brandIconBlock, { backgroundColor: isWhatsapp ? COLORS.accent : COLORS.primary }]}>
          <Text style={styles.brandIconText}>{brandCode}</Text>
        </View>
        <Text style={styles.headerTitle}>{tabTitle}</Text>
      </View>
      {currentTab === 'ussd' && (
        <TouchableOpacity 
          onPress={onShowFavorites} 
          style={styles.favoriteBadgeButton} 
          accessibilityLabel="Favorites list"
        >
          <Text style={styles.favoriteBadgeIcon}>❤️</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.white
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  brandIconBlock: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  brandIconText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black
  },
  favoriteBadgeButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center'
  },
  favoriteBadgeIcon: {
    fontSize: 16
  }
});
