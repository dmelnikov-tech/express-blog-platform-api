import type { Comment } from '../../domain/entities/comment.entity.js';
import type { ObjectId } from 'mongodb';

export type CommentDocument = Comment & { _id: ObjectId };

