import { useState, useEffect, useMemo } from 'react';
import { Alert, Linking, Clipboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, PREDEFINED_USSD } from '../constants/PredefinedData';
import { fetchVerifiedCodes, registerCodeUsage, promoteToVerified, VERIFIED_THRESHOLD } from '../services/SupabaseService';
import { generateCodeMetadata } from '../services/GeminiService';

export function useAppState() {
  const [ussdServices, setUssdServices] = useState([]);
  const [whatsappRecents, setWhatsappRecents] = useState([]);
  const [defaultNetwork, setDefaultNetwork] = useState('MTN');
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'Cameroon',
    code: '+237',
    flag: '🇨🇲'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [submissionHistory, setSubmissionHistory] = useState([]);

  // Load configuration details from AsyncStorage
  useEffect(() => {
    loadAppPreferences();
  }, []);

  const loadAppPreferences = async () => {
    try {
      // 1. Load USSD array from local storage
      const savedUssd = await AsyncStorage.getItem(STORAGE_KEYS.USSD_LIST);
      const localList = savedUssd ? JSON.parse(savedUssd) : PREDEFINED_USSD;
      if (!savedUssd) {
        await AsyncStorage.setItem(STORAGE_KEYS.USSD_LIST, JSON.stringify(PREDEFINED_USSD));
      }

      // 2. Fetch verified community codes from Supabase and merge (no duplicates)
      const communityRows = await fetchVerifiedCodes();
      const communityMapped = communityRows.map(row => ({
        id: `community_${row.id}`,
        name: row.shortname || `${row.network} ${row.code}`,
        code: row.code,
        network: row.network,
        category: 'Community',
        description: row.description || 'Community-verified USSD code.',
        isFavorite: false,
        isUserSubmitted: false,
        isCommunity: true,
      }));

      // Merge: local codes win over community duplicates (same code+network)
      const communityFiltered = communityMapped.filter(
        cm => !localList.some(l => l.code === cm.code && l.network === cm.network)
      );
      setUssdServices([...localList, ...communityFiltered]);

      // 3. Load Recents
      const savedRecents = await AsyncStorage.getItem(STORAGE_KEYS.WHATSAPP_RECENTS);
      if (savedRecents) setWhatsappRecents(JSON.parse(savedRecents));

      // 4. Defaults
      const savedNetwork = await AsyncStorage.getItem(STORAGE_KEYS.DEFAULT_NETWORK);
      if (savedNetwork) setDefaultNetwork(savedNetwork);

      const savedCountry = await AsyncStorage.getItem(STORAGE_KEYS.USER_COUNTRY);
      if (savedCountry) setSelectedCountry(JSON.parse(savedCountry));

      // 5. Rate-limiting
      const rateLimitData = await AsyncStorage.getItem(STORAGE_KEYS.RATE_LIMIT);
      if (rateLimitData) setSubmissionHistory(JSON.parse(rateLimitData));
    } catch (e) {
      console.error('Failed to load app preferences', e);
    }
  };

  // ─── Crowdsource threshold engine ─────────────────────────────────────────
  const triggerCrowdsourceCheck = async (code, network) => {
    try {
      const newCount = await registerCodeUsage(code, network);
      if (newCount === VERIFIED_THRESHOLD) {
        // Hit the threshold — ask Gemini to generate polished metadata
        const metadata = await generateCodeMetadata(code, network);
        await promoteToVerified(code, network, metadata.shortname, metadata.description);
        console.log(`[Crowdsource] ${code} (${network}) promoted to verified at ${newCount} users.`);
      }
    } catch (e) {
      console.warn('[Crowdsource] Check failed silently:', e.message);
    }
  };

  // Dial Service
  const handleDial = (code, network) => {
    const cleanCode = encodeURIComponent(code);
    Linking.openURL(`tel:${cleanCode}`).catch(() => {
      Alert.alert('Unsupported', 'Dialing calls from this device is not supported.');
    });
    // Register usage for crowdsourcing (fire-and-forget, non-blocking)
    if (network) triggerCrowdsourceCheck(code, network);
  };

  // Copy to clipboard
  const handleCopy = (code) => {
    Clipboard.setString(code);
    Alert.alert('Copied ✓', `${code} has been successfully copied to your clipboard.`);
  };

  // Favorite toggle
  const handleToggleFavorite = async (serviceId) => {
    try {
      const updated = ussdServices.map((service) => {
        if (service.id === serviceId) {
          return { ...service, isFavorite: !service.isFavorite };
        }
        return service;
      });
      setUssdServices(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.USSD_LIST, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Delete User-Submitted Service
  const handleDeleteService = async (serviceId) => {
    try {
      const updated = ussdServices.filter((service) => service.id !== serviceId);
      setUssdServices(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.USSD_LIST, JSON.stringify(updated));
      Alert.alert('Deleted', 'The custom USSD service has been removed.');
    } catch (e) {
      console.error(e);
    }
  };

  // Submit custom USSD under rate limiting restrictions
  const handleSubmitService = async (name, code, network, category, desc) => {
    // 1. Validation checks
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please supply a descriptive service label/name.');
      return false;
    }
    const cleanCode = code.trim();
    const isValidFormat =
      (cleanCode.startsWith('*') && cleanCode.endsWith('#')) || // MTN / Camtel style
      (cleanCode.startsWith('#') && cleanCode.endsWith('#'));   // Orange style
    if (!isValidFormat) {
      Alert.alert('Validation Error', 'USSD formatting is invalid. MTN codes must start with "*" and end with "#". Orange codes must start and end with "#".');
      return false;
    }

    // 2. 24-Hour Fixed Window Rate Limiter (3 creations limit)
    const now = Date.now();
    const activeWindow24h = now - 24 * 60 * 60 * 1000;
    
    // Purge old submissions outside current active window
    const activeSubmissions = submissionHistory.filter(timestamp => timestamp > activeWindow24h);

    if (activeSubmissions.length >= 3) {
      Alert.alert(
        'Submission Limit Reached',
        'To prevent registry bloat, user submissions are capped to 3 requests per 24 hours. Please delete existing custom entries or try again tomorrow.'
      );
      return false;
    }

    try {
      const newService = {
        id: 'user_' + Date.now().toString(),
        name: name.trim(),
        code: cleanCode,
        network: network,
        category: category,
        description: desc.trim() || 'Custom user-submitted directory service.',
        isFavorite: false,
        isUserSubmitted: true
      };

      const updatedServices = [newService, ...ussdServices];
      setUssdServices(updatedServices);
      await AsyncStorage.setItem(STORAGE_KEYS.USSD_LIST, JSON.stringify(updatedServices));

      const updatedHistory = [...activeSubmissions, now];
      setSubmissionHistory(updatedHistory);
      await AsyncStorage.setItem(STORAGE_KEYS.RATE_LIMIT, JSON.stringify(updatedHistory));

      // Register with Supabase crowdsource engine (fire-and-forget)
      triggerCrowdsourceCheck(cleanCode, network);

      Alert.alert('Success ✓', 'A custom USSD code has been added to your hub.');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Launch WhatsApp Quick Chat
  const handleStartWhatsAppChat = async (phone, message) => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 9 || digitsOnly.length > 15) {
      Alert.alert('Invalid Phone', 'Please provide a valid numeric identifier space.');
      return false;
    }

    const fullNumber = `${selectedCountry.code}${digitsOnly}`.replace('+', '');
    const encodedMsg = encodeURIComponent(message);
    const linkUrl = `https://api.whatsapp.com/send?phone=${fullNumber}&text=${encodedMsg}`;

    try {
      const supported = await Linking.canOpenURL(linkUrl);
      if (supported) {
        await Linking.openURL(linkUrl);
      } else {
        await Linking.openURL(`https://wa.me/${fullNumber}?text=${encodedMsg}`);
      }

      // Record to recent list
      const formattedNum = `${selectedCountry.code} ${digitsOnly.match(/.{1,3}/g).join(' ')}`;
      const newRecent = {
        id: 'recent_' + Date.now().toString(),
        phone: digitsOnly,
        formattedPhone: formattedNum,
        message: message || 'No attachment message',
        timestamp: new Date().toLocaleDateString('en-CM', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        countryFlag: selectedCountry.flag,
        countryCode: selectedCountry.code
      };

      // Filter out duplicate phone targets
      const remaining = whatsappRecents.filter(r => r.phone !== digitsOnly);
      const updatedRecents = [newRecent, ...remaining].slice(0, 10);
      setWhatsappRecents(updatedRecents);
      await AsyncStorage.setItem(STORAGE_KEYS.WHATSAPP_RECENTS, JSON.stringify(updatedRecents));
      return true;
    } catch (e) {
      Alert.alert('Error', 'An issue was encountered while attempting to invoke WhatsApp.');
      return false;
    }
  };

  // Delete individual WhatsApp Recents item
  const handleDeleteRecent = async (recentId) => {
    try {
      const updated = whatsappRecents.filter(item => item.id !== recentId);
      setWhatsappRecents(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.WHATSAPP_RECENTS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Update default carrier priority settings
  const handleSetDefaultNetwork = async (net) => {
    try {
      setDefaultNetwork(net);
      await AsyncStorage.setItem(STORAGE_KEYS.DEFAULT_NETWORK, net);
    } catch (e) {
      console.error(e);
    }
  };

  // Update country preferences
  const handleSetSelectedCountry = async (country) => {
    try {
      setSelectedCountry(country);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_COUNTRY, JSON.stringify(country));
    } catch (e) {
      console.error(e);
    }
  };

  // Cleanup Cache
  const handleClearCache = async () => {
    try {
      await AsyncStorage.clear();
      setUssdServices(PREDEFINED_USSD);
      setWhatsappRecents([]);
      setDefaultNetwork('MTN');
      setSelectedCountry({
        name: 'Cameroon',
        code: '+237',
        flag: '🇨🇲'
      });
      setSubmissionHistory([]);
      Alert.alert('Database Cleaned ✓', 'Local Storage and offline databases have been completely purged and re-initialized.');
    } catch (e) {
      Alert.alert('Reset Error', 'Unable to complete memory scrub.');
    }
  };

  // Memoized subset filter
  const filteredUssd = useMemo(() => {
    return ussdServices.filter((service) => {
      if (selectedCategory !== 'All' && service.category !== selectedCategory) {
        return false;
      }
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      return (
        service.name.toLowerCase().includes(query) ||
        service.code.toLowerCase().includes(query) ||
        service.network.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      );
    });
  }, [ussdServices, searchQuery, selectedCategory]);

  return {
    ussdServices,
    whatsappRecents,
    defaultNetwork,
    selectedCountry,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    submissionHistory,
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
  };
}
