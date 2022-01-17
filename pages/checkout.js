import { useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import CheckoutForm from './components/CheckoutForm';
import CheckoutContext from './context/CheckoutContext';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_51IBlcUDwPZXY4fVdURCbxEHaNKVmamA3ixUCU1XTHWsQ0tZf17he2KqVZ7Xal6uEb5vziU8uCxeYafAXFEne8oIX00e3oOTpDY');

const products = [
  {
    id: 1,
    title: 'Basic Tee',
    href: '#',
    price: '$32.00',
    color: 'Black',
    size: 'Large',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/checkout-page-02-product-01.jpg',
    imageAlt: "Front of men's Basic Tee in black.",
  },
  // More products...
]
const deliveryMethods = [
  { id: 1, title: 'Standard', turnaround: '4–10 business days', price: 'free' },
  { id: 2, title: 'Expedited', turnaround: '24 hours', price: '$16.00' },
]
const postData = async (url, data = {}) => {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data)
  })

  return response.json();
}

const createCart = async () => {
  const selectedProducts = ['t-shirt', 'sunglasses'];
  const response = await postData('/api/cart/create', {
    cart: {
      skus: selectedProducts,
      currency: 'usd',
    }
  })

  return response;
}

export default function Example() {
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(deliveryMethods[0])
  const [cart, setCart] = useState({});
  const [stripeOptions, setStripeOptions] = useState(null);

  const checkoutContext = {
    setSelectedDeliveryMethod,
    selectedDeliveryMethod,
    deliveryMethods,
    stripeOptions,
    products,
    postData,
  }

  useEffect(() => {
    createCart()
      .then(data => {
        const { client_secret: clientSecret } = data;
        setCart(data);
        setStripeOptions({
          clientSecret
        })
        console.log(stripeOptions)
      })
      .catch(err => console.error(err));
  }, []);


  if (stripeOptions && stripeOptions.clientSecret) {
    return (
      <Elements stripe={stripePromise} options={stripeOptions}>
        <CheckoutContext.Provider value={checkoutContext}>
          <CheckoutForm />
        </CheckoutContext.Provider>
      </Elements>
    )
  } else {
    return <div>loading...</div>;
  }
}