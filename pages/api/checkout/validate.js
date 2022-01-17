const db = {
  carts: {
    'cart_abc12346': {
      items: [
        'foo', 'bar'
      ],
      subtotal: 3000,
      taxes: 300,
      total: 3300,
      currency: 'usd',
    }
  }
}
export default async function handler(req, res) {
  try {
    const { cartId } = req.body;
    console.log(cartId);

    // Pretend we do some kind of cart validation here
    const valid = true;

    res.status(200).json({ cartId, valid })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error })

  }
}
