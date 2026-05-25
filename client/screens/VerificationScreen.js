import React, { useState, useEffect, useRef } from 'react';
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
  TextInput,
} from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';
import { API_URL } from '../config';
import BackgroundGradient from '../components/BackgroundGradient';
import CustomButton from '../components/CustomButton';

export default function VerificationScreen({ onNavigate, routeParams, onVerificationSuccess }) {
  const email = routeParams?.email || 'your email';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Timer for resending code (60 seconds)
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const startTimer = () => {
    setCountdown(60);
    setCanResend(false);
    
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the complete 6-digit OTP verification code.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.status === 200) {
        Alert.alert(
          'Verification Successful',
          'Your account is now activated. Welcome to Veloce E-Commerce!',
          [
            {
              text: 'Start Shopping',
              onPress: () => onVerificationSuccess(data),
            },
          ]
        );
      } else {
        Alert.alert('Verification Failed', data.message || 'Invalid or expired OTP code.');
      }
    } catch (err) {
      console.error('Verify Email Fetch Error:', err);
      Alert.alert('Network Error', 'Failed to connect to verification server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 200) {
        Alert.alert('OTP Dispatched', 'A new 6-digit verification code has been sent to your email.');
        startTimer();
      } else {
        Alert.alert('Resend Failed', data.message || 'Could not dispatch a new code.');
      }
    } catch (err) {
      console.error('Resend Code Fetch Error:', err);
      Alert.alert('Network Error', 'Failed to request new code. Please check your network.');
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
                <ShieldCheck size={32} color="#FFFFFF" strokeWidth={2} />
              </View>
              <Text style={styles.title}>VERIFICATION</Text>
              <Text style={styles.subtitle}>SECURE ACCOUNT ACTIVATION</Text>
            </View>

            {/* Verification Form Card */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Verify Your Email</Text>
              <Text style={styles.cardSubheader}>
                We sent a 6-digit code to:{'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>

              {/* Monospaced Digit Entry Input */}
              <View style={styles.otpInputWrapper}>
                <TextInput
                  style={styles.otpTextInput}
                  value={code}
                  onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').substring(0, 6))}
                  placeholder="000000"
                  placeholderTextColor="rgba(255, 255, 255, 0.1)"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus={true}
                  selectionColor={COLORS.primary}
                />
              </View>
              <Text style={styles.instructionText}>
                Enter the 6-digit numeric OTP code above
              </Text>

              <CustomButton
                title="Verify & Continue"
                onPress={handleVerify}
                loading={loading}
                style={styles.verifyBtn}
              />

              {/* Resend Link with Countdown Timer */}
              <View style={styles.resendContainer}>
                {canResend ? (
                  <TouchableOpacity onPress={handleResend} activeOpacity={0.6}>
                    <Text style={styles.resendActiveText}>Resend Code</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.resendInactiveText}>
                    Resend code in <Text style={styles.timerColor}>{countdown}s</Text>
                  </Text>
                )}
              </View>

              {/* Navigation Back */}
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
    textAlign: 'center',
  },
  cardSubheader: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailHighlight: {
    color: COLORS.text,
    fontWeight: '600',
  },
  otpInputWrapper: {
    backgroundColor: 'rgba(10, 10, 15, 0.75)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    width: '100%',
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  otpTextInput: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 16,
    textAlign: 'center',
    width: '100%',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    paddingLeft: 16, // offset to keep text perfectly centered due to letterSpacing
  },
  instructionText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 24,
  },
  verifyBtn: {
    width: '100%',
  },
  resendContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  resendActiveText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  resendInactiveText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '400',
  },
  timerColor: {
    color: COLORS.accent,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 12,
    padding: 4,
  },
  backText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});
