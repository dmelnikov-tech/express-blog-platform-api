export interface DeviceResponseDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}

export interface DeleteDeviceResult {
  success: boolean;
  notFound?: boolean;
  forbidden?: boolean;
}
