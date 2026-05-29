import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Share
} from 'react-native';
import { COLORS } from '../constants/Colors';
import { CATEGORIES, COUNTRIES } from '../constants/PredefinedData';

// Modals: 1. Custom USSD Submit Modal
export function SubmitModal({ visible, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [network, setNetwork] = useState('MTN');
  const [category, setCategory] = useState('Data');
  const [desc, setDesc] = useState('');

  const handleSub = async () => {
    const success = await onSubmit(name, code, network, category, desc);
    if (success) {
      setName('');
      setCode('');
      setDesc('');
      onClose();
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalViewport}>
        <View style={styles.modalContentBox}>
          <View style={styles.modalHeaderSpread}>
            <Text style={styles.modalTitleLabel}>Submit Code Registry</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCloseIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalInnerScroll}>
            <Text style={styles.inputLabelField}>Service Name / Label</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="e.g. Check Internet Data bundle"
              placeholderTextColor={COLORS.gray}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inputLabelField}>USSD Sequence Code</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="*146*2#"
              placeholderTextColor={COLORS.gray}
              value={code}
              onChangeText={setCode}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabelField}>Assigned Cell Provider</Text>
            <View style={styles.inlineConfigPickerRow}>
              {['MTN', 'Orange', 'Camtel'].map((carrier) => (
                <TouchableOpacity
                  key={carrier}
                  onPress={() => setNetwork(carrier)}
                  style={[
                    styles.carrierSelectorOption,
                    network === carrier && { backgroundColor: COLORS.primary }
                  ]}
                >
                  <Text style={[styles.carrierSelectorText, network === carrier && { color: COLORS.white }]}>
                    {carrier}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabelField}>Registry Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formCategoryRow}>
              {CATEGORIES.slice(1).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.templateChip,
                    category === cat && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                  ]}
                >
                  <Text style={[styles.templateChipLabel, category === cat && { color: COLORS.white }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabelField}>Action Description</Text>
            <TextInput
              style={styles.modalTextExtendedArea}
              placeholder="Provide a description of the USSD action (optional)..."
              placeholderTextColor={COLORS.gray}
              multiline
              numberOfLines={3}
              value={desc}
              onChangeText={setDesc}
            />

            <View style={styles.warningRateBadge}>
              <Text style={styles.warningRateText}>
                ⚠️ Rate-Limit Notice: System permits max 3 entries per rolling 24-hour cycle. Submission tracking is offline.
              </Text>
            </View>

            <TouchableOpacity onPress={handleSub} style={[styles.primaryActionButton, { marginTop: 12 }]}>
              <Text style={styles.buttonLabelStrong}>Verify And Submit Registry</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Modals: 2. Favorites List Modal
export function FavoritesModal({ visible, onClose, favoritesList, onDial, onToggleFavorite }) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalViewport}>
        <View style={styles.modalContentBox}>
          <View style={styles.modalHeaderSpread}>
            <Text style={styles.modalTitleLabel}>❤️ Saved Favorites</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCloseIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={favoritesList}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🤍</Text>
                <Text style={styles.emptyTitle}>Favorites list empty</Text>
                <Text style={styles.emptySubtitle}>Tap the heart icon on any standard or custom USSD card to save it here for fast access.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.favoriteRowCompact}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.favoritePhoneHeader}>{item.name}</Text>
                  <Text style={styles.favoriteCodeLabel}>{item.code} • {item.network}</Text>
                </View>
                <TouchableOpacity onPress={() => onDial(item.code)} style={styles.favoriteDialButton}>
                  <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: '700' }}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onToggleFavorite(item.id)} style={{ padding: 8 }}>
                  <Text style={{ fontSize: 16 }}>💔</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

