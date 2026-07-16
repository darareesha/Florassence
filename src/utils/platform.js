import { Platform } from 'react-native';
export const pixelDepth = (level = 2) =>
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: level * 1.5 },
      shadowOpacity: 0.06 + level * 0.02,
      shadowRadius: level * 3,
    },
    android: {
      elevation: level * 1.5,
    },
    default: {},
  });

export const statusBarStyle = 'dark-content';


{/*Increasing the level pushes the shadow further down 
Opacity ranges from 0 (completely transparent) to 1 (completely opaque).
*/
}
