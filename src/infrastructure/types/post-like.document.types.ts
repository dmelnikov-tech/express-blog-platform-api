import type { PostLike } from '../../domain/entities/post-like.entity.js';
import type { ObjectId } from 'mongodb';

export type PostLikeDocument = PostLike & { _id: ObjectId };
