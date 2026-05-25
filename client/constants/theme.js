export const COLORS = {
  bg: '#08080C',
  bgCard: 'rgba(21, 21, 33, 0.7)',
  bgCardSolid: '#151521',
  primary: '#6366F1', // Indigo Purple
  primaryDark: '#4F46E5',
  primaryGlow: 'rgba(99, 102, 241, 0.15)',
  accent: '#EAB308', // Premium Amber Gold
  accentDark: '#CA8A04',
  success: '#10B981', // Emerald Green
  error: '#EF4444', // Coral Red
  text: '#F8FAFC', // Premium Off-White
  textSecondary: '#94A3B8', // Slate Gray
  textMuted: '#64748B',
  border: 'rgba(255, 255, 255, 0.08)',
  borderFocus: 'rgba(99, 102, 241, 0.45)',
  placeholder: 'rgba(148, 163, 184, 0.35)',
};

export const FONTS = {
  regular: { fontFamily: 'System', fontWeight: '400' },
  medium: { fontFamily: 'System', fontWeight: '500' },
  semiBold: { fontFamily: 'System', fontWeight: '600' },
  bold: { fontFamily: 'System', fontWeight: '700' },
  extraBold: { fontFamily: 'System', fontWeight: '800' },
};

export const SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
};
