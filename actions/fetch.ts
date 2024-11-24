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
  Subcategorias: Subcategorias[];
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

export async function fetchUserData(
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
) {
  try {
    const response = await fetch(`${API}/api/auth/session`);
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    const userData = await response.json();

    // Garantir que 'image' seja string | null (não undefined)
    const formattedUserData: UserData = {
      user: {
        ...userData.user,
        image: userData.user.image ?? null, // Se image for undefined, define como null
      },
      expires: userData.expires ?? null, // Garantir que expires também seja string | null
    };

    setUserData(formattedUserData); // Passando os dados formatados para o setUserData
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
}
