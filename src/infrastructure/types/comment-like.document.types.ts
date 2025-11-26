import type { CommentLike } from '../../domain/entities/comment-like.entity.js';
import type { ObjectId } from 'mongodb';

export type CommentLikeDocument = CommentLike & { _id: ObjectId };
