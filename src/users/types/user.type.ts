export interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  role?: string;
  isVerified: boolean;
}
