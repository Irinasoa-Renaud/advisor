import React from 'react';
import { Slide, SlideProps } from '@material-ui/core';

export const SlideTransition = React.forwardRef<unknown, SlideProps>(
  function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  }
);
