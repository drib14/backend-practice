import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function BackgroundGradient({ children }) {
  return (
    <View style={styles.container}>
      {/* Background color base */}
      <View style={styles.colorBase} />

      {/* Decorative radial glows */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      {/* Subtle overlay gradient to blend everything */}
      <LinearGradient
        colors={['rgba(255, 241, 242, 0.6)', 'rgba(255, 228, 230, 0.85)', 'rgba(255, 241, 242, 0.95)']}
        style={StyleSheet.absoluteFill}
      />

      <View style={StyleSheet.absoluteFill}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  colorBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bg,
  },
  glowTopLeft: {
    position: 'absolute',
    top: -height * 0.15,
    left: -width * 0.15,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: 'rgba(236, 72, 153, 0.22)', // Soft Hot Pink Glow
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -height * 0.15,
    right: -width * 0.15,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: 'rgba(234, 179, 8, 0.1)', // Gold Glow
  },
});
