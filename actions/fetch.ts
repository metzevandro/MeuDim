// Enums
export type UserRole = "ADMIN" | "USER";

// ================== CORE MODELS ==================

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  password?: string | null;
  role: UserRole;

  accounts: Account[];
  expenses: Expense[];
  transactions: Transaction[];
}

// ================== AUTH ==================

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;

  refreshToken?: string | null;
  accessToken?: string | null;
  expiresAt?: number | null;
  tokenType?: string | null;
  scope?: string | null;
  idToken?: string | null;
  sessionState?: string | null;

  user: User;
}

// ================== FINANCE ==================

export interface Transaction {
  id: string;
  amount: number;
  accountId: string;
  createdAt: string; // ou Date
  incomeSourceId: string;

  incomeSource: IncomeSource;
  user: User;
}

export interface Expense {
  id: string;
  amount: number;
  accountId: string;
  createdAt: string;

  categoryId: string;
  subcategoryId?: string | null;
  paymentMethodId?: string | null;

  user: User;
  category: Category;
  subcategory?: Subcategory | null;
  paymentMethod?: PaymentMethod | null;
}

// ================== CATEGORY ==================

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;

  expenses: Expense[];
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;

  category: Category;
  expenses: Expense[];
}

// ================== PAYMENT & INCOME ==================

export interface PaymentMethod {
  id: string;
  name: string;
  userId: string;
  createdAt: string;

  expenses: Expense[];
}

export interface IncomeSource {
  id: string;
  name: string;
  userId: string;
  createdAt: string;

  transactions: Transaction[];
}

// ================== TOKENS ==================

export interface VerificationToken {
  id: string;
  email: string;
  token: string;
  expires: string;
}

export interface PasswordResetToken {
  id: string;
  email: string;
  token: string;
  expires: string;
}

// ================== SESSION ==================

export interface UserData {
  user: User;
  expires: string;
}
