import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

export default function CustomCheckbox({
  checked,
  onPress,
  label,
  children,
  style,
  ...props
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.container, style]}
      {...props}
    >
      <View
        style={[
          styles.checkbox,
          checked && styles.checkboxChecked,
        ]}
      >
        {checked && (
          <Check size={12} strokeWidth={3} color="#FFFFFF" />
        )}
      </View>
      
      {children ? (
        <View style={styles.childrenContainer}>{children}</View>
      ) : label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
  },
  checkboxChecked: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  childrenContainer: {
    marginLeft: 10,
    flex: 1,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '400',
  },
});
