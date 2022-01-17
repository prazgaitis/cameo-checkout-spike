// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const stripe = require('stripe')('sk_test_51IBlcUDwPZXY4fVdJn5RCORc2LUwbBfH4XF9XVfkdcSLXuKnR4ad3p9rtRhpRV8RL65WRz379NKIzQ8L6b0w5gdJ00LVwXBggs');
const products = [
  {
    sku: 't-shirt',
    name: "T-Shirt",
    amount: 1000,
    currency: 'usd'
  },
  {
    sku: 'sunglasses',
    name: "Sunglasses",
    amount: 2000,
    currency: 'usd'
  }
];

function calculateCartTotal(skus, currency) {
  let total = 0;
  let lineItems = [];

  for (const sku of skus) {
    const product = products.find(item => item.sku === sku);
    const cost = product.amount;

    total += cost;
    lineItems.push(product);
  }

  return { total, currency, lineItems };
}


export default async function handler(req, res) {
  try {
    const { cart } = req.body;

    // Step 1. Get items from cart. Find out how much they cost
    const { skus, currency } = cart;
    const { total, lineItems } = calculateCartTotal(skus, currency);

    console.log({ total, currency })

    // Step 2. Create payment intent
    const stripeParams = {
      currency,
      amount: total,
      automatic_payment_methods: { enabled: true },
    }
    const paymentIntent = await stripe.paymentIntents.create(stripeParams);

    // Step 3. Send response 
    const response = {
      client_secret: paymentIntent.client_secret,
      line_items: lineItems,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error)
    res.status(500).json({ error })
  }
}
