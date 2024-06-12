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
  Skeleton,
} from "design-system-zeroz";
import DropDownMenu, {
  DropDownMenuItem,
  DropDownMenuTitle,
} from "design-system-zeroz/src/app/components/DropdownMenu/DropdownMenu";
import { Sair } from "@/actions/logout";
import { usePathname, useRouter } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

interface UserData {
  user: user;
}

interface user {
  name: string;
}

const API = process.env.NEXT_PUBLIC_APP_URL;

const LayoutPage = (props: LayoutProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchUserData() {
    try {
      const response = await fetch(`${API}/api/auth/session`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await response.json();
      setUserData(userData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  const pathname = usePathname();
  const router = useRouter();
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);

  const toggleSidebar = () => {
    setIsOpenSidebar(!isOpenSidebar);
  };

  const navigateTo = (route: string) => {
    router.push(route);
  };

  const breadcrumbs = () => {
    const routes: { [key: string]: string } = {
      "/home": "Home",
      "/home/ganhos": "Home",
      "/conta": "Conta",
    };

    const currentRoute = routes[pathname] || pathname.substr(1);

    if (pathname === "/home/horarios") {
      return (
        <BreadcrumbRoot href="/home" pageName={currentRoute}>
          <Breadcrumb href={pathname} pageName="ganhos" />
        </BreadcrumbRoot>
      );
    } else {
      return <BreadcrumbRoot href={pathname} pageName={currentRoute} />;
    }
  };

  if (
    pathname === "/auth/login" ||
    pathname === "/auth/criar-conta" ||
    pathname === "/auth/error"
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
                active={pathname === "/pagina-inicial/entradas/ganhos"}
                onClick={() => navigateTo("/pagina-inicial/entradas/ganhos")}
              />
              <SidebarSubItem
                title="Fonte de renda"
                active={pathname === "/pagina-inicial/entradas/fonte-de-renda"}
                onClick={() =>
                  navigateTo("/pagina-inicial/entradas/fonte-de-renda")
                }
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
                active={pathname === "/pagina-inicial/saidas/despesas"}
                onClick={() => navigateTo("/pagina-inicial/saidas/despesas")}
              />
              <SidebarSubItem
                title="Categorias"
                active={pathname === "/pagina-inicial/saidas/categorias"}
                onClick={() => navigateTo("/pagina-inicial/saidas/categorias")}
              />
              <SidebarSubItem
                title="Formas de pagamento"
                active={
                  pathname === "/pagina-inicial/saidas/formas-de-pagamento"
                }
                onClick={() =>
                  navigateTo("/pagina-inicial/saidas/formas-de-pagamento")
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
        <Header breadcrumb={breadcrumbs()} onClick={toggleSidebar}>
          {loading === true ? (
            <Skeleton height="56" width="180" />
          ) : (
            <HeaderProfile name={userData?.user?.name || ""}>
              <DropDownMenu dropDownMenu>
                <DropDownMenuTitle content="Conta" />
                <DropDownMenuItem
                  content="Conta"
                  typeIcon="account_circle"
                  onClick={() => navigateTo("/conta")}
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
          )}
        </Header>
        {props.children}
      </AppShell>
    );
  }
};

export default LayoutPage;
