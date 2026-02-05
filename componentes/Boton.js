import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function Boton({ children, onPress, small }) {
  return (
    <TouchableOpacity style={[styles.button, small && styles.small]} onPress={onPress}>
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: '#ff2d2d', padding: 14, borderRadius: 10, alignItems: 'center' },
  small: { padding: 8 },
  text: { color: '#fff', fontWeight: '700' },
});
