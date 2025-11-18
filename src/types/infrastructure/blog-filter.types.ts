export type BlogFilter = {} | { name: { $regex: string; $options: 'i' } };
