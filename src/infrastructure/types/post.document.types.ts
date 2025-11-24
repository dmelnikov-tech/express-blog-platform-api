import type { Post } from '../../domain/entities/post.entity.js';
import type { ObjectId } from 'mongodb';

export type PostDocument = Post & { _id: ObjectId };

