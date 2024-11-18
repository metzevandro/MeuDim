import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

export const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    // Verifica se o tema está armazenado nos cookies ou se deve usar a preferência do sistema
    const savedTheme = Cookies.get("theme") as "light" | "dark" | undefined;
    if (savedTheme) {
      return savedTheme;
    }

    // Se não houver tema salvo, use a preferência do sistema
    const userPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    return userPrefersDark ? "dark" : "light";
  });

  useEffect(() => {
    // Atualiza o atributo data-theme no HTML sempre que o tema mudar
    document.documentElement.setAttribute("data-theme", theme);

    // Salva a preferência de tema nos cookies
    Cookies.set("theme", theme, { expires: 365 });
  }, [theme]); // Sempre que o tema mudar, o cookie é atualizado

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme); // Atualiza o tema
  };

  return { theme, toggleTheme };
};
