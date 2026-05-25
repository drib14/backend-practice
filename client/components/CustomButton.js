import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

export default function CustomButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // 'primary' | 'secondary' | 'accent' | 'danger'
  style,
  ...props
}) {
  const isButtonDisabled = disabled || loading;

  // Define gradients and colors based on variant
  const getGradientColors = () => {
    if (isButtonDisabled) {
      return ['#2A2A35', '#1E1E28'];
    }
    switch (variant) {
      case 'primary':
        return [COLORS.primary, COLORS.primaryDark];
      case 'secondary':
        return ['rgba(30, 30, 45, 0.8)', 'rgba(21, 21, 33, 0.9)'];
      case 'accent':
        return [COLORS.accent, '#CA8A04'];
      case 'danger':
        return [COLORS.error, '#B91C1C'];
      default:
        return [COLORS.primary, COLORS.primaryDark];
    }
  };

  const getBorderColor = () => {
    if (variant === 'secondary') {
      return COLORS.border;
    }
    return 'transparent';
  };

  const getTextColor = () => {
    if (isButtonDisabled) {
      return COLORS.textMuted;
    }
    if (variant === 'secondary') {
      return COLORS.text;
    }
    if (variant === 'accent') {
      return '#0A0A0F'; // Dark text for gold background for readability!
    }
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isButtonDisabled}
      activeOpacity={0.8}
      style={[
        styles.touchable,
        variant === 'secondary' && { borderWidth: 1.5, borderColor: getBorderColor() },
        style,
      ]}
      {...props}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'accent' ? '#0A0A0F' : COLORS.text}
          />
        ) : (
          <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    height: 52,
    marginBottom: 16,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
