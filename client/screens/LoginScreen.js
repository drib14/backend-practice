import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { COLORS } from '../constants/theme';
import { API_URL } from '../config';
import BackgroundGradient from '../components/BackgroundGradient';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

export default function LoginScreen({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState({});

  const validate = () => {
    let isValid = true;
    let localErrors = {};

    if (!email) {
      localErrors.email = 'Email address is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      localErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!password) {
      localErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      localErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(localErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        onLoginSuccess(data);
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login Fetch Error:', err);
      Alert.alert(
        'Network Error',
        'Could not connect to the boutique server. Please verify your connection status.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Branding */}
            <View style={styles.header}>
              <View style={styles.logoIconFrame}>
                <Image
                  source={require('../assets/icon.png')}
                  style={styles.logoIconImage}
                />
              </View>
              {/* Bold Keyshien Title */}
              <Text style={styles.title}>
                <Text style={styles.extraBoldText}>Keyshien's</Text>{'\n'}Accessories
              </Text>
              <Text style={styles.subtitle}>EXCLUSIVE INVENTORY PORTAL</Text>
            </View>

            {/* Glassmorphic Form Card */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Welcome Back</Text>
              <Text style={styles.cardSubheader}>Sign in to access your profile and cart</Text>

              <CustomInput
                label="Email Address"
                iconName="Mail"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
                error={errors.email}
              />

              <CustomInput
                label="Password"
                iconName="Lock"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                placeholder="Enter password"
                secureTextEntry
                error={errors.password}
              />

              {/* Forgot Password Link */}
              <TouchableOpacity
                onPress={() => onNavigate('ForgotPassword', { email })}
                activeOpacity={0.6}
                style={styles.forgotButton}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <CustomButton title="Sign In" onPress={handleLogin} loading={loading} />

              {/* Sign Up Navigation */}
              <View style={styles.footerLinkContainer}>
                <Text style={styles.footerLabel}>New here? </Text>
                <TouchableOpacity onPress={() => onNavigate('Register')} activeOpacity={0.6}>
                  <Text style={styles.footerActionText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  logoIconFrame: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  logoIconImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  extraBoldText: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 24,
    shadowColor: '#4C0519',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  cardHeader: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardSubheader: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 24,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  footerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '400',
  },
  footerActionText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
