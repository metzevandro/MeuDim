"use client";
import React, { useEffect, useState } from "react";
import {
  AppShell,
  Breadcrumb,
  BreadcrumbRoot,
  Header,
  HeaderProfile,
  SideBar,
  SidebarItem,
  SidebarList,
  SidebarSubItem,
} from "design-system-zeroz";
import DropDownMenu, {
  DropDownMenuItem,
  DropDownMenuTitle,
} from "design-system-zeroz/src/app/components/DropdownMenu/DropdownMenu";
import { Sair } from "@/actions/logout";
import { usePathname, useRouter } from "next/navigation";
import { fetchUserData, UserData } from "@/actions/fetch";

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutPage = (props: LayoutProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const initialTheme =
    typeof window !== "undefined" && localStorage.getItem("theme");
  const [theme, setTheme] = useState<string>(initialTheme || "");

  useEffect(() => {
    fetchUserData(setUserData, setLoading);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const pathname = usePathname();
  const router = useRouter();
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);

  const toggleSidebar = () => {
    setIsOpenSidebar(!isOpenSidebar);
  };

  const navigateTo = (route: string) => {
    router.push(route);
  };

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";

    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter((path) => path);
    let accumulatedPath = "/";

    const breadcrumbs = paths.map((path, index) => {
      accumulatedPath += `${path}/`;
      if (path === "pagina-inicial") {
        return (
          <BreadcrumbRoot
            key={index}
            pageName={path === "pagina-inicial" ? "Página inicial" : ""}
            href={accumulatedPath.slice(0, -1)}
          />
        );
      }

      if (path === "conta") {
        return (
          <BreadcrumbRoot
            key={index}
            pageName={path === "conta" ? "Conta" : ""}
            href={accumulatedPath.slice(0, -1)}
          />
        );
      }

      const pageName =
        path.charAt(0).toUpperCase() + path.slice(1).toLowerCase();

      return (
        <Breadcrumb
          key={index}
          pageName={pageName.replace("-", " ").replace("-", " ")}
          href={accumulatedPath.slice(0, -1)}
        />
      );
    });

    return breadcrumbs;
  };

  if (
    pathname === "/auth/login" ||
    pathname === "/auth/criar-conta" ||
    pathname === "/auth/error" ||
    pathname === "/"
  ) {
    return <div>{props.children}</div>;
  } else {
    return (
      <AppShell>
        <SideBar
          brand="/meuDim.svg"
          setToggleSidebar={toggleSidebar}
          toggle={isOpenSidebar}
        >
          <SidebarItem
            onClick={() => navigateTo("/pagina-inicial")}
            active={pathname === "/pagina-inicial"}
            fillIcon
            icon="dashboard"
            title="Página Inicial"
          />
          <SidebarList title="controle financeiro">
            <SidebarItem
              active={false}
              fillIcon={false}
              icon="trending_up"
              title="Entradas"
            >
              <SidebarSubItem
                title="Ganhos"
                active={pathname === "/pagina-inicial/ganhos"}
                onClick={() => navigateTo("/pagina-inicial/ganhos")}
              />
              <SidebarSubItem
                title="Fonte de renda"
                active={pathname === "/pagina-inicial/fonte-de-renda"}
                onClick={() => navigateTo("/pagina-inicial/fonte-de-renda")}
              />
            </SidebarItem>
            <SidebarItem
              active={false}
              fillIcon={false}
              icon="trending_down"
              title="Saídas"
            >
              <SidebarSubItem
                title="Despesas"
                active={pathname === "/pagina-inicial/despesas"}
                onClick={() => navigateTo("/pagina-inicial/despesas")}
              />
              <SidebarSubItem
                title="Categorias"
                active={pathname === "/pagina-inicial/categorias"}
                onClick={() => navigateTo("/pagina-inicial/categorias")}
              />
              <SidebarSubItem
                title="Formas de pagamento"
                active={pathname === "/pagina-inicial/formas-de-pagamento"}
                onClick={() =>
                  navigateTo("/pagina-inicial/formas-de-pagamento")
                }
              />
            </SidebarItem>
          </SidebarList>
          <SidebarList title="Configurações">
            <SidebarItem
              active={pathname === "/conta"}
              fillIcon={true}
              icon="account_circle"
              title="Conta"
              onClick={() => navigateTo("/conta")}
            />
          </SidebarList>
        </SideBar>
        <Header
          skeleton={loading}
          breadcrumb={
            <div style={{ display: "flex", gap: "var(--s-spacing-xx-small)" }}>
              {generateBreadcrumbs()}
            </div>
          }
          onClick={toggleSidebar}
        >
          <HeaderProfile skeleton={loading} name={userData?.user?.name || ""}>
            <DropDownMenu dropDownMenu>
              <DropDownMenuTitle content="Conta" />
              <DropDownMenuItem
                content="Conta"
                typeIcon="account_circle"
                onClick={() => navigateTo("/conta")}
              />
              <DropDownMenuTitle content="Tema" />
              <DropDownMenuItem
                content={theme === "light" ? "Dark" : "Light"}
                typeIcon={theme === "light" ? "dark_mode" : "light_mode"}
                onClick={toggleTheme}
              />
              <DropDownMenuTitle content="Sair" />
              <DropDownMenuItem
                content="Sair"
                typeIcon="logout"
                onClick={() => {
                  Sair();
                }}
              />
            </DropDownMenu>
          </HeaderProfile>
        </Header>
        {props.children}
      </AppShell>
    );
  }
};

export default LayoutPage;
