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
  TextInput,
  ScrollView,
  Modal,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { LogOut, ShoppingBag, CreditCard, Shield, Sparkles, ShoppingCart, User, Trash2, CheckCircle, ArrowRight } from 'lucide-react-native';
import { COLORS } from './constants/theme';
import { API_URL, APP_NAME } from './config';

// Import Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import BackgroundGradient from './components/BackgroundGradient';
import CustomInput from './components/CustomInput';
import CustomButton from './components/CustomButton';

const { width, height } = Dimensions.get('window');

// Premium E-Commerce Accessories Catalog matching Keyshien logo details perfectly!
const PREMIUM_PRODUCTS = [
  {
    id: '1',
    name: 'Keyshien Retro Heart Glasses',
    category: 'Eyewear',
    price: 28.00,
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
  },
  {
    id: '2',
    name: 'Crystal Bow Choker',
    category: 'Necklaces',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
  },
  {
    id: '3',
    name: 'Pearl Star Stud Earrings',
    category: 'Earrings',
    price: 24.00,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: '4',
    name: 'Pink Velvet Travel Organizer',
    category: 'Storage',
    price: 59.00,
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
];

const getInitials = (name) => {
  if (!name) return 'KS';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export default function App() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [routeParams, setRouteParams] = useState(null);
  
  // Dashboard Sub-navigation Tabs: 'Boutique' | 'Cart' | 'Profile'
  const [activeTab, setActiveTab] = useState('Boutique');

  // Authenticated State
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // E-Commerce Store Products & User Orders State
  const [products, setProducts] = useState(PREMIUM_PRODUCTS);
  const [orders, setOrders] = useState([]);
  
  // E-Commerce Cart State
  const [cart, setCart] = useState([]);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [orderSuccessVisible, setOrderSuccessVisible] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState(null);
  const [payLoading, setPayLoading] = useState(false);

  // PayMongo Card Inputs State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Profile Edit / Password Forms State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const baseUrl = API_URL.replace('/api/auth', '/api/products');
      const response = await fetch(baseUrl);
      const data = await response.json();
      if (data.status === 'success' && data.products && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (err) {
      console.warn('Failed to fetch dynamic products from MongoDB, utilizing offline catalog fallback:', err.message);
    }
  };

  const fetchOrders = async (authToken) => {
    const activeToken = authToken || token;
    if (!activeToken) return;

    try {
      const baseUrl = API_URL.replace('/api/auth', '/api/orders');
      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`,
        },
      });
      const data = await response.json();
      if (data.status === 'success' && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.warn('Failed to retrieve e-commerce transaction histories:', err.message);
    }
  };

  // Splash Screen Timeout and Seed Seeding on startup
  useEffect(() => {
    fetchProducts();
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
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
    setEditName(data.user.name);
    setEditEmail(data.user.email);
    fetchOrders(data.token);
    setActiveTab('Boutique');
    navigate('MainDashboard');
  };

  const handleSignOut = () => {
    setToken(null);
    setCurrentUser(null);
    setCart([]);
    navigate('Login');
  };

  // E-Commerce Buying Methods
  const addToCart = (product) => {
    const productId = product.id || product._id;
    const existing = cart.find(item => (item.id || item._id) === productId);
    if (existing) {
      setCart(cart.map(item => (item.id || item._id) === productId ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    Alert.alert('Item Added', `${product.name} has been added to your shopping cart.`);
  };

  const updateCartQuantity = (id, delta) => {
    const updated = cart.map(item => {
      const itemId = item.id || item._id;
      if (itemId === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);
    setCart(updated);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const triggerCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Your shopping cart is currently empty.');
      return;
    }
    setCardName(currentUser?.name || '');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCheckoutVisible(true);
  };

  const handlePayMongoSubmit = async () => {
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      Alert.alert('Missing Details', 'Please fill out all PayMongo card details to secure authorization.');
      return;
    }

    setPayLoading(true);
    try {
      // Structure checkout items for database
      const orderItems = cart.map(item => ({
        productId: item.id || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      const maskedNumber = `${cardNumber.substring(0, 4)}********${cardNumber.substring(12, 16) || '3333'}`;
      const totalAmount = getCartTotal() + 5.00;

      const orderBody = {
        items: orderItems,
        total: totalAmount,
        shippingFee: 5.00,
        paymentDetails: {
          cardholderName: cardName,
          cardNumberMasked: maskedNumber,
        },
      };

      const baseUrl = API_URL.replace('/api/auth', '/api/orders');
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderBody),
      });

      const data = await response.json();

      if (response.status === 201 && data.status === 'success') {
        setLastOrderDetails({
          orderNumber: data.order.orderNumber,
          total: data.order.total,
          items: data.order.items,
        });
        setCart([]); // Clear cart
        setCheckoutVisible(false);
        setOrderSuccessVisible(true);
        // Refresh orders list
        fetchOrders(token);
      } else {
        Alert.alert('Payment Denied', data.message || 'Authorization failed through PayMongo gateway.');
      }
    } catch (err) {
      console.error('Checkout API Error:', err);
      Alert.alert('Network Error', 'Failed to connect to e-commerce transaction server.');
    } finally {
      setPayLoading(false);
    }
  };

  // Profile Management API Methods
  const handleUpdateProfile = async () => {
    if (!editName || !editEmail) {
      Alert.alert('Validation Error', 'Full Name and Email Address are required.');
      return;
    }

    setProfileLoading(true);
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });
      const data = await response.json();

      if (response.status === 200) {
        setCurrentUser(data.user);
        Alert.alert('Profile Updated', 'Your profile details have been saved successfully.');
      } else {
        Alert.alert('Update Failed', data.message || 'Email already exists or invalid data.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Network Error', 'Failed to update details. Please check connection.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Validation Error', 'Please complete both password fields.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Password Length', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    setProfileLoading(true);
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await response.json();

      if (response.status === 200) {
        Alert.alert('Password Secure', 'Your security password has been changed successfully.');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Update Failed', data.message || 'Failed to update password.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Network Error', 'Could not change password. Please check network.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Irreversible Action!',
      'Are you absolutely sure you want to permanently delete your boutique account? All cart histories, security profiles, and shopping coordinates will be deleted from the database.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Terminate',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/profile`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.status === 200) {
                Alert.alert(
                  'Account Terminated',
                  'Your profile and all secure keys have been deleted. We hope to see you again!'
                );
                handleSignOut();
              } else {
                Alert.alert('Termination Failed', 'Could not complete account deletion request.');
              }
            } catch (err) {
              console.error(err);
              Alert.alert('Network Error', 'Failed to delete account. Connection timed out.');
            }
          }
        }
      ]
    );
  };

  // 1. SPLASH SCREEN RENDER
  if (showSplash) {
    return (
      <BackgroundGradient>
        <SafeAreaView style={styles.splashContainer}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.splashInner}>
            <View style={styles.splashLogoFrame}>
              <Image
                source={require('./assets/icon.png')}
                style={styles.splashLogoImage}
              />
            </View>
            <Text style={styles.splashSubtitle}>WELCOME TO</Text>
            <Text style={styles.splashTitle}>
              <Text style={styles.extraBoldText}>{APP_NAME}'s</Text>{'\n'}Accessories
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

  // Dynamic Routing for Screens
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
            onLoginSuccess={handleLoginSuccess}
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

  // 2. MAIN BOUTIQUE FEED SCREEN
  const renderBoutiqueTab = () => {
    return (
      <FlatList
        data={products}
        keyExtractor={(item) => item.id || item._id}
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
                <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                <TouchableOpacity onPress={() => addToCart(item)} activeOpacity={0.6} style={styles.addButton}>
                  <ShoppingBag size={14} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    );
  };

  // 3. SHOPPING CART SCREEN
  const renderCartTab = () => {
    if (cart.length === 0) {
      return (
        <View style={styles.emptyCartContainer}>
          <ShoppingCart size={48} color={COLORS.placeholder} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartSub}>Add lovely pink accessories from the Boutique feed to get started.</Text>
          <CustomButton title="Explore Boutique" onPress={() => setActiveTab('Boutique')} style={{ width: 180, marginTop: 16 }} />
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.cartScroll} showsVerticalScrollIndicator={false}>
        {/* Cart items list */}
        {cart.map((item) => (
          <View key={item.id} style={styles.cartItemCard}>
            <Image source={{ uri: item.image }} style={styles.cartItemImg} />
            <View style={styles.cartItemDetails}>
              <Text style={styles.cartItemName}>{item.name}</Text>
              <Text style={styles.cartItemCategory}>{item.category}</Text>
              <Text style={styles.cartItemPrice}>${item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity onPress={() => updateCartQuantity(item.id, -1)} activeOpacity={0.6} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => updateCartQuantity(item.id, 1)} activeOpacity={0.6} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Pricing Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>${getCartTotal().toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Boutique Logistics</Text>
            <Text style={styles.summaryVal}>$5.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>${(getCartTotal() + 5.00).toFixed(2)}</Text>
          </View>
          
          <CustomButton
            title="Proceed to Secure Checkout"
            onPress={triggerCheckout}
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>
    );
  };

  // 4. PROFILE & ACCOUNT SCREEN
  const renderProfileTab = () => {
    return (
      <ScrollView contentContainerStyle={styles.profileScroll} showsVerticalScrollIndicator={false}>
        {/* Profile Card details */}
        <View style={styles.profileHeaderCard}>
        <View style={styles.profileInitialsContainer}>
          <Text style={styles.profileInitialsText}>
            {getInitials(currentUser?.name)}
          </Text>
        </View>
        <Text style={styles.profileName}>{currentUser?.name || 'Guest'}</Text>
          <Text style={styles.profileEmail}>{currentUser?.email || 'guest@keyshien.com'}</Text>
        </View>

        {/* Edit details form */}
        <View style={styles.profileFormCard}>
          <Text style={styles.formCardHeader}>EDIT PROFILE DETAILS</Text>
          <CustomInput
            label="Full Name"
            iconName="User"
            value={editName}
            onChangeText={setEditName}
            placeholder="Edit name"
          />
          <CustomInput
            label="Email Address"
            iconName="Mail"
            value={editEmail}
            onChangeText={setEditEmail}
            placeholder="Edit email address"
            keyboardType="email-address"
          />
          <CustomButton
            title="Save Profile Details"
            onPress={handleUpdateProfile}
            loading={profileLoading}
            style={{ marginTop: 8, height: 46 }}
          />
        </View>

        {/* Change password form */}
        <View style={styles.profileFormCard}>
          <Text style={styles.formCardHeader}>CHANGE PASSWORD</Text>
          <CustomInput
            label="New Password"
            iconName="Lock"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry
          />
          <CustomInput
            label="Confirm New Password"
            iconName="Lock"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
          />
          <CustomButton
            title="Update Password"
            onPress={handleUpdatePassword}
            loading={profileLoading}
            style={{ marginTop: 8, height: 46 }}
          />
        </View>

        {/* Order History list */}
        <View style={styles.profileFormCard}>
          <Text style={styles.formCardHeader}>YOUR ORDER HISTORY</Text>
          {orders.length === 0 ? (
            <Text style={styles.emptyOrdersText}>No past transactions logged in database.</Text>
          ) : (
            orders.map((ord) => (
              <View key={ord._id} style={styles.orderHistoryItem}>
                <View style={styles.orderHistoryHeader}>
                  <Text style={styles.orderHistoryNum}>{ord.orderNumber}</Text>
                  <Text style={styles.orderHistoryDate}>
                    {new Date(ord.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.orderHistoryBody}>
                  <Text style={styles.orderHistoryItemsCount}>
                    {ord.items.reduce((sum, i) => sum + i.quantity, 0)} items purchased
                  </Text>
                  <Text style={styles.orderHistoryTotal}>
                    ${ord.total.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.orderHistoryCardMask}>
                  Charged via PayMongo (Card Ending: {ord.paymentDetails.cardNumberMasked.slice(-4)})
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Danger zone account deletion */}
        <View style={[styles.profileFormCard, styles.dangerCard]}>
          <Text style={[styles.formCardHeader, { color: COLORS.error }]}>DANGER ZONE</Text>
          <Text style={styles.dangerDesc}>
            Deleting your account will permanently wipe all database credentials and details. This cannot be undone.
          </Text>
          <TouchableOpacity onPress={handleDeleteAccount} activeOpacity={0.6} style={styles.deleteAccBtn}>
            <Trash2 size={16} color={COLORS.error} style={{ marginRight: 6 }} />
            <Text style={styles.deleteAccText}>Delete Account Permanently</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Dynamic dashboard tabs compiler
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Boutique':
        return renderBoutiqueTab();
      case 'Cart':
        return renderCartTab();
      case 'Profile':
        return renderProfileTab();
      default:
        return renderBoutiqueTab();
    }
  };

  // Main Dashboard wrapper
  const renderMainDashboard = () => {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <BackgroundGradient>
        <SafeAreaView style={styles.dashboardContainer}>
          <StatusBar barStyle="dark-content" />
          
          {/* Header */}
          <View style={styles.dashboardHeader}>
            <View style={styles.dashboardHeaderLeft}>
              <Image source={require('./assets/icon.png')} style={styles.headerMiniIcon} />
              <View>
                <Text style={styles.welcomeLabel}>WELCOME TO</Text>
                <Text style={styles.userName}>
                  <Text style={styles.extraBoldText}>{APP_NAME}</Text>'s
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleSignOut} activeOpacity={0.6} style={styles.logoutBtn}>
              <LogOut size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Render Active Tab Screen */}
          <View style={{ flex: 1 }}>{renderActiveTab()}</View>

          {/* Customized Bottom Tab Navigator bar */}
          <View style={styles.tabBar}>
            {/* Boutique Tab button */}
            <TouchableOpacity
              onPress={() => setActiveTab('Boutique')}
              activeOpacity={0.7}
              style={[styles.tabItem, activeTab === 'Boutique' && styles.tabItemActive]}
            >
              <ShoppingBag size={20} color={activeTab === 'Boutique' ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[styles.tabText, activeTab === 'Boutique' && styles.tabTextActive]}>Boutique</Text>
            </TouchableOpacity>

            {/* Cart Tab button */}
            <TouchableOpacity
              onPress={() => setActiveTab('Cart')}
              activeOpacity={0.7}
              style={[styles.tabItem, activeTab === 'Cart' && styles.tabItemActive]}
            >
              <View style={styles.cartIconWrapper}>
                <ShoppingCart size={20} color={activeTab === 'Cart' ? COLORS.primary : COLORS.textSecondary} />
                {cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabText, activeTab === 'Cart' && styles.tabTextActive]}>Cart</Text>
            </TouchableOpacity>

            {/* Profile Tab button */}
            <TouchableOpacity
              onPress={() => {
                setActiveTab('Profile');
                fetchOrders(token);
              }}
              activeOpacity={0.7}
              style={[styles.tabItem, activeTab === 'Profile' && styles.tabItemActive]}
            >
              <User size={20} color={activeTab === 'Profile' ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[styles.tabText, activeTab === 'Profile' && styles.tabTextActive]}>Profile</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* PAYMONGO SECURE CHECKOUT MODAL OVERLAY */}
        <Modal visible={checkoutVisible} animationType="slide" transparent={true} onRequestClose={() => setCheckoutVisible(false)}>
          <View style={styles.modalBg}>
            <View style={styles.checkoutSheet}>
              {/* Sheet header */}
              <View style={styles.sheetHeader}>
                <View style={styles.paymongoLogoRow}>
                  <CreditCard size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.paymongoTitle}>Pay<Text style={styles.extraBoldText}>Mongo</Text> SECURE</Text>
                </View>
                <TouchableOpacity onPress={() => setCheckoutVisible(false)} activeOpacity={0.6} style={styles.closeSheetBtn}>
                  <Text style={styles.closeSheetText}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                <Text style={styles.paymentSummaryLabel}>PAYMENT FOR ORDER</Text>
                <Text style={styles.paymentSummaryAmt}>${(getCartTotal() + 5.00).toFixed(2)}</Text>
                
                <CustomInput
                  label="Cardholder Full Name"
                  iconName="User"
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="e.g. Lovely Keyshien User"
                />

                <CustomInput
                  label="Card Number"
                  iconName="CreditCard"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(text.replace(/[^0-9]/g, '').substring(0, 16))}
                  placeholder="4111 1111 2222 3333"
                  keyboardType="numeric"
                  maxLength={16}
                />

                <View style={styles.cardExpiryRow}>
                  <View style={{ width: '48%' }}>
                    <CustomInput
                      label="Expiry Date"
                      iconName="Calendar"
                      value={cardExpiry}
                      onChangeText={(text) => setCardExpiry(text.substring(0, 5))}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </View>
                  <View style={{ width: '48%' }}>
                    <CustomInput
                      label="CVV"
                      iconName="ShieldAlert"
                      value={cardCvv}
                      onChangeText={(text) => setCardCvv(text.replace(/[^0-9]/g, '').substring(0, 3))}
                      placeholder="***"
                      keyboardType="numeric"
                      secureTextEntry
                      maxLength={3}
                    />
                  </View>
                </View>

                {payLoading ? (
                  <View style={{ marginVertical: 12, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.processingText}>Authorizing PayMongo Secure Tokens...</Text>
                  </View>
                ) : (
                  <CustomButton
                    title="Pay with PayMongo Gateway"
                    onPress={handlePayMongoSubmit}
                    style={{ marginTop: 12 }}
                  />
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ORDER SUCCESS MODAL OVERLAY */}
        <Modal visible={orderSuccessVisible} animationType="fade" transparent={true}>
          <BackgroundGradient>
            <SafeAreaView style={styles.successWrapper}>
              <View style={styles.successContainer}>
                <CheckCircle size={76} color={COLORS.primary} strokeWidth={1.5} style={{ marginBottom: 20 }} />
                <Text style={styles.successTitle}>Order Confirmed!</Text>
                <Text style={styles.successDesc}>Your accessories payment has processed successfully.</Text>
                
                {/* Order specs card */}
                <View style={styles.orderSpecsCard}>
                  <Text style={styles.specsLabel}>ORDER TRACKING ID</Text>
                  <Text style={styles.specsVal}>{lastOrderDetails?.orderNumber}</Text>
                  <Text style={styles.specsLabel}>TOTAL AMOUNT CHARGED</Text>
                  <Text style={styles.specsTotal}>${lastOrderDetails?.total.toFixed(2)}</Text>
                </View>

                <CustomButton
                  title="Continue Shopping"
                  onPress={() => {
                    setOrderSuccessVisible(false);
                    setActiveTab('Boutique');
                  }}
                  style={{ width: 220, marginTop: 16 }}
                />
              </View>
            </SafeAreaView>
          </BackgroundGradient>
        </Modal>
      </BackgroundGradient>
    );
  };

  const isLargeWeb = Platform.OS === 'web' && windowWidth > 500;

  const appContent = (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      {renderScreen()}
    </View>
  );

  if (isLargeWeb) {
    return (
      <View style={styles.webWrapper}>
        <View style={styles.webDeviceMockup}>
          {appContent}
        </View>
      </View>
    );
  }

  return appContent;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webWrapper: {
    flex: 1,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webDeviceMockup: {
    width: 400,
    height: 800,
    maxWidth: '95vw',
    maxHeight: '95vh',
    borderRadius: 30,
    borderWidth: 8,
    borderColor: '#4C0519',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#4C0519',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
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
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 12,
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
  tabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1.5,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 8 : 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  cartIconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -6,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  emptyCartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyCartTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyCartSub: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  cartScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  cartItemImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  cartItemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  cartItemCategory: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  cartItemPrice: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  qtyBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  qtyText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  summaryCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 20,
    marginTop: 12,
  },
  summaryTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '400',
  },
  summaryVal: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1.5,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  totalLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  totalVal: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  profileScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeaderCard: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4C0519',
    shadowOpacity: 0.03,
    shadowRadius: 10,
  },
  profilePhoto: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  profileInitialsContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#4C0519',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  profileInitialsText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  emptyOrdersText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
    fontStyle: 'italic',
  },
  orderHistoryItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },
  orderHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderHistoryNum: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  orderHistoryDate: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  orderHistoryBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderHistoryItemsCount: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  orderHistoryTotal: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  orderHistoryCardMask: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  profileName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  profileEmail: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  profileFormCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 16,
  },
  formCardHeader: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  dangerCard: {
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  dangerDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  deleteAccBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    backgroundColor: 'rgba(244, 63, 94, 0.05)',
  },
  deleteAccText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '700',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 15, 0.55)',
    justifyContent: 'flex-end',
  },
  checkoutSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.8,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  paymongoLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymongoTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  closeSheetBtn: {
    padding: 4,
  },
  closeSheetText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  paymentSummaryLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
  },
  paymentSummaryAmt: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  cardExpiryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  processingText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  successWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 24,
    width: '88%',
    maxWidth: 380,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#4C0519',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  successTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },
  successDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 24,
  },
  orderSpecsCard: {
    width: '100%',
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.1)',
    alignItems: 'center',
    marginBottom: 20,
  },
  specsLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  specsVal: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  specsTotal: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '800',
  },
});
