import { TextStyle } from "react-native";

export const TYPOGRAPHY: {
  FONT_FAMILY: string;
  TITLE: TextStyle;
  HEADING: TextStyle;
  SUBHEADING: TextStyle;
  BODY: TextStyle;
  SECONDARY: TextStyle;
  CAPTION: TextStyle;
  BUTTON: TextStyle;
} = {
   
  FONT_FAMILY: 'Inter',


  TITLE: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  HEADING: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  SUBHEADING: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
  },

  BODY: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
  },

  SECONDARY: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Inter',
  },

  CAPTION: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter',
  },

  BUTTON: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
};