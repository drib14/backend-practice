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
} from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';
import { API_URL, APP_NAME } from '../config';
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
        if (data.status === 'unverified') {
          // Automatic redirection to OTP verify screen!
          Alert.alert(
            'Account Unverified',
            'Your email address is not verified yet. A new verification OTP code has been sent to your inbox.',
            [
              {
                text: 'Verify Now',
                onPress: () => onNavigate('Verify', { email: data.email }),
              },
            ]
          );
        } else {
          onLoginSuccess(data);
        }
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login Fetch Error:', err);
      Alert.alert(
        'Network Error',
        'Could not connect to the authentication server. Please check your server status or API URL in config.js.'
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
              <View style={styles.logoIcon}>
                <ShoppingBag size={32} color="#FFFFFF" strokeWidth={2} />
              </View>
              <Text style={styles.title}>{APP_NAME}</Text>
              <Text style={styles.subtitle}>PREMIUM E-COMMERCE PORTAL</Text>
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
                placeholder="Enter your email address"
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
                <Text style={styles.footerLabel}>New to {APP_NAME}? </Text>
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
    marginBottom: 32,
  },
  logoIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subtitle: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
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
