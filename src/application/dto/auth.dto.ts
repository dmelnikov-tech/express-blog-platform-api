export interface LoginDto {
  loginOrEmail: string;
  password: string;
}

export interface PasswordRecoveryDto {
  email: string;
}

export interface NewPasswordDto {
  newPassword: string;
  recoveryCode: string;
}
