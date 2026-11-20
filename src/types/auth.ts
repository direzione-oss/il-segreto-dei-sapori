export type UserRole = 'admin' | 'user' | 'trial';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isTrial?: boolean;
  dataQuotaRatio?: number;
  createdAt?: string;
  lastLoginAt?: string | null;
}
