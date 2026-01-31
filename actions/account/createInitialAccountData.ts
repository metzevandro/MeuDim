"use server";
import { db } from "@/lib/db";

const categorias = [
  {
    categoria: "Alimentação",
    subcategorias: ["Delivery", "Lanches", "Restaurantes", "Supermercado"],
  },
  {
    categoria: "Animais de estimação",
    subcategorias: ["Alimentação de pets", "Produtos para pets", "Veterinário"],
  },
  {
    categoria: "Compras",
    subcategorias: [
      "Acessórios",
      "Calçados",
      "Cosméticos e beleza",
      "Decoração",
      "Eletrônicos",
      "Jogos",
      "Móveis",
      "Presentes",
      "Roupas",
    ],
  },
  {
    categoria: "Doações e caridade",
    subcategorias: ["Ajuda a familiares ou amigos", "Doações a instituições"],
  },
  {
    categoria: "Educação",
    subcategorias: ["Cursos", "Livros", "Materiais", "Mensalidades"],
  },
  {
    categoria: "Habitação",
    subcategorias: [
      "Aluguel",
      "Condomínio",
      "Contas de água",
      "Contas de luz",
      "Financiamento",
      "Gás",
      "IPTU/Taxas",
      "Manutenção",
    ],
  },
  {
    categoria: "Investimentos",
    subcategorias: [
      "Ações e fundos",
      "Aportes em poupança",
      "Criptomoedas",
      "Previdência privada",
    ],
  },
  {
    categoria: "Lazer",
    subcategorias: ["Cinema", "Evento", "Hobbie", "Show", "Teatro", "Viagens"],
  },
  {
    categoria: "Saúde",
    subcategorias: [
      "Consultas médicas",
      "Dentista",
      "Exames",
      "Medicamentos",
      "Plano de saúde",
    ],
  },
  {
    categoria: "Seguros",
    subcategorias: [
      "Outros seguros",
      "Seguro de celular",
      "Seguro de vida",
      "Seguro residencial",
    ],
  },
  {
    categoria: "Serviços e assinaturas",
    subcategorias: [
      "Amazon Prime",
      "Apple TV",
      "iCloud",
      "Internet",
      "Max",
      "Netflix",
      "TV a cabo",
      "Telefonia",
    ],
  },
  {
    categoria: "Transporte",
    subcategorias: [
      "Combustível",
      "Estacionamento",
      "Manutenção do veículo",
      "Pedágio",
      "Seguro do veículo",
      "Transporte público",
      "Uber",
    ],
  },
];

const formaDePagamento = [
  "Cartão de crédito",
  "Cartão de débito",
  "Dinheiro",
  "PIX",
];
const fonteDeRenda = ["Freelance", "Investimentos", "Salário"];

export const createInitialData = async (userId: string) => {
  const currentDate = new Date();

  for (const categoria of categorias) {
    const newCategoria = await db.categoria.create({
      data: {
        name: categoria.categoria,
        userId: userId,
        createdAt: currentDate,
      },
    });

    for (const subcategoria of categoria.subcategorias) {
      await db.subcategoria.create({
        data: {
          name: subcategoria,
          categoriaId: newCategoria.id,
        },
      });
    }
  }

  for (const forma of formaDePagamento) {
    await db.formaDePagamento.create({
      data: {
        name: forma,
        userId: userId,
        createdAt: currentDate,
      },
    });
  }

  for (const fonte of fonteDeRenda) {
    await db.fonteDeRenda.create({
      data: {
        name: fonte,
        userId: userId,
        createdAt: currentDate,
      },
    });
  }
};
