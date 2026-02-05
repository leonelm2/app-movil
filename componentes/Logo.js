import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const logoSource = require('../assets/ChatGPT Image 5 feb 2026, 01_06_19 a.m..png');

export default function Logo({ size = 'medium', showText = false }) {
  const sizes = {
    small: { width: 130, height: 130, fontSize: 14 },
    medium: { width: 240, height: 240, fontSize: 20 },
    large: { width: 320, height: 320, fontSize: 24 },
    header: { width: 280, height: 90, fontSize: 14 }
  };

  const config = sizes[size] || sizes.medium;

  return (
    <View style={styles.container}>
      <Image
        source={logoSource}
        style={{ width: config.width, height: config.height }}
        resizeMode="contain"
        accessibilityLabel="Logo Potrero"
      />
      {showText && (
        <Text style={[styles.text, { fontSize: config.fontSize }]}>
          POTRERO
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 6
  }
});
