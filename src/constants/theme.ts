import {ColorValue} from 'react-native';
import { COLORS } from './colors';

export type ThemePalette = {
  background: ColorValue;
  surface: ColorValue;
  text: ColorValue;
  muted: ColorValue;
  primary: ColorValue;
  primaryDark: ColorValue;
  accent: ColorValue;
  border: ColorValue;
  success: ColorValue;
};

export const colors: Record<string, ColorValue> = {
  background: '#F7F4EE',
  surface: '#FFFFFF',
  text: '#2B2926',
  muted: '#756F67',
  primary: '#9A4D2F',
  primaryDark: '#71351F',
  accent: '#E3B85C',
  border: '#E8E0D5',
  success: '#47734F',
};


export const LIGHT_THEME: ThemePalette = {
  background: COLORS.SLATE_100,
  surface: COLORS.WHITE,
  text: COLORS.BLACK,
  muted: COLORS.DARK_GREY,
  primary: COLORS.BLUE_300,
  primaryDark: COLORS.BLUE_500,
  accent: COLORS.BLUE_100,
  border: COLORS.LIGHT_GREY,
  success: COLORS.GREEN,
};

export const DARK_THEME: ThemePalette = {
  background: '#172126',
  surface: '#233238',
  text: '#F2EFE7',
  muted: '#AAB5B3',
  primary: '#66A3BF',
  primaryDark: '#3368A0',
  accent: '#C8DFDB',
  border: '#39484B',
  success: '#81C784',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};
