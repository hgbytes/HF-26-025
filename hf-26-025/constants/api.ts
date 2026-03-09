import { Platform } from 'react-native';

// For physical devices on the same WiFi, replace with your PC's local IP
// e.g., 'http://192.168.1.100:3000'
// For Android emulator use '10.0.2.2', for iOS simulator use 'localhost'
const DEV_HOST = Platform.select({
  android: '10.0.2.2',
  ios: 'localhost',
  default: 'localhost',
});

export const API_BASE = 'http://10.228.219.210:3000/api';

// Override this for physical device testing:
// export const API_BASE = 'http://192.168.1.X:3000/api';

