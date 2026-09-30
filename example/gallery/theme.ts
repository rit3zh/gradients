import { DarkTheme, type Theme } from '@react-navigation/native';

export const AppTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: '#000000',
    text: '#F2F2F7',
    border: '#1C1C1E',
  },
};

export const secondaryText = '#8E8E93';
