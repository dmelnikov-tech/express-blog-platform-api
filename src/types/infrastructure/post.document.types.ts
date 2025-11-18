import type { Post } from '../domain/post.types.js';
import type { ObjectId } from 'mongodb';

export type PostDocument = Post & { _id: ObjectId };
