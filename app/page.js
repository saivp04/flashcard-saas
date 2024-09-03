'use client';
import React from 'react';
import Box from '@mui/material/Box';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import getStripe from './utils/get-stripe';  // Ensure this function uses the public key
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import useSWR from 'swr';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// Fetcher function for SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

const HomePage = () => {
  // Stripe checkout handler
  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: process.env.NEXT_PUBLIC_APP_URL }) // Use environment variable
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const checkoutSessionJson = await response.json();
      const stripe = await getStripe();  // Ensure this uses the public key

      const { error } = await stripe.redirectToCheckout({
        sessionId: checkoutSessionJson.id,
      });

      if (error) {
        console.warn('Stripe checkout error:', error.message);
      }
    } catch (err) {
      console.error('Error during Stripe checkout:', err);
      alert('There was an issue with the checkout process. Please try again.');
    }
  };

  // Example of using useSWR to fetch data
  const { data, error } = useSWR('/api/your-endpoint', fetcher, {
    refreshInterval: 3000, // Set options directly here
  });

  if (error) return <Alert severity="error">Failed to load data</Alert>;
  if (!data) return <CircularProgress />;

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Flashcard SaaS
          </Typography>
          <SignedOut>
            <Button color="inherit" href="/sign-in">Login</Button>
            <Button color="inherit" href="/sign-up">Sign Up</Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Flashcard SaaS
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          The easiest way to create flashcards from your text.
        </Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2, mr: 2 }} href="/generate">
          Get Started
        </Button>
      </Box>

      {/* Features Section */}
      <Box sx={{ my: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center">
          Features
        </Typography>
        <Box display="flex" flexWrap="wrap" justifyContent="center" spacing={4}>
          <Box item xs={12} sm={6} md={4} sx={{ p: 2 }}>
            <Typography variant="h6">Easy to Use</Typography>
            <Typography>Create flashcards easily from your Text!.</Typography>
          </Box>
          <Box item xs={12} sm={6} md={4} sx={{ p: 2 }}>
            <Typography variant="h6">Customizable</Typography>
            <Typography>Personalize your flashcards!.</Typography>
          </Box>
          <Box item xs={12} sm={6} md={4} sx={{ p: 2 }}>
            <Typography variant="h6">Accessible</Typography>
            <Typography>Access your Flashcards at any moment in anywhere from the world!.</Typography>
          </Box>
        </Box>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Pricing
        </Typography>
        <Box display="flex" flexWrap="wrap" justifyContent="center" spacing={4}>
          <Box item xs={12} sm={6} md={4} sx={{ p: 2 }}>
            <Typography variant="h6">Basic</Typography>
            <Typography>$10/month</Typography>
            <Button variant="outlined" onClick={handleCheckout}>Subscribe</Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default HomePage;
