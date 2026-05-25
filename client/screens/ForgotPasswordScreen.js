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
import { KeyRound } from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';
import { API_URL } from '../config';
import BackgroundGradient from '../components/BackgroundGradient';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

export default function ForgotPasswordScreen({ onNavigate, routeParams }) {
  const [email, setEmail] = useState(routeParams?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validate = () => {
    if (!email) {
      setError('Email address is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError(null);
    return true;
  };

  const handleForgotPassword = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 200) {
        Alert.alert(
          'Recovery Code Dispatched',
          'A 6-digit password reset recovery code has been sent to your email.',
          [
            {
              text: 'Reset Password',
              onPress: () => onNavigate('ResetPassword', { email }),
            },
          ]
        );
      } else {
        Alert.alert('Recovery Request Failed', data.message || 'No account registered with this email.');
      }
    } catch (err) {
      console.error('Forgot Password Fetch Error:', err);
      Alert.alert('Network Error', 'Failed to submit recovery request. Please check your network.');
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
                <KeyRound size={32} color="#FFFFFF" strokeWidth={2} />
              </View>
              <Text style={styles.title}>RECOVERY</Text>
              <Text style={styles.subtitle}>SECURE CREDENTIALS RESET</Text>
            </View>

            {/* Forgot Password Card */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Forgot Password?</Text>
              <Text style={styles.cardSubheader}>
                Enter your email address below to receive a 6-digit recovery OTP code.
              </Text>

              <CustomInput
                label="Email Address"
                iconName="Mail"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError(null);
                }}
                placeholder="Enter registered email"
                keyboardType="email-address"
                error={error}
              />

              <CustomButton
                title="Send Recovery OTP"
                onPress={handleForgotPassword}
                loading={loading}
              />

              {/* Navigation Links */}
              <TouchableOpacity
                onPress={() => onNavigate('Login')}
                activeOpacity={0.6}
                style={styles.backButton}
              >
                <Text style={styles.backText}>Back to Sign In</Text>
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
    fontSize: 26,
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
    alignItems: 'center',
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
