"use client";
import React, { useEffect, useState } from "react";
import {
  AppShell,
  Breadcrumb,
  Header,
  HeaderProfile,
  SideBar,
  SidebarItem,
  SidebarTitle,
  SidebarSubItem,
  Dropdown,
  DropdownItem,
  DropdownTitle,
} from "design-system-zeroz";
import { useTheme } from "@/data/useTheme";
import { Sair } from "@/actions/logout";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/data/provider";
import { useLogout } from "./sair";

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutPage = (props: LayoutProps) => {
  const { userData, skeleton, fetchUserData } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { theme, toggleTheme } = useTheme();

  const toggleSidebar = () => {
    setIsOpenSidebar(!isOpenSidebar);
  };

  const navigateTo = (route: string) => {
    router.push(route);
    if (isMobile()) {
      toggleSidebar();
    }
  };

  const logout = useLogout();

  useEffect(() => {
    fetchUserData();
    setIsMounted(true);
  }, []);

  const isMobile = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  };

  const getBreadcrumbItems = () => {
    const pathnames = pathname.split("/").filter((x) => x);

    const items = pathnames.map((path, index) => {
      let pageName = path.charAt(0).toUpperCase() + path.slice(1);

      return {
        href: `/${pathnames.slice(0, index + 1).join("/")}`,
        pageName: pageName.replace(/-/g, " "),
      };
    });

    return items;
  };

  const isAuthRoute =
    pathname === "/auth/login" ||
    pathname === "/auth/criar-conta" ||
    pathname === "/auth/error" ||
    pathname === "/";

  if (isAuthRoute) {
    return <>{props.children}</>;
  }

  return (
    <AppShell>
      <SideBar
        brandSize="sm"
        brand="/meuDim.svg"
        setToggleSidebar={toggleSidebar}
        toggle={isOpenSidebar}
      >
        <SidebarTitle title="" />
        <SidebarItem
          onClick={() => navigateTo("/pagina-inicial")}
          isActive={pathname === "/pagina-inicial"}
          fillIcon
          icon="dashboard"
          title="Página Inicial"
        />
        <SidebarTitle title="controle financeiro" />
        <SidebarItem
          isActive={false}
          fillIcon={false}
          icon="trending_up"
          title="Entradas"
        >
          <SidebarSubItem
            title="Ganhos"
            active={pathname === "/pagina-inicial/ganhos"}
            onClick={() => {
              navigateTo("/pagina-inicial/ganhos");
              if (isMobile()) toggleSidebar();
            }}
          />
          <SidebarSubItem
            title="Fonte de renda"
            active={pathname === "/pagina-inicial/fonte-de-renda"}
            onClick={() => {
              navigateTo("/pagina-inicial/fonte-de-renda");
              if (isMobile()) toggleSidebar();
            }}
          />
        </SidebarItem>
        <SidebarItem
          isActive={false}
          fillIcon={false}
          icon="trending_down"
          title="Saídas"
        >
          <SidebarSubItem
            title="Despesas"
            active={pathname === "/pagina-inicial/despesas"}
            onClick={() => {
              navigateTo("/pagina-inicial/despesas");
              if (isMobile()) toggleSidebar();
            }}
          />
          <SidebarSubItem
            title="Categorias"
            active={pathname === "/pagina-inicial/categorias"}
            onClick={() => {
              navigateTo("/pagina-inicial/categorias");
              if (isMobile()) toggleSidebar();
            }}
          />
          <SidebarSubItem
            title="Formas de pagamento"
            active={pathname === "/pagina-inicial/formas-de-pagamento"}
            onClick={() => {
              navigateTo("/pagina-inicial/formas-de-pagamento");
              if (isMobile()) toggleSidebar();
            }}
          />
        </SidebarItem>
        <SidebarTitle title="Configurações" />
        <SidebarItem
          isActive={pathname === "/conta"}
          fillIcon={true}
          icon="account_circle"
          title="Conta"
          onClick={() => {
            navigateTo("/conta");
            if (isMobile()) toggleSidebar();
          }}
        />
      </SideBar>
      <Header
        skeleton={skeleton}
        breadcrumb={<Breadcrumb items={getBreadcrumbItems()} />}
        onClick={toggleSidebar}
      >
        <HeaderProfile skeleton={skeleton} name={userData?.user?.name || ""}>
          <Dropdown dropdown>
            <DropdownTitle content="Conta" />
            <DropdownItem
              content="Conta"
              typeIcon="account_circle"
              onClick={() => navigateTo("/conta")}
            />
            <DropdownTitle content="Tema" />
            {isMounted && (
              <DropdownItem
                content={theme === "light" ? "Dark" : "Light"}
                typeIcon={theme === "light" ? "dark_mode" : "light_mode"}
                onClick={toggleTheme}
              />
            )}
            <DropdownTitle content="Sair" />
            <DropdownItem content="Sair" typeIcon="logout" onClick={logout} />
          </Dropdown>
        </HeaderProfile>
      </Header>
      {props.children}
    </AppShell>
  );
};

export default LayoutPage;
