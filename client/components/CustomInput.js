import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import * as Icons from 'lucide-react-native';
import { COLORS } from '../constants/theme';

export default function CustomInput({
  label,
  iconName, // Lucide icon name, e.g., 'User', 'Mail', 'Lock'
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Dynamically resolve the Lucide Icon component
  const IconComponent = iconName && Icons[iconName] ? Icons[iconName] : null;
  const EyeIcon = Icons.Eye;
  const EyeOffIcon = Icons.EyeOff;

  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        {IconComponent && (
          <IconComponent
            size={18}
            color={
              error
                ? COLORS.error
                : isFocused
                ? COLORS.primary
                : COLORS.textSecondary
            }
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.6}
            style={styles.rightIconButton}
          >
            {isPasswordVisible ? (
              <EyeOffIcon size={18} color={COLORS.textSecondary} />
            ) : (
              <EyeIcon size={18} color={COLORS.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 52,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  leftIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '400',
    height: '100%',
  },
  rightIconButton: {
    padding: 4,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    marginLeft: 4,
  },
});
