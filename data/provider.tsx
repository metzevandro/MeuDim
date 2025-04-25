import { UserData } from "@/actions/fetch";
import React, { createContext, useContext, useState } from "react";
const API = process.env.NEXT_PUBLIC_APP_URL;

interface UserContextType {
  userData: UserData | null;
  skeleton: boolean;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  fetchUserData: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [skeleton, setSkeleton] = useState(false);

  const fetchUserData = async () => {
    setSkeleton(true);
    try {
      const response = await fetch(`${API}/api/auth/session`);
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setSkeleton(false);
    }
  };

  const logout = () => {
    setUserData(null);
  };

  return (
    <UserContext.Provider
      value={{ userData, skeleton, setUserData, fetchUserData, logout }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
