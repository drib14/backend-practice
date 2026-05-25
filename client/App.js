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
  Platform,
} from 'react-native';
import { LogOut, User, ShoppingBag, CreditCard, Shield } from 'lucide-react-native';
import { COLORS } from './constants/theme';
import { API_URL } from './config';

// Import Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import VerificationScreen from './screens/VerificationScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import BackgroundGradient from './components/BackgroundGradient';
import CustomButton from './components/CustomButton';

// Mock E-Commerce Premium Products list to complete the e-commerce visual look!
const PREMIUM_PRODUCTS = [
  {
    id: '1',
    name: 'Veloce Onyx Chronograph',
    category: 'Watches',
    price: '$249.00',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: '2',
    name: 'Amethyst SoundSphere ANC',
    category: 'Audio',
    price: '$189.00',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: '3',
    name: 'Nebula Matte Smart Backpack',
    category: 'Accessories',
    price: '$120.00',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: '4',
    name: 'Titanium Edge MagSafe Dock',
    category: 'Chargers',
    price: '$79.00',
    image: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [routeParams, setRouteParams] = useState(null);
  
  // Authenticated State
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Protected profile call state
  const [profileMessage, setProfileMessage] = useState('Fetching protected data...');
  const [isMeLoading, setIsMeLoading] = useState(false);

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

  const handleVerificationSuccess = (data) => {
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

  // Run protected route query when main dashboard loads
  useEffect(() => {
    if (currentScreen === 'MainDashboard' && token) {
      fetchProtectedProfile();
    }
  }, [currentScreen, token]);

  const fetchProtectedProfile = async () => {
    setIsMeLoading(true);
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
        setProfileMessage(`✓ Protected profile query passed successfully. Role: ${data.user.role || 'user'}`);
      } else {
        setProfileMessage(`✗ Protected API check failed: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setProfileMessage('✗ Protected API failed: Network error.');
    } finally {
      setIsMeLoading(false);
    }
  };

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
          />
        );
      case 'Verify':
        return (
          <VerificationScreen
            onNavigate={navigate}
            routeParams={routeParams}
            onVerificationSuccess={handleVerificationSuccess}
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

  // Successful Post-Authentication Premium E-Commerce Dashboard
  const renderMainDashboard = () => {
    return (
      <BackgroundGradient>
        <SafeAreaView style={styles.dashboardContainer}>
          <StatusBar barStyle="light-content" />
          
          {/* Dashboard Header */}
          <View style={styles.dashboardHeader}>
            <View>
              <Text style={styles.welcomeLabel}>WELCOME BACK,</Text>
              <Text style={styles.userName}>{currentUser?.name || 'Veloce Guest'}</Text>
            </View>
            <TouchableOpacity onPress={handleSignOut} activeOpacity={0.6} style={styles.logoutBtn}>
              <LogOut size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>

          {/* Secure Session Token info Card */}
          <View style={styles.securePanelCard}>
            <View style={styles.panelTitleRow}>
              <Shield size={16} color={COLORS.accent} style={styles.shieldIcon} />
              <Text style={styles.secureCardTitle}>SECURE AUTHORIZED SESSION</Text>
            </View>
            <Text style={styles.secureStatusText}>{profileMessage}</Text>
            <Text numberOfLines={1} style={styles.tokenText}>
              JWT: {token}
            </Text>
          </View>

          {/* E-Commerce Section Title */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Exclusive Catalog</Text>
            <Text style={styles.sectionBadge}>4 ITEMS AVAILABLE</Text>
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
                      <ShoppingBag size={14} color="#0A0A0F" strokeWidth={2.5} />
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  welcomeLabel: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  userName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securePanelCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    marginHorizontal: 24,
    marginVertical: 16,
    padding: 16,
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
    color: COLORS.accent,
    fontSize: 11,
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
  sectionBadge: {
    backgroundColor: COLORS.bgCard,
    borderColor: COLORS.border,
    borderWidth: 1,
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: COLORS.accent,
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
