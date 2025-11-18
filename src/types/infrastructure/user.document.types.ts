import type { User } from '../domain/user.types.js';
import type { ObjectId } from 'mongodb';

export type UserDocument = User & { _id: ObjectId };
