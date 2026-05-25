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
import { API_URL, APP_NAME } from '../config';
import BackgroundGradient from '../components/BackgroundGradient';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import CustomCheckbox from '../components/CustomCheckbox';
import TermsAndPrivacyModal from './TermsAndPrivacyModal';

export default function RegisterScreen({ onNavigate, onLoginSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal overlays state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('terms'); // 'terms' | 'privacy'

  // Validation state
  const [errors, setErrors] = useState({});

  const validate = () => {
    let isValid = true;
    let localErrors = {};

    if (!name) {
      localErrors.name = 'Full name is required';
      isValid = false;
    } else if (name.length < 2) {
      localErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

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

    if (!confirmPassword) {
      localErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      localErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!acceptedTerms) {
      localErrors.acceptedTerms = 'You must accept the Terms and Conditions to proceed';
      isValid = false;
    }

    setErrors(localErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validate()) {
      if (!acceptedTerms) {
        Alert.alert('Terms and Conditions', 'You must read and accept the Terms and Conditions and Privacy Policy to create an account.');
      }
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          acceptedTerms,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        Alert.alert(
          'Registration Successful!',
          'Your boutique account has been created successfully. Welcome to Keyshien\'s Accessories!',
          [
            {
              text: 'Let\'s Shop!',
              onPress: () => onLoginSuccess(data), // Auto-logs them in immediately!
            },
          ]
        );
      } else {
        Alert.alert('Registration Failed', data.message || 'Email already exists or invalid data.');
      }
    } catch (err) {
      console.error('Register Fetch Error:', err);
      Alert.alert(
        'Network Error',
        'Could not reach the registration server. Please check your connection status.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openPolicy = (type) => {
    setModalType(type);
    setModalVisible(true);
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
              <Text style={styles.subtitle}>CREATE PREMIUM ACCOUNT</Text>
            </View>

            {/* Registration Form Card */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Sign Up</Text>
              <Text style={styles.cardSubheader}>Register your details to start shopping</Text>

              <CustomInput
                label="Full Name"
                iconName="User"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                placeholder="Enter full name"
                autoCapitalize="words"
                error={errors.name}
              />

              <CustomInput
                label="Email Address"
                iconName="Mail"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                placeholder="Enter email address"
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
                placeholder="Enter password (min. 6 chars)"
                secureTextEntry
                error={errors.password}
              />

              <CustomInput
                label="Confirm Password"
                iconName="Lock"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                }}
                placeholder="Re-enter password"
                secureTextEntry
                error={errors.confirmPassword}
              />

              {/* Checkbox for Terms and Conditions */}
              <CustomCheckbox
                checked={acceptedTerms}
                onPress={() => {
                  setAcceptedTerms(!acceptedTerms);
                  if (errors.acceptedTerms) setErrors({ ...errors, acceptedTerms: null });
                }}
                style={styles.checkboxContainer}
              >
                <Text style={styles.checkboxLabel}>
                  I read and accept the{' '}
                  <Text style={styles.linkText} onPress={() => openPolicy('terms')}>
                    Terms & Conditions
                  </Text>{' '}
                  and{' '}
                  <Text style={styles.linkText} onPress={() => openPolicy('privacy')}>
                    Privacy Policy
                  </Text>
                </Text>
              </CustomCheckbox>
              {errors.acceptedTerms ? (
                <Text style={styles.checkboxError}>{errors.acceptedTerms}</Text>
              ) : null}

              <CustomButton
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                style={styles.registerBtn}
              />

              {/* Navigation back to Login */}
              <View style={styles.footerLinkContainer}>
                <Text style={styles.footerLabel}>Already registered? </Text>
                <TouchableOpacity onPress={() => onNavigate('Login')} activeOpacity={0.6}>
                  <Text style={styles.footerActionText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modal Overlay for Terms / Privacy */}
        <TermsAndPrivacyModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          type={modalType}
        />
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
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  logoIconFrame: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
    fontSize: 24,
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
    marginTop: 4,
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
    marginBottom: 20,
  },
  checkboxContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  checkboxLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  checkboxError: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
    marginLeft: 30,
  },
  registerBtn: {
    marginTop: 16,
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
