import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/Colors';

export default function UssdCard({ item, onDial, onCopy, onToggleFavorite, onDelete }) {
  const carrierBgs = {
    MTN: COLORS.mtn,
    Orange: COLORS.orange,
    Camtel: COLORS.camtel
  };

  const getCarrierColor = (network) => carrierBgs[network] || COLORS.primary;

  return (
    <View style={styles.ussdCard}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardHeaderName} numberOfLines={1}>{item.name}</Text>
        <View style={[styles.networkTag, { backgroundColor: getCarrierColor(item.network) }]}>
          <Text style={styles.networkTagText}>{item.network.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.cardCodeText}>{item.code}</Text>
      <Text style={styles.cardDescText} numberOfLines={2}>{item.description}</Text>

      <View style={styles.cardActionsRow}>
        <TouchableOpacity 
          onPress={() => onDial(item.code)} 
          style={[styles.inlineActionButton, { backgroundColor: COLORS.primary }]}
        >
          <Text style={styles.inlineActionText}>📞 Dial</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => onCopy(item.code)} 
          style={[styles.inlineActionButton, { backgroundColor: COLORS.lightGray }]}
        >
          <Text style={[styles.inlineActionText, { color: COLORS.black }]}>✍️ Copy</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onToggleFavorite(item.id)} style={styles.actionIconButton}>
          <Text style={styles.buttonLabelIcon}>{item.isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        {item.isUserSubmitted && (
          <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionIconButton}>
            <Text style={styles.buttonLabelIcon}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ussdCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  cardHeaderName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
    flex: 1,
    marginRight: 8
  },
  networkTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  networkTagText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.white
  },
  cardCodeText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: COLORS.primary,
    marginVertical: 4
  },
  cardDescText: {
    fontSize: 11,
    color: COLORS.gray,
    lineHeight: 15,
    marginBottom: 12
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  inlineActionButton: {
    flex: 1,
    height: 38,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6
  },
  inlineActionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.white
  },
  actionIconButton: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6
  },
  buttonLabelIcon: {
    fontSize: 14
  }
});
