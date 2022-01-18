// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const { PrismaClient } = require('@prisma/client')
const stripe = require('stripe')('sk_test_51IBlcUDwPZXY4fVdJn5RCORc2LUwbBfH4XF9XVfkdcSLXuKnR4ad3p9rtRhpRV8RL65WRz379NKIzQ8L6b0w5gdJ00LVwXBggs');
const prisma = new PrismaClient();
const { create, find } = require('../../../db/carts');

const createPaymentIntent = async (amount, currency, metadata) => {
  const stripeParams = {
    currency,
    amount,
    metadata,
    automatic_payment_methods: { enabled: true },
  }
  const paymentIntent = await stripe.paymentIntents.create(stripeParams);

  return {
    paymentIntentId: paymentIntent.id,
    paymentIntentClientSecret: paymentIntent.client_secret
  };
}

const updatePaymentIntent = async (paymentIntentId, amount) => {
  if (amount < 50) throw new Error('Charge must be at least $0.50');

  try {
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount,
    });

    return {
      paymentIntentId: paymentIntent.id,
      paymentIntentClientSecret: paymentIntent.client_secret
    };

  } catch (error) {
    console.error("Error updating payment intent: " + error.message)
    return {
      paymentIntentId: null,
      paymentIntentClientSecret: null,
    }

  }
}

const createOrUpdatePaymentIntent = async (cartId, amount) => {
  const { id, currency, paymentIntentId } = await find(cartId);

  if (paymentIntentId) {
    return updatePaymentIntent(paymentIntentId, amount);
  }

  return createPaymentIntent(amount, currency, { cartId: id });
}

const findOrCreateCart = async (params) => {
  // todo: placeholder user finder. Should send this in a header or something
  const user = await prisma.user.findFirst({
    where: {
      name: 'Paul',
    },
  });

  const { cartId, currency = "usd" } = params;

  if (!cartId) {
    return await create({
      userId: user.id,
      currency,
      total: 0,
    });
  }

  // Find the cart if it exists
  return await find(cartId);
}

const addItem = async (variantId, cart) => {
  // if item is in cart, increment quantity
  const item = cart.items?.find(item => item.variantId === variantId);
  let newTotal;

  // if item exists, increment quantity
  if (item) {
    await prisma.cartItem.update({
      where: {
        id: item.id
      },
      data: {
        quantity: item.quantity + 1,
      },
    });

    newTotal = cart.total + item.price;
  } else {
    // item does not exist, find the variant and add to cart.
    // Find variant
    const variant = await prisma.variant.findUnique({
      where: {
        id: variantId
      }
    });

    // TODO: Check if variant is in stock

    // Create cart item
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        title: variant.title,
        price: variant.price,
        currency: variant.currency,
        quantity: 1,
        variantId: variant.id,
        amountDiscounted: 0,
        imageUrl: variant.imageUrl,
      }
    });

    newTotal = cart.total + variant.price;
  };

  const {
    paymentIntentId,
    paymentIntentClientSecret
  } = await createOrUpdatePaymentIntent(cart.id, newTotal);

  // update cart price
  await prisma.cart.update({
    where: {
      id: cart.id
    },
    data: {
      total: newTotal,
      paymentIntentId,
      paymentIntentClientSecret,
    },
  });

  return await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: true } });
}

export default async function handler(req, res) {
  const { userId, currency, cartId, variantId } = req.body;

  let cart = await findOrCreateCart({ cartId });
  cart = await addItem(variantId, cart);

  res.status(200).json({ cart });
}
