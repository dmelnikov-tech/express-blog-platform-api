export interface User {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface UserResponseDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

export interface CreateUserDto {
  login: string;
  password: string;
  email: string;
}

export type CreateUserResult =
  | { success: true; data: UserResponseDto }
  | { success: false; error: { field: string; message: string } };
