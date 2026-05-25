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
        colors={['rgba(8, 8, 12, 0.45)', 'rgba(15, 10, 25, 0.7)', 'rgba(8, 8, 12, 0.9)']}
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
    top: -height * 0.1,
    left: -width * 0.1,
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: (width * 0.85) / 2,
    backgroundColor: 'rgba(99, 102, 241, 0.12)', // Indigo Glow
    filter: [{ blur: 50 }], // Web/Native compatibility fallback note: in RN, we configure overlay styles
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -height * 0.1,
    right: -width * 0.1,
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: (width * 0.85) / 2,
    backgroundColor: 'rgba(234, 179, 8, 0.05)', // Amber Glow
  },
});
