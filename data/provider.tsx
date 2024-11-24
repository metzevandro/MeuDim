import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchUserData, UserData } from "@/actions/fetch";

interface UserContextType {
  userData: UserData | null;
  loading: boolean;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro do UserProvider");
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchUserData(setUserData, setLoading);
  }, []);

  return (
    <UserContext.Provider value={{ userData, loading, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};
