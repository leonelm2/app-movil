import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function Logo({ size = 'medium', showText = true }) {
  const sizes = {
    small: { width: 40, height: 40, fontSize: 10 },
    medium: { width: 60, height: 60, fontSize: 14 },
    large: { width: 100, height: 100, fontSize: 18 }
  };

  const config = sizes[size];

  return (
    <View style={styles.container}>
      <View style={[styles.logoBox, { width: config.width, height: config.height }]}>
        {/* Trophy Icon */}
        <Text style={styles.trophyEmoji}>🏆</Text>
        
        {/* Star */}
        <View style={styles.star}>
          <Text style={styles.starText}>⭐</Text>
        </View>
      </View>
      
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
  logoBox: {
    backgroundColor: '#ff2d2d',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#ff2d2d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  trophyEmoji: {
    fontSize: 32
  },
  star: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff'
  },
  starText: {
    fontSize: 14
  },
  text: {
    color: '#ff2d2d',
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 8
  }
});
