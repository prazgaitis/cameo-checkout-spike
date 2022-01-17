const { PrismaClient } = require('@prisma/client')
const faker = require('faker');

const prisma = new PrismaClient()

const generateProducts = async (num_products) => {
  for (let i = 0; i < num_products; i++) {
    const name = faker.name.findName();
    const price = faker.commerce.price();
    const currency = 'usd';
    const imageUrl = faker.image.imageUrl();
    const title = `Cameo from ${name}`;

    const priceInt = parseInt((parseFloat(price) * 100.0).toFixed(0));
    const expedited = parseInt((priceInt * 1.5).toFixed(0));

    console.log({
      name,
      price: priceInt,
      expedited,
      currency,
      imageUrl,
      title,
    })

    // create regular product
    const product = await prisma.product.create({
      data: {
        title,
        price: priceInt,
        currency,
        imageUrl,
        title,
      }
    });

    // create variants

    // Regular cameo
    await prisma.variant.create({
      data: {
        title: `Cameo from ${name}`,
        productId: product.id,
        price: priceInt,
        currency,
        imageUrl
      }
    });

    // expedited Cameo
    await prisma.variant.create({
      data: {
        title: `Expedited Cameo from ${name}`,
        productId: product.id,
        price: expedited,
        currency,
        imageUrl: faker.image.imageUrl(),
      }
    });
  }
}

async function main() {
  // Connect the client
  await prisma.$connect()
  console.log('connected to prisma')
  // ... you will write your Prisma Client queries here
  const products = await prisma.product.findMany();
  console.log(products);

  // delete everything
  await prisma.variant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  await prisma.user.create({
    data: {
      email: 'prazgaitis@gmail.com',
      name: 'Paul',
    }
  });

  // create talent products
  const num_products = 10;
  await generateProducts(num_products);


  const allUsers = await prisma.user.findMany();
  console.dir(allUsers, { depth: null });
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })