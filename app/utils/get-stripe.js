import { loadStripe } from '@stripe/stripe-js';

// Declare a variable to hold the Stripe promise
let stripePromise;

const getStripe = () => {
  // Check if the Stripe promise has already been created
  if (!stripePromise) {
    // Ensure the publishable key is available
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      throw new Error('Missing Stripe publishable key');
    }

    // Initialize the Stripe promise with the publishable key
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }

  // Return the existing Stripe promise
  return stripePromise;
};

export default getStripe;
