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

export default function ResetPasswordScreen({ onNavigate, routeParams }) {
  const email = routeParams?.email || '';
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({});

  const validate = () => {
    let isValid = true;
    let localErrors = {};

    if (!code) {
      localErrors.code = 'Verification code is required';
      isValid = false;
    } else if (code.length !== 6) {
      localErrors.code = 'Verification code must be 6 digits';
      isValid = false;
    }

    if (!newPassword) {
      localErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (newPassword.length < 6) {
      localErrors.newPassword = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!confirmPassword) {
      localErrors.confirmPassword = 'Please confirm your new password';
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      localErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(localErrors);
    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        Alert.alert(
          'Password Reset Complete!',
          'Your credentials have been successfully updated. You may now log in with your new password.',
          [
            {
              text: 'Sign In Now',
              onPress: () => onNavigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Reset Failed', data.message || 'Invalid verification code or expired session.');
      }
    } catch (err) {
      console.error('Reset Password Error:', err);
      Alert.alert('Network Error', 'Failed to connect to reset server. Please try again.');
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
              <Text style={styles.subtitle}>ESTABLISH NEW CREDENTIALS</Text>
            </View>

            {/* Reset Password Card */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Verify Recovery OTP</Text>
              <Text style={styles.cardSubheader}>
                Enter the 6-digit OTP code sent to: {'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>

              <CustomInput
                label="6-Digit Reset Code"
                iconName="ShieldAlert"
                value={code}
                onChangeText={(text) => {
                  setCode(text.replace(/[^0-9]/g, '').substring(0, 6));
                  if (errors.code) setErrors({ ...errors, code: null });
                }}
                placeholder="Enter 6-digit code"
                keyboardType="number-pad"
                maxLength={6}
                error={errors.code}
              />

              <CustomInput
                label="New Password"
                iconName="Lock"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (errors.newPassword) setErrors({ ...errors, newPassword: null });
                }}
                placeholder="Enter new password (min. 6 chars)"
                secureTextEntry
                error={errors.newPassword}
              />

              <CustomInput
                label="Confirm New Password"
                iconName="Lock"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                }}
                placeholder="Re-enter new password"
                secureTextEntry
                error={errors.confirmPassword}
              />

              <CustomButton
                title="Reset Password"
                onPress={handleResetPassword}
                loading={loading}
              />

              {/* Navigation Back */}
              <TouchableOpacity
                onPress={() => onNavigate('Login')}
                activeOpacity={0.6}
                style={styles.backButton}
              >
                <Text style={styles.backText}>Cancel and Sign In</Text>
              </TouchableOpacity>
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
    alignItems: 'center',
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  cardHeader: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardSubheader: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailHighlight: {
    color: COLORS.text,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 8,
    padding: 4,
  },
  backText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});
