import { useIsFocused, useTheme } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList, type ViewToken } from '@shopify/flash-list';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text } from 'react-native';
import { GradientTile } from './GradientTile';
import { Items, type IGalleryItem } from './items';
import type { Routes } from './routes';
import { secondaryText } from './theme';

const viewabilityConfig = { itemVisiblePercentThreshold: 5 };

export function GalleryScreen({ navigation }: NativeStackScreenProps<Routes, 'Gallery'>) {
  const focused = useIsFocused();
  const { colors } = useTheme();
  const [query, setQuery] = useState<string>('');
  const [visible, setVisible] = useState<ReadonlySet<string>>(() => new Set());

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: 'Search gradients',
        hideWhenScrolling: false,
        autoCapitalize: 'none',
        onChangeText: (event) => setQuery(event.nativeEvent.text),
        onCancelButtonPress: () => setQuery(''),
      },
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => navigation.navigate('Benchmark')}>
          <Text style={styles.headerAction}>Benchmark</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const data = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return Items;
    }
    return Items.filter(
      (item) =>
        item.name.toLowerCase().includes(needle) ||
        item.category.toLowerCase().includes(needle) ||
        item.caption.toLowerCase().includes(needle)
    );
  }, [query]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<IGalleryItem>[] }) => {
      setVisible(new Set(viewableItems.map((token) => token.item.name)));
    }
  ).current;

  const open = useCallback(
    (item: IGalleryItem) => navigation.navigate('Detail', { name: item.name }),
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: IGalleryItem }) => (
      <GradientTile item={item} active={focused && visible.has(item.name)} onPress={open} />
    ),
    [focused, visible, open]
  );

  return (
    <>
      {focused && <StatusBar barStyle="light-content" animated />}
      <FlashList
        data={data}
        numColumns={2}
        keyExtractor={(item) => item.name}
        getItemType={(item) => item.name}
        renderItem={renderItem}
        extraData={renderItem}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.content}
        style={{ ...styles.list, backgroundColor: colors.background }}
        ListEmptyComponent={<Text style={styles.empty}>No gradients match “{query}”.</Text>}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    color: '#0A84FF',
    fontSize: 17,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 40,
  },
  empty: {
    textAlign: 'center',
    color: secondaryText,
    fontSize: 15,
    marginTop: 48,
  },
});
