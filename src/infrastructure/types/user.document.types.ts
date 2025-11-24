import type { User } from '../../domain/entities/user.entity.js';
import type { ObjectId } from 'mongodb';

export type UserDocument = User & { _id: ObjectId };

