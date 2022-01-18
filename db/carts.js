const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient();

const create = async (data) => {
  return await prisma.cart.create({ data, include: { items: true } });
}

const find = async (id) => {
  return await prisma.cart.findUnique({
    where: {
      id
    },
    include: {
      items: true
    }
  });
}

module.exports = {
  create,
  find,
}