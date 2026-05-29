import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../constants/Colors';

export default function WhatsAppScreen({
  whatsAppPhone,
  setWhatsAppPhone,
  whatsAppMessage,
  setWhatsAppMessage,
  selectedCountry,
  whatsappRecents,
  onCountryShow,
  onSend,
  onQrShow,
  onClearRecents,
  onSelectRecent
}) {
  const isPhoneValid = whatsAppPhone.length >= 9 && whatsAppPhone.length <= 15;

  return (
    <ScrollView style={styles.scrollScreen} keyboardShouldPersistTaps="handled">
      <View style={styles.panelBlockSpacing}>
        <Text style={styles.infoDescriptionText}>
          Initiate rapid encrypted WhatsApp chats with local numbers instantly without saving them into your contact address list.
        </Text>

        {/* Country Selection area */}
        <Text style={styles.inputLabelField}>Country Registry</Text>
        <TouchableOpacity onPress={onCountryShow} style={styles.countryTriggerPicker}>
          <View style={styles.rowAlign}>
            <Text style={styles.countryFlagChar}>{selectedCountry.flag}</Text>
            <Text style={styles.countryDetailsText}>{selectedCountry.name} ({selectedCountry.code})</Text>
          </View>
          <Text style={styles.dropdownMarkerText}>▼</Text>
        </TouchableOpacity>

        {/* Phone text input */}
        <Text style={styles.inputLabelField}>WhatsApp Subscriber Phone</Text>
        <View style={styles.phoneInputFieldRow}>
          <Text style={styles.phoneAddonPrefix}>{selectedCountry.code}</Text>
          <TextInput
            style={styles.phoneCoreTextInput}
            placeholder="656 123 456"
            keyboardType="number-pad"
            placeholderTextColor={COLORS.gray}
            value={whatsAppPhone}
            onChangeText={(val) => setWhatsAppPhone(val.replace(/\D/g, ''))}
          />
          {whatsAppPhone.length > 0 && (
            <TouchableOpacity onPress={() => setWhatsAppPhone('')} style={styles.padButton}>
              <Text style={styles.clearTextSign}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Character length validation indicator */}
        {whatsAppPhone.length > 0 && (
          <Text style={[styles.validationHint, { color: isPhoneValid ? COLORS.accent : COLORS.red }]}>
            {isPhoneValid ? '✓ Format is complete & valid' : '✗ Format requires 9 to 15 digits'}
          </Text>
        )}

        {/* Custom Attached Text message area */}
        <Text style={styles.inputLabelField}>Custom Attached message (Optional)</Text>
        <TextInput
          style={styles.extendedTextInputArea}
          placeholder="Hi, in need of support. Let's talk business!"
          placeholderTextColor={COLORS.gray}
          multiline
          numberOfLines={4}
          maxLength={1000}
          value={whatsAppMessage}
          onChangeText={setWhatsAppMessage}
        />
        <Text style={styles.lengthCounterLabel}>{whatsAppMessage.length}/1000</Text>

        {/* Interactive template chips */}
        <View style={styles.templatesWrapper}>
          {['Bonjour! 😊', 'Greetings! 🤝', 'Need Support! 📢'].map((temp) => (
            <TouchableOpacity key={temp} onPress={() => setWhatsAppMessage(temp)} style={styles.templateChip}>
              <Text style={styles.templateChipLabel}>{temp}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Primary launch Button */}
        <TouchableOpacity
          onPress={onSend}
          style={[
            styles.primaryActionButton,
            { backgroundColor: isPhoneValid ? COLORS.accent : COLORS.gray }
          ]}
          disabled={!isPhoneValid}
        >
          <Text style={styles.buttonLabelStrong}>💬 Invoke WhatsApp Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onQrShow}
          style={[
            styles.outlineActionButton,
            { borderColor: isPhoneValid ? COLORS.accent : COLORS.gray }
          ]}
          disabled={!isPhoneValid}
        >
          <Text style={[styles.outlineActionLabel, { color: isPhoneValid ? COLORS.accent : COLORS.gray }]}>
            🖼️ Generate Contact QR Code
          </Text>
        </TouchableOpacity>

        {/* WhatsApp Recents Panel */}
        <View style={styles.dividerBlockSpace} />
        <View style={styles.rowSpread}>
          <Text style={styles.titleSectionLabel}>Recent Outgoing Chats ({whatsappRecents.length})</Text>
          {whatsappRecents.length > 0 && (
            <TouchableOpacity onPress={onClearRecents}>
              <Text style={styles.wipeTextSign}>Wipe Recents</Text>
            </TouchableOpacity>
          )}
        </View>

        {whatsappRecents.length === 0 ? (
          <View style={styles.emptyPanelRecents}>
            <Text style={styles.emptyRecentsHint}>No outgoing chat history compiled in internal memory cache.</Text>
          </View>
        ) : (
          <View style={styles.recentsListWrap}>
            {whatsappRecents.map((item) => (
              <View key={item.id} style={styles.recentRowItem}>
                <TouchableOpacity onPress={() => onSelectRecent(item)} style={styles.recentItemCoreClick}>
                  <Text style={styles.recentTargetFlag}>{item.countryFlag}</Text>
                  <View style={styles.recentMainLines}>
                    <Text style={styles.recentPhoneHeader}>{item.countryCode} {item.phone}</Text>
                    <Text style={styles.recentMsgSub} numberOfLines={1}>{item.message}</Text>
                    <Text style={styles.recentTimestampText}>{item.timestamp}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onClearRecents(item.id)} style={styles.recentActionIconDelete}>
                  <Text style={{ fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
  countryTriggerPicker: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 10
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  countryFlagChar: {
    fontSize: 20,
    marginRight: 8
  },
  countryDetailsText: {
    fontSize: 14,
    color: COLORS.black
  },
  dropdownMarkerText: {
    fontSize: 10,
    color: COLORS.gray
  },
  phoneInputFieldRow: {
    flexDirection: 'row',
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 6
  },
  phoneAddonPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
    marginRight: 10
  },
  phoneCoreTextInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
    height: '100%',
    padding: 0
  },
  padButton: {
    padding: 8
  },
  clearTextSign: {
    color: COLORS.gray, 
    fontSize: 14
  },
  validationHint: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8
  },
  extendedTextInputArea: {
    height: 100,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.black,
    textAlignVertical: 'top'
  },
  lengthCounterLabel: {
    fontSize: 10,
    color: COLORS.gray,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 12
  },
  templatesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16
  },
  templateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: COLORS.white
  },
  templateChipLabel: {
    fontSize: 11,
    color: COLORS.black,
    fontWeight: '500'
  },
  primaryActionButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginBottom: 10
  },
  buttonLabelStrong: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold'
  },
  outlineActionButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16
  },
  outlineActionLabel: {
    fontSize: 13,
    fontWeight: 'bold'
  },
  dividerBlockSpace: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 16
  },
  rowSpread: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  titleSectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black
  },
  wipeTextSign: {
    fontSize: 12, 
    color: COLORS.red, 
    fontWeight: '600'
  },
  emptyPanelRecents: {
    height: 80,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  emptyRecentsHint: {
    fontSize: 11,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 16
  },
  recentsListWrap: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    overflow: 'hidden'
  },
  recentRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingRight: 12
  },
  recentItemCoreClick: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12
  },
  recentTargetFlag: {
    fontSize: 24,
    marginRight: 12
  },
  recentMainLines: {
    flex: 1
  },
  recentPhoneHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.black
  },
  recentMsgSub: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2
  },
  recentTimestampText: {
    fontSize: 9,
    color: COLORS.gray,
    opacity: 0.8,
    marginTop: 4
  },
  recentActionIconDelete: {
    padding: 8
  }
});
