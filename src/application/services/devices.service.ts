import { devicesRepository } from '../../infrastructure/database/repositories/devices.repository.js';
import type { DeviceResponseDto, DeleteDeviceResult } from '../dto/device.dto.js';
import type { DeviceDocument } from '../../infrastructure/types/device.document.types.js';
import type { Device } from '../../domain/entities/device.entity.js';

export const devicesService = {
  async getUserDevices(userId: string): Promise<DeviceResponseDto[]> {
    const devices: DeviceDocument[] = await devicesRepository.findByUserId(userId);
    return devices.map(device => this._mapDeviceToResponseDto(device));
  },

  async deleteOtherDevices(userId: string, currentDeviceId: string): Promise<boolean> {
    const deletedCount: number = await devicesRepository.deleteOtherDevicesByUserId(userId, currentDeviceId);
    return deletedCount > 0;
  },

  async deleteDevice(deviceId: string, userId: string): Promise<DeleteDeviceResult> {
    const device: DeviceDocument | null = await devicesRepository.findByDeviceId(deviceId);

    if (!device) {
      return { success: false, notFound: true };
    }

    if (device.userId !== userId) {
      return { success: false, forbidden: true };
    }

    const deleted: boolean = await devicesRepository.deleteByDeviceId(deviceId);
    return { success: deleted };
  },

  // методы для auth.service
  async createDeviceForAuth(
    deviceId: string,
    userId: string,
    title: string,
    ip: string,
    refreshToken: string,
    expiresAt: string
  ): Promise<DeviceDocument> {
    const now: string = new Date().toISOString();
    const device: Device = {
      deviceId,
      userId,
      title,
      ip,
      refreshToken,
      lastActiveDate: now,
      createdAt: now,
      expiresAt,
    };
    return await devicesRepository.create(device);
  },

  async updateDeviceRefreshToken(deviceId: string, refreshToken: string, expiresAt: string): Promise<boolean> {
    return await devicesRepository.updateRefreshToken(deviceId, refreshToken, expiresAt);
  },

  async deleteDeviceForLogout(deviceId: string): Promise<boolean> {
    return await devicesRepository.deleteByDeviceId(deviceId);
  },

  async validateDeviceForAuth(deviceId: string, refreshToken: string): Promise<boolean> {
    const device: DeviceDocument | null = await devicesRepository.findByDeviceId(deviceId);

    if (!device || device.refreshToken !== refreshToken) {
      return false;
    }

    const expiresAt: Date = new Date(device.expiresAt);
    const now: Date = new Date();
    const isExpired: boolean = now > expiresAt;

    if (isExpired) {
      await devicesRepository.deleteByDeviceId(deviceId);
      return false;
    }

    return true;
  },

  async getDeviceForRefresh(deviceId: string): Promise<DeviceDocument | null> {
    return await devicesRepository.findByDeviceId(deviceId);
  },

  _mapDeviceToResponseDto(device: DeviceDocument): DeviceResponseDto {
    return {
      ip: device.ip,
      title: device.title,
      lastActiveDate: device.lastActiveDate,
      deviceId: device.deviceId,
    };
  },
};
