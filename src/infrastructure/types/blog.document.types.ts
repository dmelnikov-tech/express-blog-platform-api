import type { Blog } from '../../domain/entities/blog.entity.js';
import type { ObjectId } from 'mongodb';

export type BlogDocument = Blog & { _id: ObjectId };

