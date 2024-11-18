import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchUserData, UserData } from "@/actions/fetch";

// Define o tipo de dados do contexto
interface UserContextType {
  userData: UserData | null;
  loading: boolean;
}

// Cria o contexto com valores padrão
const UserContext = createContext<UserContextType | undefined>(undefined);

// Cria um hook para facilitar o acesso ao contexto
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro do UserProvider");
  }
  return context;
};

// Define o provider do contexto
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Busca os dados do usuário ao montar o componente
    fetchUserData(setUserData, setLoading);
  }, []);

  return (
    <UserContext.Provider value={{ userData, loading }}>
      {children}
    </UserContext.Provider>
  );
};
