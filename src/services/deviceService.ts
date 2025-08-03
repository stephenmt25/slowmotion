// Device ID management for anonymous users
export class DeviceService {
  private static readonly DEVICE_ID_KEY = 'gym-tracker-device-id';

  static getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    
    if (!deviceId) {
      // Generate a unique device ID
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  }

  static getDeviceId(): string | null {
    return localStorage.getItem(this.DEVICE_ID_KEY);
  }

  static setDeviceId(deviceId: string): void {
    localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
  }
}