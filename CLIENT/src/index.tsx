import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import './assets/fonts/Cool-Sans.ttf';
import './assets/fonts/Golden-Ranger.ttf';
import configureStore from './redux';
import { Provider } from 'react-redux';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { SnackbarProvider } from 'notistack';

import "react-responsive-carousel/lib/styles/carousel.min.css";

const { store } = configureStore();

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PRIVATE_KEY || '',
);

ReactDOM.render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <Provider store={store}>
        <SnackbarProvider
          maxSnack={4}
          autoHideDuration={3000}
          classes={{ containerRoot: 'translate' }}
        >
          <App />
        </SnackbarProvider>
      </Provider>
    </Elements>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

declare global {
  interface Window {
    doGTranslate: (value: string) => void;
  }
}