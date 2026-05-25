export const COLORS = {
  bg: '#FFF1F2', // Soft Cherry Blossom Pastel Pink
  bgCard: 'rgba(255, 255, 255, 0.75)', // Glassmorphic Frosted Pearl White
  bgCardSolid: '#FFFFFF',
  primary: '#EC4899', // Vibrant Hot Pink / Magenta
  primaryDark: '#DB2777',
  primaryGlow: 'rgba(236, 72, 153, 0.15)',
  accent: '#EAB308', // Premium Amber Gold
  accentDark: '#CA8A04',
  success: '#10B981', // Emerald Green
  error: '#F43F5E', // Rose Crimson
  text: '#4C0519', // High-Contrast Deep Chocolate Rose (Perfect Accessibility)
  textSecondary: '#9F1239', // Soft Rose Slate Gray
  textMuted: '#BE123C',
  border: 'rgba(236, 72, 153, 0.2)', // Pink outline border
  borderFocus: 'rgba(236, 72, 153, 0.55)',
  placeholder: 'rgba(236, 72, 153, 0.38)',
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
    shadowColor: '#4C0519',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
};
