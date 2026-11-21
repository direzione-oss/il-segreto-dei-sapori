export type UserRole = 'admin' | 'user' | 'trial';
export type UserStatus = 'pending' | 'active' | 'suspended';
export type SubscriptionPlan = 'free' | 'monthly' | 'yearly' | 'lifetime' | 'promo' | 'trial';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
  phone?: string;
  status: UserStatus;
  expiresAt?: string | null;
  subscriptionPlan?: SubscriptionPlan | string;
  notes?: string;
  isTrial?: boolean;
  dataQuotaRatio?: number;
  createdAt?: string;
  lastLoginAt?: string | null;
  redeemedPromos?: string[];
}

export interface PaymentConfig {
  paymentUrl: string;
  iban: string;
  bankBeneficiary: string;
  contactEmail: string;
  contactPhone: string;
  plansText: string;
  welcomeMessage: string;
  promoEnabled: boolean;
  promoCode: string;
  promoDays?: number;
}
