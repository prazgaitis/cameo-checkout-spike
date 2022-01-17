const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient();

const getProduct = async (id) => {
  return await prisma.product.findUnique({
    where: {
      id
    },
    include: {
      variants: true
    }
  });
}

const getProducts = async () => {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      price: true,
      currency: true,
      imageUrl: true,
    },
  });

  return products;
}

module.exports = {
  getProduct,
  getProducts,
}