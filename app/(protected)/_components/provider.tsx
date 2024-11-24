"use client";
import React from "react";
import { UserProvider } from "@/data/provider";

interface ProviderProps {
  children: React.ReactNode;
}

function ProviderComponent({ children }: ProviderProps) {
  return <UserProvider>{children}</UserProvider>;
}

export default ProviderComponent;
