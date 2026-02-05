import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function Boton({ children, onPress, small, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.button, small && styles.small, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled: !!disabled }}
    >
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: '#ff2d2d', padding: 14, borderRadius: 10, alignItems: 'center' },
  small: { padding: 8 },
  disabled: { opacity: 0.6 },
  text: { color: '#fff', fontWeight: '700' },
});
