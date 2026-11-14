import { createContext, useContext } from 'react';
import { Text, type TextProps } from 'react-native';

export const FontFamilyContext = createContext<string | undefined>(undefined);

export function AppText({ style, ...props }: TextProps) {
  const fontFamily = useContext(FontFamilyContext);
  return <Text {...props} style={[{ fontFamily }, style]} />;
}
