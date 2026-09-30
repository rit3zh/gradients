import { NavigationContainer, ThemeProvider, type LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BenchmarkScreen } from './benchmark/BenchmarkScreen';
import { DetailScreen } from './gallery/DetailScreen';
import { GalleryScreen } from './gallery/GalleryScreen';
import type { Routes } from './gallery/routes';
import { AppTheme } from './gallery/theme';

const Stack = createNativeStackNavigator<Routes>();

const linking: LinkingOptions<Routes> = {
  prefixes: ['expo.modules.gradients.example://'],
  config: {
    screens: {
      Gallery: '',
      Detail: 'gradient/:name',
      Benchmark: 'benchmark',
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={AppTheme}>
        <NavigationContainer theme={AppTheme} linking={linking}>
          <Stack.Navigator
            screenOptions={{
              headerBackVisible: true,
            }}>
            <Stack.Screen
              name="Gallery"
              component={GalleryScreen}
              options={{
                title: 'Gradients',
                headerLargeTitleEnabled: false,
                headerTitleStyle: {
                  color: '#fff',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="Detail"
              component={DetailScreen}
              options={{
                title: '',
                headerTransparent: true,
                headerTintColor: '#FFFFFF',
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
            <Stack.Screen
              name="Benchmark"
              component={BenchmarkScreen}
              options={{
                title: 'Benchmark',
                headerTitleStyle: {
                  color: '#fff',
                },
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
