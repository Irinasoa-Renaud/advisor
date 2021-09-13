import React from 'react';
import {
  Route,
  RouteProps,
  Switch,
  BrowserRouter as Router,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { MountTransition } from './MountTransition';

interface AnimatedRoutesProps {
  exitBeforeEnter?: boolean;
  initial?: boolean;
}

export const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({
  children,
  exitBeforeEnter = true,
  initial = false,
}) => (
  <Router>
    <Route
      render={({ location }) => (
        <AnimatePresence exitBeforeEnter={exitBeforeEnter} initial={initial}>
          <Switch location={location} key={location.pathname}>
            {children}
          </Switch>
        </AnimatePresence>
      )}
    />
  </Router>
);

interface RouteTransitionProps extends RouteProps {
  slide?: number;
  slideUp?: number;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  slide = 100,
  slideUp = 0,
  children,
  component: Component,
  render,
  ...rest
}) => (
  <Route {...rest}>
    <MountTransition slide={slide} slideUp={slideUp}>
      <Route component={Component} render={render}>
        {children}
      </Route>
    </MountTransition>
  </Route>
);
