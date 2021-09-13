import * as React from 'react';
import { Stripe } from '@stripe/stripe-js';

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PUBLIC_URL: string;
    REACT_APP_API_URL: string;
    REACT_APP_STRIPE_PRIVATE_KEY: string;
  }
  interface Window {
    Stripe: Stripe;
  }
}

declare global {
  export interface SwipeableViewsProps extends React.HTMLProps<HTMLDivElement> {
    action: any;
  }
}
