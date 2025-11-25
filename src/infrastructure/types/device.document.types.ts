import type { Device } from '../../domain/entities/device.entity.js';
import type { ObjectId } from 'mongodb';

export type DeviceDocument = Device & { _id: ObjectId };

