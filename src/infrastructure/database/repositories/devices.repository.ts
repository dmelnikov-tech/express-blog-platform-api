import { DeleteResult } from 'mongodb';
import type { Device } from '../../../domain/entities/device.entity.js';
import type { DeviceDocument } from '../../types/device.document.types.js';
import { getDatabase } from '../mongodb.js';
import { COLLECTIONS } from '../collections.js';

const getCollection = () => getDatabase().collection<DeviceDocument>(COLLECTIONS.DEVICES);

export const devicesRepository = {
  async findByDeviceId(deviceId: string): Promise<DeviceDocument | null> {
    const collection = getCollection();
    return await collection.findOne({ deviceId });
  },

  async create(device: Device): Promise<DeviceDocument> {
    const collection = getCollection();
    await collection.insertOne(device as DeviceDocument);
    return device as DeviceDocument;
  },

  async updateRefreshToken(deviceId: string, refreshToken: string, expiresAt: string): Promise<boolean> {
    const collection = getCollection();
    const now = new Date().toISOString();
    const result = await collection.updateOne(
      { deviceId },
      { $set: { refreshToken, expiresAt, lastActiveDate: now } }
    );
    return result.modifiedCount > 0;
  },

  async deleteByDeviceId(deviceId: string): Promise<boolean> {
    const collection = getCollection();
    const result: DeleteResult = await collection.deleteOne({ deviceId });
    return result.deletedCount > 0;
  },

  async deleteByUserId(userId: string): Promise<number> {
    const collection = getCollection();
    const result: DeleteResult = await collection.deleteMany({ userId });
    return result.deletedCount;
  },

  async deleteOtherDevicesByUserId(userId: string, deviceId: string): Promise<number> {
    const collection = getCollection();
    const result: DeleteResult = await collection.deleteMany({ userId, deviceId: { $ne: deviceId } });
    return result.deletedCount;
  },

  async deleteExpiredDevices(): Promise<number> {
    const collection = getCollection();
    const now: string = new Date().toISOString();
    const result: DeleteResult = await collection.deleteMany({ expiresAt: { $lt: now } });
    return result.deletedCount;
  },

  async deleteAll(): Promise<boolean> {
    const collection = getCollection();
    const result: DeleteResult = await collection.deleteMany({});
    return result.deletedCount > 0;
  },
};

