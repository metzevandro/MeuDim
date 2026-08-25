export type UserRole = "ADMIN" | "USER";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  password?: string | null;
  role: UserRole;

  categories: Category[];
  incomeSources: IncomeSource[];
  paymentMethods: PaymentMethod[];
  accounts: Account[];
  expenses: Expense[];
  earnings: Earning[];
}

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

export interface Earning {
  id: string;
  amount: number;
  userId: string;
  createdAt: Date;
  incomeSourceId: string;

  incomeSource: IncomeSource;
  user: User;
}

export interface Expense {
  id: string;
  amount: number;
  userId: string;
  createdAt: Date;

  categoryId: string;
  subcategoryId?: string | null;
  paymentMethodId?: string | null;

  user: User;
  category: Category;
  subcategory?: Subcategory | null;
  paymentMethod?: PaymentMethod | null;
}

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

  earnings: Earning[];
}

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

export interface UserData {
  user: User;
  expires: string;
}
