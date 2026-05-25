import React from 'react';
import { StyleSheet, Text, View, Modal, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import BackgroundGradient from '../components/BackgroundGradient';

export default function TermsAndPrivacyModal({ visible, onClose, type }) {
  const isTerms = type === 'terms';
  const title = isTerms ? 'Terms & Conditions' : 'Privacy Policy';

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <BackgroundGradient>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.6} style={styles.closeButton}>
              <X size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={true}>
            <View style={styles.card}>
              <Text style={styles.welcomeText}>
                Last updated: May 25, 2026
              </Text>
              
              <Text style={styles.introParagraph}>
                {isTerms
                  ? 'Please read these terms and conditions carefully before using our mobile application.'
                  : 'Your privacy is highly important to us. This privacy policy explains how we collect, use, and safeguard your details.'}
              </Text>

              {isTerms ? (
                <>
                  <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
                  <Text style={styles.sectionBody}>
                    By creating an account on Veloce E-Commerce, you represent that you are at least 18 years old and agree to be legally bound by these terms. If you do not agree, you must immediately terminate your use of the application.
                  </Text>

                  <Text style={styles.sectionTitle}>2. Account Registration & Security</Text>
                  <Text style={styles.sectionBody}>
                    You agree to provide true, accurate, and current information during registration. You are solely responsible for maintaining the confidentiality of your credentials and all activities occurring under your account.
                  </Text>

                  <Text style={styles.sectionTitle}>3. Purchase Transactions</Text>
                  <Text style={styles.sectionBody}>
                    All prices listed in the application are subject to change. We reserve the right to refuse or cancel orders due to inaccuracies, inventory limitations, or suspicions of fraudulent transactions.
                  </Text>

                  <Text style={styles.sectionTitle}>4. User Code of Conduct</Text>
                  <Text style={styles.sectionBody}>
                    You agree not to abuse, hack, reverse engineer, or spam the service. Violations of server-side protocols will result in immediate permanent account termination and legal action where appropriate.
                  </Text>

                  <Text style={styles.sectionTitle}>5. Limitations of Liability</Text>
                  <Text style={styles.sectionBody}>
                    Veloce E-Commerce provides services "as is" without warranty. We are not liable for direct, indirect, or consequential damages resulting from system outages or merchant delivery discrepancies.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>1. Information We Collect</Text>
                  <Text style={styles.sectionBody}>
                    We collect personal information that you provide directly, including your name, email address, password hash, and shipping coordinates. We also collect transactional and logging details to authorize sessions.
                  </Text>

                  <Text style={styles.sectionTitle}>2. How We Use Information</Text>
                  <Text style={styles.sectionBody}>
                    We use your details to establish secure login credentials, process orders, communicate transaction updates, and send automated verification and password recovery emails via secure Gmail SMTP relays.
                  </Text>

                  <Text style={styles.sectionTitle}>3. Data Security & Storage</Text>
                  <Text style={styles.sectionBody}>
                    We implement modern industry-standard protection. Hashed passwords are secure under bcryptjs algorithms, and communications are encrypted over SSL/TLS.
                  </Text>

                  <Text style={styles.sectionTitle}>4. Third-Party Disclosures</Text>
                  <Text style={styles.sectionBody}>
                    We do not sell, trade, or transfer your personal credentials to external marketers. Data is shared only with trusted logistics partners and secure payment gateways like PayMongo to process e-commerce orders.
                  </Text>

                  <Text style={styles.sectionTitle}>5. Your Privacy Rights</Text>
                  <Text style={styles.sectionBody}>
                    You have the right to inspect, update, or permanently delete your profile details. You can trigger an account termination at any time through our secure endpoints to delete all database user records.
                  </Text>
                </>
              )}

              <Text style={styles.footerNote}>
                Thank you for choosing Veloce E-Commerce. If you have any inquiries regarding these policies, please reach out to us at compliance@veloce.com.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </BackgroundGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  closeButton: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 24,
  },
  welcomeText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  introParagraph: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  sectionBody: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
    marginBottom: 10,
  },
  footerNote: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 20,
    textAlign: 'center',
  },
});
