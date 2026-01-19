import { createTheme, type MantineColorsTuple } from '@mantine/core';

const primaryColor: MantineColorsTuple = [
  '#f7f2ed',
  '#e4d0bb', // Main
  '#d1bda6',
  '#beaa91',
  '#ab977c',
  '#988467',
  '#857152',
  '#725e3d',
  '#5f4b28',
  '#4c3813',
];

const secondaryColor: MantineColorsTuple = [
  '#e8ebf0',
  '#c5cde0',
  '#a2afcf',
  '#7f91bf',
  '#5c73af',
  '#39559e',
  '#1e3a5f', // Main
  '#182e4c',
  '#122238',
  '#0c1625',
];

export const theme = createTheme({
  primaryColor: 'primary',
  colors: {
    primary: primaryColor,
    secondary: secondaryColor,
  },
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Outfit, sans-serif',
  },
});
