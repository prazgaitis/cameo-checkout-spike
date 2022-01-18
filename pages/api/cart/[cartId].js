import { find } from "../../../db/carts";

export default async function handler(req, res) {
  const { cartId } = req.query;
  console.log({ cartId, params: req.params, q: req.query });

  const cart = await find(cartId);

  res.status(200).json({ cart });
}
