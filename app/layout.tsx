import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import "design-system-zeroz/dist/index.esm.css";
import "design-system-zeroz/src/scss/tokens/tokens.scss";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import React from "react";
import LayoutPage from "@/app/(protected)/_components/layout";
import Provider from "./(protected)/_components/provider";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeuDim",
  description:
    "Controle suas finanças de maneira fácil e prática com o MeuDim. Registre seus gastos, organize por categorias, defina formas de pagamento e acompanhe seus ganhos e fontes de renda. Visualize tudo de forma clara e dinâmica com gráficos interativos. Transforme seu dinheiro em uma ferramenta poderosa para o futuro. Com o MeuDim, você tem o controle total das suas finanças na palma da sua mão.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="pt-br" data-company="whitelabel">
       <Head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          />
        </Head>
        <body className={inter.className}>
          <Provider>
            <LayoutPage>{children}</LayoutPage>
          </Provider>
        </body>
      </html>
    </SessionProvider>
  );
}
