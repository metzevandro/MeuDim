"use client";
import React, { useState } from "react";
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
import { useCurrentUser } from "@/hooks/user-current-user";
import { usePathname, useRouter } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutPage = (props: LayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);

  const toggleSidebar = () => {
    setIsOpenSidebar(!isOpenSidebar);
  };

  const user = useCurrentUser();

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
    pathname === "/auth/error" ||
    pathname === "/auth/new-verification" ||
    pathname === "/auth/nova-senha" ||
    pathname === "/auth/reset" ||
    pathname === "/"
  ) {
    return <>{props.children}</>;
  } else {
    return (
      <AppShell>
        <SideBar
          brand="/next.svg"
          setToggleSidebar={toggleSidebar}
          toggle={isOpenSidebar}
        >
          <SidebarItem
            onClick={() => navigateTo("/pagina-inicial")}
            active={pathname === "/pagina-inicial"}
            fillIcon
            icon="home"
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
                title="Fonte de Renda"
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
                title="Formas de Pagamento"
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
          <HeaderProfile name={user?.name || ""} avatar_src={user?.image || ""}>
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
                onClick={() => Sair()}
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
