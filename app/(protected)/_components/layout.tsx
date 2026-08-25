"use client";
import React, { useEffect, useState } from "react";
import {
  AppShell,
  Header,
  HeaderProfile,
  Sidebar,
  SidebarItem,
  SidebarTitle,
  SidebarSubItem,
  Dropdown,
  DropdownItem,
  DropdownTitle,
  Breadcrumb,
} from "design-system-zeroz";
import { useTheme } from "@/data/useTheme";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/data/provider";
import { useLogout } from "./sair";

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutPage = (props: LayoutProps) => {
  const { userData, skeleton, fetchUserData } = useUser();
  const pathname = usePathname() || "";
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
  }, [fetchUserData]);

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
    pathname === "/auth/register" ||
    pathname === "/auth/error" ||
    pathname === "/";

  if (isAuthRoute) {
    return <>{props.children}</>;
  }

  return (
    <AppShell>
      <Sidebar
        brandSize="sm"
        brand="/meuDim.svg"
        setToggleSidebar={toggleSidebar}
        toggle={isOpenSidebar}
      >
        <SidebarTitle title="" />
        <SidebarItem
          onClick={() => navigateTo("/dashboard")}
          isActive={pathname === "/dashboard"}
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
            active={pathname === "/earnings"}
            onClick={() => {
              navigateTo("/earnings");
              if (isMobile()) toggleSidebar();
            }}
          />
          <SidebarSubItem
            title="Fonte de renda"
            active={pathname === "/income-sources"}
            onClick={() => {
              navigateTo("/income-sources");
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
            active={pathname === "/expenses"}
            onClick={() => {
              navigateTo("/expenses");
              if (isMobile()) toggleSidebar();
            }}
          />
          <SidebarSubItem
            title="Categorias"
            active={pathname === "/categories"}
            onClick={() => {
              navigateTo("/categories");
              if (isMobile()) toggleSidebar();
            }}
          />
          <SidebarSubItem
            title="Formas de pagamento"
            active={pathname === "/payment-methods"}
            onClick={() => {
              navigateTo("/payment-methods");
              if (isMobile()) toggleSidebar();
            }}
          />
        </SidebarItem>
        <SidebarTitle title="Configurações" />
        <SidebarItem
          isActive={pathname === "/account"}
          fillIcon={true}
          icon="account_circle"
          title="Conta"
          onClick={() => {
            navigateTo("/account");
            if (isMobile()) toggleSidebar();
          }}
        />
      </Sidebar>
      <Header
        skeleton={skeleton}
        breadcrumb={<Breadcrumb items={getBreadcrumbItems()} />}
        onClick={toggleSidebar}
      >
        <HeaderProfile skeleton={skeleton} name={userData?.user?.name || ""}>
          <Dropdown visible>
            <DropdownTitle label="Conta" />
            <DropdownItem
              label="Conta"
              icon="account_circle"
              onClick={() => navigateTo("/account")}
            />
            <DropdownTitle label="Tema" />
            {isMounted && (
              <DropdownItem
                label={theme === "light" ? "Dark" : "Light"}
                icon={theme === "light" ? "dark_mode" : "light_mode"}
                onClick={toggleTheme}
              />
            )}
            <DropdownTitle label="Sair" />
            <DropdownItem label="Sair" icon="logout" onClick={logout} />
          </Dropdown>
        </HeaderProfile>
      </Header>
      {props.children}
    </AppShell>
  );
};

export default LayoutPage;