// Modals: 3. Country Entry Modal Selector
export function CountryModal({ visible, onClose, onSelect }) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalFullViewportOverlay}>
        <View style={styles.dialogCardWrapper}>
          <Text style={styles.dialogTitleHeader}>Select Prefix Location</Text>
          
          {COUNTRIES.map((country) => (
            <TouchableOpacity
              key={country.name}
              onPress={() => {
                onSelect(country);
                onClose();
              }}
              style={styles.dialogRowItemClickable}
            >
              <Text style={styles.dialogFlagLabel}>{country.flag}</Text>
              <Text style={styles.dialogCarrierLabel}>{country.name} ({country.code})</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={onClose} style={styles.dialogCancelTextButton}>
            <Text style={styles.dialogCancelLabelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Modals: 4. Network Selector Modal
export function NetworkModal({ visible, onClose, defaultNetwork, onSelect }) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalFullViewportOverlay}>
        <View style={styles.dialogCardWrapper}>
          <Text style={styles.dialogTitleHeader}>Select Carrier Preference</Text>
          
          {['MTN', 'Orange', 'Camtel'].map((net) => (
            <TouchableOpacity
              key={net}
              onPress={() => {
                onSelect(net);
                onClose();
              }}
              style={styles.dialogRowItemClickable}
            >
              <Text style={styles.dialogCarrierLabel}>{net} Network Profile</Text>
              {defaultNetwork === net && <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>✓</Text>}
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={onClose} style={styles.dialogCancelTextButton}>
            <Text style={styles.dialogCancelLabelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Modals: 5. QR Code Maker Fallback Card
export function QrCodeModal({ visible, onClose, countryCode, phone, message }) {
  const targetLink = `https://wa.me/${countryCode.replace('+', '')}${phone}?text=${encodeURIComponent(message)}`;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalFullViewportOverlay}>
        <View style={styles.dialogCardWrapper}>
          <Text style={styles.dialogTitleHeader}>✨ WhatsApp QR Inviter</Text>
          <Text style={styles.qrDescriptionText}>
            Scan this visual identifier using any target smartphone camera tool to invoke quick chat.
          </Text>

          <View style={styles.qrCodeOutputBlock}>
            <Image
              source={{
                uri: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(targetLink)}`
              }}
              style={styles.qrVisualItemImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.qrTargetEndpointLabel}>
            Target: {countryCode} {phone}
          </Text>

          <TouchableOpacity
            onPress={() => {
              Share.share({
                message: `QuickTools Contact Invite: ${targetLink}`
              });
            }}
            style={styles.primaryActionButton}
          >
            <Text style={styles.buttonLabelStrong}>Share Link Target</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.dialogCancelTextButton}>
            <Text style={[styles.dialogCancelLabelText, { color: COLORS.gray }]}>Close Viewer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Modals: 6. Flush Confirmation Modal
export function ResetConfirmModal({ visible, onClose, onConfirm }) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalFullViewportOverlay}>
        <View style={styles.dialogCardWrapper}>
          <Text style={[styles.dialogTitleHeader, { color: COLORS.red }]}>⚠️ Scrub Local Caches?</Text>
          <Text style={styles.qrDescriptionText}>
            This action will systematically delete user registrations, incoming recents, favorite markers, and reset preference properties. This action cannot be reversed.
          </Text>

          <TouchableOpacity
            onPress={() => {
              onConfirm();
              onClose();
            }}
            style={[styles.primaryActionButton, { backgroundColor: COLORS.red }]}
          >
            <Text style={styles.buttonLabelStrong}>Confirm Scrubbing Operation</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.dialogCancelTextButton}>
            <Text style={styles.dialogCancelLabelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalViewport: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.overlay
  },
  modalContentBox: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '90%'
  },
  modalHeaderSpread: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 12,
    marginBottom: 8
  },
  modalTitleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black
  },
  modalCloseIcon: {
    fontSize: 20,
    color: COLORS.gray,
    padding: 4
  },
  modalInnerScroll: {
    paddingBottom: 24
  },
  inputLabelField: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 6,
    marginTop: 12
  },
  modalTextInput: {
    height: 44,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.black,
    marginBottom: 10
  },
  inlineConfigPickerRow: {
    flexDirection: 'row',
    marginBottom: 10
  },
  carrierSelectorOption: {
    flex: 1,
    height: 38,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6
  },
  carrierSelectorText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.black
  },
  formCategoryRow: {
    marginBottom: 10
  },
  templateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 6,
    marginRight: 6,
    backgroundColor: COLORS.white
  },
  templateChipLabel: {
    fontSize: 11,
    color: COLORS.black,
    fontWeight: '500'
  },
  modalTextExtendedArea: {
    height: 64,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.black,
    textAlignVertical: 'top',
    marginBottom: 10
  },
  warningRateBadge: {
    backgroundColor: '#FFFBEB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    padding: 10,
    marginVertical: 4
  },
  warningRateText: {
    fontSize: 10,
    color: '#D97706',
    lineHeight: 14,
    fontWeight: '500'
  },
  primaryActionButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary
  },
  buttonLabelStrong: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold'
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
    marginTop: 4
  },
  favoriteRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray
  },
  favoritePhoneHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black
  },
  favoriteCodeLabel: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2
  },
  favoriteDialButton: {
    paddingHorizontal: 14,
    height: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8
  },
  modalFullViewportOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dialogCardWrapper: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6
  },
  dialogTitleHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'center'
  },
  dialogRowItemClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray
  },
  dialogFlagLabel: {
    fontSize: 22,
    marginRight: 10
  },
  dialogCarrierLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.black,
    flex: 1
  },
  dialogCancelTextButton: {
    marginTop: 16,
    alignItems: 'center'
  },
  dialogCancelLabelText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  qrDescriptionText: {
    fontSize: 11,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16
  },
  qrCodeOutputBlock: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginBottom: 12
  },
  qrVisualItemImage: {
    width: '100%',
    height: '100%'
  },
  qrTargetEndpointLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 16
  }
});
