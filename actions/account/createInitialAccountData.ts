"use server";
import { db } from "@/lib/db";

const categories = [
  {
    category: "Alimentação",
    subcategories: ["Delivery", "Lanches", "Restaurantes", "Supermercado"],
  },
  {
    category: "Animais de estimação",
    subcategories: ["Alimentação de pets", "Produtos para pets", "Veterinário"],
  },
  {
    category: "Compras",
    subcategories: [
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
    category: "Doações e caridade",
    subcategories: ["Ajuda a familiares ou amigos", "Doações a instituições"],
  },
  {
    category: "Educação",
    subcategories: ["Cursos", "Livros", "Materiais", "Mensalidades"],
  },
  {
    category: "Habitação",
    subcategories: [
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
    category: "Investimentos",
    subcategories: [
      "Ações e fundos",
      "Aportes em poupança",
      "Criptomoedas",
      "Previdência privada",
    ],
  },
  {
    category: "Lazer",
    subcategories: ["Cinema", "Evento", "Hobbie", "Show", "Teatro", "Viagens"],
  },
  {
    category: "Saúde",
    subcategories: [
      "Consultas médicas",
      "Dentista",
      "Exames",
      "Medicamentos",
      "Plano de saúde",
    ],
  },
  {
    category: "Seguros",
    subcategories: [
      "Outros seguros",
      "Seguro de celular",
      "Seguro de vida",
      "Seguro residencial",
    ],
  },
  {
    category: "Serviços e assinaturas",
    subcategories: [
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
    category: "Transporte",
    subcategories: [
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

const paymentMethods = [
  "Cartão de crédito",
  "Cartão de débito",
  "Dinheiro",
  "PIX",
];

const incomeSources = ["Freelance", "Investimentos", "Salário"];

export const createInitialData = async (userId: string) => {
  const currentDate = new Date();

  await Promise.all([
    ...categories.map(async (category) => {
      const newCategory = await db.category.create({
        data: { name: category.category, userId, createdAt: currentDate },
      });
      await db.subcategory.createMany({
        data: category.subcategories.map((name) => ({
          name,
          categoryId: newCategory.id,
        })),
      });
    }),
    db.paymentMethod.createMany({
      data: paymentMethods.map((name) => ({
        name,
        userId,
        createdAt: currentDate,
      })),
    }),
    db.incomeSource.createMany({
      data: incomeSources.map((name) => ({
        name,
        userId,
        createdAt: currentDate,
      })),
    }),
  ]);
};
