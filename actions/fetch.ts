const API = process.env.NEXT_PUBLIC_APP_URL;
export interface Subcategorias {
  id: string;
  name: string;
  categoriaId: string;
}

export interface FonteDeRenda {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  subcategorias: Subcategorias[];
}

export interface Transaction {
  id: string;
  name: string;
  amount: string;
  createdAt: string;
  userId: string;
  categoryId: string;
  category: Category;
}

export interface FormaDePagamento {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: string;
  createdAt: string;
  userId: string;
  categoriaId: string;
  formaDePagamentoId: string;
  formaDePagamento: FormaDePagamento;
  subcategoriaId: string;
}

export interface User {
  name?: string;
  email?: string;
  image: string | null;
  id: string;
  role: string;
  formaDePagamento: FormaDePagamento[];
  categoria: Category[];
  transactions: Transaction[];
  expense: Expense[];
  categories: FonteDeRenda[];
}

export interface UserData {
  user: User;
  expires: string;
}
