import React, { useState } from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './constants/Colors';
import { useAppState } from './hooks/useAppState';
import Header from './components/Header';
import UssdScreen from './screens/UssdScreen';
import WhatsAppScreen from './screens/WhatsAppScreen';
import SettingsScreen from './screens/SettingsScreen';
import {
  SubmitModal,
  FavoritesModal,
  CountryModal,
  NetworkModal,
  QrCodeModal,
  ResetConfirmModal
} from './components/CustomModals';

export default function App() {
  const [currentTab, setCurrentTab] = useState('ussd'); // 'ussd', 'whatsapp', 'settings'

  // Load state and action properties from centralized custom hook
  const {
    ussdServices,
    whatsappRecents,
    defaultNetwork,
    selectedCountry,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredUssd,
    handleDial,
    handleCopy,
    handleToggleFavorite,
    handleDeleteService,
    handleSubmitService,
    handleStartWhatsAppChat,
    handleDeleteRecent,
    handleSetDefaultNetwork,
    handleSetSelectedCountry,
    handleClearCache
  } = useAppState();

  // WhatsApp and forms state
  const [whatsAppPhone, setWhatsAppPhone] = useState('');
  const [whatsAppMessage, setWhatsAppMessage] = useState('');

  // Dialog and overlay visibility managers
  const [showSubmit, setShowSubmit] = useState(false);
  const [showFavs, setShowFavs] = useState(false);
  const [showCountry, setShowCountry] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [aiInitialData, setAiInitialData] = useState(null);

  // Quick Action Handler of filling states from outgoing recents
  const handleSelectRecent = (item) => {
    setWhatsAppPhone(item.phone);
    setWhatsAppMessage(item.message === 'No attachment message' ? '' : item.message);
    handleSetSelectedCountry({
      name: '',
      code: item.countryCode,
      flag: item.countryFlag
    });
  };

  const handleTriggerSubmit = (data = null) => {
    setAiInitialData(data);
    setShowSubmit(true);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* 1. Header */}
      <Header currentTab={currentTab} onShowFavorites={() => setShowFavs(true)} />

      {/* 2. Main Body Tabs */}
      <View style={styles.screenBody}>
        {currentTab === 'ussd' && (
          <UssdScreen
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            filteredUssd={filteredUssd}
            onDial={handleDial}
            onCopy={handleCopy}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDeleteService}
            onTriggerSubmit={handleTriggerSubmit}
          />
        )}

        {currentTab === 'whatsapp' && (
          <WhatsAppScreen
            whatsAppPhone={whatsAppPhone}
            setWhatsAppPhone={setWhatsAppPhone}
            whatsAppMessage={whatsAppMessage}
            setWhatsAppMessage={setWhatsAppMessage}
            selectedCountry={selectedCountry}
            whatsappRecents={whatsappRecents}
            onCountryShow={() => setShowCountry(true)}
            onSend={() => handleStartWhatsAppChat(whatsAppPhone, whatsAppMessage)}
            onQrShow={() => setShowQr(true)}
            onClearRecents={handleDeleteRecent}
            onSelectRecent={handleSelectRecent}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsScreen
            defaultNetwork={defaultNetwork}
            selectedCountry={selectedCountry}
            onNetworkShow={() => setShowNetwork(true)}
            onCountryShow={() => setShowCountry(true)}
            onResetShow={() => setShowReset(true)}
          />
        )}
      </View>

      {/* 3. Floating Overlay sheets (Declarative, Lazy loaded) */}
      <SubmitModal
        visible={showSubmit}
        onClose={() => setShowSubmit(false)}
        onSubmit={handleSubmitService}
        initialData={aiInitialData}
      />

      <FavoritesModal
        visible={showFavs}
        onClose={() => setShowFavs(false)}
        favoritesList={ussdServices.filter((s) => s.isFavorite)}
        onDial={handleDial}
        onToggleFavorite={handleToggleFavorite}
      />

      <CountryModal
        visible={showCountry}
        onClose={() => setShowCountry(false)}
        onSelect={handleSetSelectedCountry}
      />

      <NetworkModal
        visible={showNetwork}
        onClose={() => setShowNetwork(false)}
        defaultNetwork={defaultNetwork}
        onSelect={handleSetDefaultNetwork}
      />

      <QrCodeModal
        visible={showQr}
        onClose={() => setShowQr(false)}
        countryCode={selectedCountry.code}
        phone={whatsAppPhone}
        message={whatsAppMessage}
      />

      <ResetConfirmModal
        visible={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={handleClearCache}
      />

      {/* 4. Bottom Tab Navigation (M3 design token alignment) */}
      <View style={styles.footerNavBar}>
        <TouchableOpacity
          onPress={() => setCurrentTab('ussd')}
          style={[styles.navBarItem, currentTab === 'ussd' && styles.activeNavBarItem]}
        >
          <Ionicons name="folder" size={20} color={currentTab === 'ussd' ? COLORS.primary : COLORS.gray} />
          <Text style={[styles.navBarItemLabel, currentTab === 'ussd' && styles.activeNavBarLabel]}>USSD</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCurrentTab('whatsapp')}
          style={[styles.navBarItem, currentTab === 'whatsapp' && styles.activeNavBarItem]}
        >
          <Ionicons name="chatbubble" size={20} color={currentTab === 'whatsapp' ? COLORS.accent : COLORS.gray} />
          <Text style={[styles.navBarItemLabel, currentTab === 'whatsapp' && styles.activeNavBarLabel]}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCurrentTab('settings')}
          style={[styles.navBarItem, currentTab === 'settings' && styles.activeNavBarItem]}
        >
          <Ionicons name="settings" size={20} color={currentTab === 'settings' ? COLORS.primary : COLORS.gray} />
          <Text style={[styles.navBarItemLabel, currentTab === 'settings' && styles.activeNavBarLabel]}>Settings</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  screenBody: {
    flex: 1,
    backgroundColor: COLORS.veryLightGray
  },
  footerNavBar: {
    height: 56,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    flexDirection: 'row'
  },
  navBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4
  },
  activeNavBarItem: {
    borderTopWidth: 2,
    borderTopColor: COLORS.primary
  },
  navBarItemIcon: {
    fontSize: 20,
    color: COLORS.gray
  },
  navBarItemLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.gray,
    marginTop: 2
  },
  activeNavBarLabel: {
    color: COLORS.black,
    fontWeight: '700'
  }
});
