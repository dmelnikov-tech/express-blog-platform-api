export interface CreateUserDto {
  login: string;
  password: string;
  email: string;
}

export interface UserResponseDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

export type CreateUserResult =
  | { success: true; data: UserResponseDto }
  | { success: false; error: { field: string; message: string } };

