export interface User {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  confirmationInfo: {
    userIsConfirmed: boolean;
    confirmationCode: string | null;
    confirmationCodeExpiredAt: string | null;
  };
}

