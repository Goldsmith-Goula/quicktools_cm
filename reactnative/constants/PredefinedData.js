export const STORAGE_KEYS = {
  USSD_LIST: 'quicktools_ussd_services',
  WHATSAPP_RECENTS: 'quicktools_whatsapp_recents',
  DEFAULT_NETWORK: 'quicktools_default_network',
  USER_COUNTRY: 'quicktools_user_country',
  RATE_LIMIT: 'quicktools_rate_limit_submissions'
};

export const CATEGORIES = ['All', 'Data', 'Airtime', 'Mobile Money', 'Banking', 'Bonuses', 'Support'];

export const COUNTRIES = [
  { name: 'Cameroon', code: '+237', flag: '🇨🇲' },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
  { name: 'Gabon', code: '+241', flag: '🇬🇦' },
  { name: 'Equatorial Guinea', code: '+240', flag: '🇬🇶' },
  { name: 'Chad', code: '+235', flag: '🇹🇩' }
];

export const PREDEFINED_USSD = [
  {
    id: 'u1',
    name: 'Check Balance',
    code: '*155#',
    network: 'MTN',
    category: 'Airtime',
    description: 'Check main account airtime balance and active bonuses.',
    isFavorite: false,
    isUserSubmitted: false
  },
  {
    id: 'u2',
    name: 'Buy Data Bundle',
    code: '*146#',
    network: 'MTN',
    category: 'Data',
    description: 'Browse and activate daily, weekly, or monthly MTN internet bundles.',
    isFavorite: false,
    isUserSubmitted: false
  },
  {
    id: 'u3',
    name: 'Check Balance Bundle',
    code: '*222#',
    network: 'Orange',
    category: 'Airtime',
    description: 'Verify main airtime balance and Orange voice packages.',
    isFavorite: false,
    isUserSubmitted: false
  },
  {
    id: 'u4',
    name: 'My Way Data Packs',
    code: '*147#',
    network: 'Orange',
    category: 'Data',
    description: 'Access customized cost-effective My Way daily and weekly data plans.',
    isFavorite: false,
    isUserSubmitted: false
  },
  {
    id: 'u5',
    name: 'Mobile Money Central',
    code: '*126#',
    network: 'MTN',
    category: 'Mobile Money',
    description: 'Send money, withdraw cash, pay bills, and manage MTN MoMo account.',
    isFavorite: false,
    isUserSubmitted: false
  },
  {
    id: 'u6',
    name: 'Orange Money Menu',
    code: '#150#',
    network: 'Orange',
    category: 'Mobile Money',
    description: 'Transfer funds, pay merchants, cashout, and buy airtime with Orange Money.',
    isFavorite: false,
    isUserSubmitted: false
  },
  {
    id: 'u7',
    name: 'Blue Internet Offers',
    code: '*234#',
    network: 'Camtel',
    category: 'Data',
    description: 'Explore and subscribe to CAMTEL Blue high-speed broadband bundles.',
    isFavorite: false,
    isUserSubmitted: false
  },
  {
    id: 'u8',
    name: 'Camtel Account Status',
    code: '*825#',
    network: 'Camtel',
    category: 'Support',
    description: 'View active balance, recharge account, and check Camtel phone number.',
    isFavorite: false,
    isUserSubmitted: false
  }
];
