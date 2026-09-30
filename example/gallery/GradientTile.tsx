import { useTheme } from '@react-navigation/native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { IGalleryItem } from './items';
import { secondaryText } from './theme';

type Props = {
  item: IGalleryItem;
  active: boolean;
  onPress: (item: IGalleryItem) => void;
};

export const GradientTile = memo(function GradientTile({ item, active, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.name}`}
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <View style={[styles.art, { backgroundColor: item.background ?? '#000' }]}>
        {item.render(active)}
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.category} numberOfLines={1}>
        {item.category}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  tile: {
    paddingHorizontal: 6,
    paddingBottom: 18,
  },
  pressed: {
    opacity: 0.7,
  },
  art: {
    aspectRatio: 0.82,
    borderRadius: 22,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginTop: 10,
  },
  category: {
    fontSize: 13,
    color: secondaryText,
    marginTop: 2,
  },
});
