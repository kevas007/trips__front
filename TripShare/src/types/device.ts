export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  version: string;
  deviceId: string;
  pushToken?: string;
  appVersion: string;
  timezone: string;
} 