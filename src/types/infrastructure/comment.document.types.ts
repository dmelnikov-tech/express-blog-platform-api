import type { Comment } from '../domain/comment.types.js';
import type { ObjectId } from 'mongodb';

export type CommentDocument = Comment & { _id: ObjectId };
