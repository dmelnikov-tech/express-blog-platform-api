import type { Blog } from "../domain/blog.types.js";
import type { ObjectId } from "mongodb";

export type BlogDocument = Blog & { _id: ObjectId };

