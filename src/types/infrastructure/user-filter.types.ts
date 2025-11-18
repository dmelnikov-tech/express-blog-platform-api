export interface UserFilter {
  login?: { $regex: string; $options: string };
  email?: { $regex: string; $options: string };
  $or?: Array<{
    login?: { $regex: string; $options: string };
    email?: { $regex: string; $options: string };
  }>;
}
