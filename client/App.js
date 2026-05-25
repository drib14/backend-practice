import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  Alert,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { LogOut, ShoppingBag, CreditCard, Shield, Sparkles } from 'lucide-react-native';
import { COLORS } from './constants/theme';
import { API_URL } from './config';

// Import Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import BackgroundGradient from './components/BackgroundGradient';

const { width, height } = Dimensions.get('window');

// Premium E-Commerce Accessories Catalog matching Keyshien logo details perfectly!
const PREMIUM_PRODUCTS = [
  {
    id: '1',
    name: 'Keyshien Retro Heart Glasses',
    category: 'Eyewear',
    price: '$28.00',
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // Aesthetic accessory mockup
  },
  {
    id: '2',
    name: 'Crystal Bow Choker',
    category: 'Necklaces',
    price: '$45.00',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // Premium jewelry
  },
  {
    id: '3',
    name: 'Pearl Star Stud Earrings',
    category: 'Earrings',
    price: '$24.00',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: '4',
    name: 'Pink Velvet Travel Organizer',
    category: 'Storage',
    price: '$59.00',
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [routeParams, setRouteParams] = useState(null);
  
  // Authenticated State
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Protected profile call state
  const [profileMessage, setProfileMessage] = useState('Fetching protected data...');

  // Splash Screen Timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // Plays for 2.5 seconds
    return () => clearTimeout(timer);
  }, []);

  // State Router Helper
  const navigate = (screenName, params = null) => {
    setRouteParams(params);
    setCurrentScreen(screenName);
  };

  const handleLoginSuccess = (data) => {
    setToken(data.token);
    setCurrentUser(data.user);
    navigate('MainDashboard');
  };

  const handleSignOut = () => {
    setToken(null);
    setCurrentUser(null);
    setProfileMessage('Fetching protected data...');
    navigate('Login');
  };

  // Run protected profile API call when dashboard is mounted
  useEffect(() => {
    if (currentScreen === 'MainDashboard' && token) {
      fetchProtectedProfile();
    }
  }, [currentScreen, token]);

  const fetchProtectedProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.status === 200) {
        setProfileMessage(`✓ Authorization successful. Session active!`);
      } else {
        setProfileMessage(`✗ Auth Token validation failed.`);
      }
    } catch (err) {
      console.error(err);
      setProfileMessage('✗ Protected API failed: Network error.');
    }
  };

  // 1. GORGEOUS KEYSHEIN'S ACCESSORIES SPLASH SCREEN
  if (showSplash) {
    return (
      <BackgroundGradient>
        <SafeAreaView style={styles.splashContainer}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.splashInner}>
            {/* Double Border Circular Gold Frame for Platform Icon */}
            <View style={styles.splashLogoFrame}>
              <Image
                source={require('./assets/icon.png')}
                style={styles.splashLogoImage}
              />
            </View>

            <Text style={styles.splashSubtitle}>WELCOME TO</Text>
            {/* Bold Keyshien Title */}
            <Text style={styles.splashTitle}>
              <Text style={styles.extraBoldText}>Keyshien's</Text>{'\n'}Accessories
            </Text>
            
            <View style={styles.splashFooter}>
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
              <Text style={styles.splashLoadingText}>CREATING JOY...</Text>
            </View>
          </View>
        </SafeAreaView>
      </BackgroundGradient>
    );
  }

  // Dynamic Screen Routing
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Login':
        return (
          <LoginScreen
            onNavigate={navigate}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'Register':
        return (
          <RegisterScreen
            onNavigate={navigate}
            onLoginSuccess={handleLoginSuccess} // Enlists direct login hooks on registers
          />
        );
      case 'ForgotPassword':
        return (
          <ForgotPasswordScreen
            onNavigate={navigate}
            routeParams={routeParams}
          />
        );
      case 'ResetPassword':
        return (
          <ResetPasswordScreen
            onNavigate={navigate}
            routeParams={routeParams}
          />
        );
      case 'MainDashboard':
        return renderMainDashboard();
      default:
        return (
          <LoginScreen
            onNavigate={navigate}
            onLoginSuccess={handleLoginSuccess}
          />
        );
    }
  };

  // Successful Post-Authentication Keyshien Pink Dashboard
  const renderMainDashboard = () => {
    return (
      <BackgroundGradient>
        <SafeAreaView style={styles.dashboardContainer}>
          <StatusBar barStyle="dark-content" />
          
          {/* Dashboard Header */}
          <View style={styles.dashboardHeader}>
            <View style={styles.dashboardHeaderLeft}>
              {/* Mini Platform Icon */}
              <Image source={require('./assets/icon.png')} style={styles.headerMiniIcon} />
              <View>
                <Text style={styles.welcomeLabel}>HELLO, LOVELY</Text>
                <Text style={styles.userName} numberOfLines={1}>
                  {currentUser?.name || 'Veloce Guest'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleSignOut} activeOpacity={0.6} style={styles.logoutBtn}>
              <LogOut size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Secure Session Token info Card */}
          <View style={styles.securePanelCard}>
            <View style={styles.panelTitleRow}>
              <Shield size={15} color={COLORS.primary} style={styles.shieldIcon} />
              <Text style={styles.secureCardTitle}>SECURE AUTHORIZED SESSION</Text>
            </View>
            <Text style={styles.secureStatusText}>{profileMessage}</Text>
            <Text numberOfLines={1} style={styles.tokenText}>
              JWT: {token}
            </Text>
          </View>

          {/* E-Commerce Section Title */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Boutique Feed</Text>
            <View style={styles.badgeRow}>
              <Sparkles size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.sectionBadge}>EXCLUSIVE ITEMS</Text>
            </View>
          </View>

          {/* Product Feed Grid */}
          <FlatList
            data={PREMIUM_PRODUCTS}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productListContainer}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <View style={styles.productDetails}>
                  <Text style={styles.productCategory}>{item.category}</Text>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>{item.price}</Text>
                    <TouchableOpacity activeOpacity={0.6} style={styles.addButton}>
                      <ShoppingBag size={14} color="#FFFFFF" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        </SafeAreaView>
      </BackgroundGradient>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashInner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  splashLogoFrame: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 28,
  },
  splashLogoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  splashSubtitle: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  splashTitle: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 40,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  extraBoldText: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  splashFooter: {
    marginTop: 48,
    alignItems: 'center',
  },
  loader: {
    marginBottom: 10,
  },
  splashLoadingText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  dashboardContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dashboardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerMiniIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginRight: 12,
  },
  welcomeLabel: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  userName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 1,
    maxWidth: 160,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  securePanelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginHorizontal: 24,
    marginVertical: 16,
    padding: 16,
    shadowColor: '#4C0519',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  shieldIcon: {
    marginRight: 6,
  },
  secureCardTitle: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  secureStatusText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  tokenText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionBadge: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  productListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: COLORS.bgCard,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 16,
    width: '48%',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#4C0519',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productDetails: {
    padding: 12,
  },
  productCategory: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  productName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginVertical: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  productPrice: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
