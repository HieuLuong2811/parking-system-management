import type { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey =
  process.env.REACT_APP_STRIPE_PUBLIC_KEY?.trim() ||
  process.env.VITE_STRIPE_PUBLIC_KEY?.trim() ||
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY?.trim() ||
  "";

export const stripePromise: Promise<Stripe | null> = stripePublicKey
  ? loadStripe(stripePublicKey)
  : Promise.resolve(null);

export const isStripeConfigured = (): boolean => Boolean(stripePublicKey);
