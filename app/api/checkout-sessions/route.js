import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Format amount for Stripe in cents
const formatAmountForStripe = (amount, currency) => {
  return Math.round(amount * 100);
};

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

// Handle POST requests to create a Stripe checkout session
export async function POST(req) {
  try {
    // Get referer from headers or default to local URL
    const referer = req.headers.get('referer') || 'http://localhost:3000/';
    
    // Define parameters for Stripe checkout session
    const params = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Basic subscription',
            },
            unit_amount: formatAmountForStripe(10, 'usd'), 
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${referer}result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${referer}result?session_id={CHECKOUT_SESSION_ID}`,
    };

    // Create a checkout session with Stripe
    const checkoutSession = await stripe.checkout.sessions.create(params);

    // Return the checkout session as JSON
    return NextResponse.json(checkoutSession, { status: 200 });
  } catch (error) {
    // Log and return error details
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: { message: error.message, details: error.stack } },
      { status: 500 }
    );
  }
}

// Handle GET requests to retrieve a Stripe checkout session
export async function GET(req) {
  // Extract session_id from query parameters
  const searchParams = req.nextUrl.searchParams;
  const session_id = searchParams.get('session_id');

  try {
    // Ensure session_id is provided
    if (!session_id) {
      throw new Error('Session ID is required');
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    // Return the checkout session as JSON
    return NextResponse.json(checkoutSession);
  } catch (error) {
    // Log and return error details
    console.error('Error retrieving checkout session:', error);
    return NextResponse.json(
      { error: { message: error.message, details: error.stack } },
      { status: 500 }
    );
  }
}
