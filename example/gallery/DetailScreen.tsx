import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient, GradientProfiler } from '@rit3zh/gradients';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Items } from './items';
import type { Routes } from './routes';

export function DetailScreen({ route }: NativeStackScreenProps<Routes, 'Detail'>) {
  const insets = useSafeAreaInsets();
  const item = Items.find((entry) => entry.name === route.params.name) ?? Items[0];

  return (
    <View style={[styles.screen, { backgroundColor: item.background ?? '#000' }]}>
      <StatusBar barStyle="light-content" animated />
      {item.render(true)}
      {/* <LinearGradient
        pointerEvents="none"
        style={styles.scrim}
        colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.4)']}
        easing="smooth"
      />
      <View pointerEvents="none" style={[styles.label, { bottom: insets.bottom + 32 }]}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.caption}>{item.caption}</Text>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 260,
  },
  label: {
    position: 'absolute',
    left: 24,
    right: 24,
  },
  category: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1.5,
    marginTop: 6,
  },
  caption: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 16,
    marginTop: 4,
  },
});
