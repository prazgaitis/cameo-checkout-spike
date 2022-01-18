const { getProducts, getProduct } = require('../../../db/products');

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      if (req.query.id) {
        const product = await getProduct(req.query.id);
        res.status(200).json({ product });
      } else {
        const products = await getProducts();
        res.status(200).json(products);
      }
      break;
    case 'POST':
    case 'PUT':
    case 'DELETE':
      console.log('not implemented');
    default:
  }
}
