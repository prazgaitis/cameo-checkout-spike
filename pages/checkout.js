import { useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import CheckoutForm from './components/CheckoutForm';
import CheckoutContext from './context/CheckoutContext';
import { postData } from './components/helpers';
import { useRouter } from 'next/router'

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_51IBlcUDwPZXY4fVdURCbxEHaNKVmamA3ixUCU1XTHWsQ0tZf17he2KqVZ7Xal6uEb5vziU8uCxeYafAXFEne8oIX00e3oOTpDY');

export default function Example() {
  const { query } = useRouter();

  const [cart, setCart] = useState(null);
  const [stripeOptions, setStripeOptions] = useState(null);


  console.log({ query })

  const checkoutContext = {
    stripeOptions,
    postData,
    cart,
  }

  const fetchCart = async () => {
    const response = await fetch(`/api/cart/${query.cartId}`);
    return response.json();
  }

  useEffect(() => {
    if (!query?.cartId) return;
    fetchCart()
      .then(data => {
        console.log(data.cart)
        const { paymentIntentClientSecret: clientSecret } = data.cart;
        setCart(data.cart);
        setStripeOptions({
          clientSecret
        })
        console.log(stripeOptions)
      })
      .catch(err => console.error(err));
  }, [query.cartId]);


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