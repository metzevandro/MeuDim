"use client";
import { EmptyState } from "design-system-zeroz";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const backToHome = () => {
    router.push("/pagina-inicial");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: "100%",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: "500px" }}>
        <EmptyState
          icon="scan_delete"
          title="Página não encontrada"
          description="Desculpe, a página que você está procurando não existe. Verifique o URL ou retorne à página inicial."
          buttonContentPrimary="Voltar para a página inicial"
          onClickActionPrimary={backToHome}
        />
      </div>
    </div>
  );
}
