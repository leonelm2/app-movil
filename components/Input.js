import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Input({ label, icon, ...props }) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {icon && <Ionicons name={icon} size={18} color="#ff2d2d" style={{ marginRight: 8 }} />}
        <TextInput placeholderTextColor="#aaa" style={styles.input} {...props} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { color: '#fff', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#222' },
  input: { color: '#fff', flex: 1 },
});
