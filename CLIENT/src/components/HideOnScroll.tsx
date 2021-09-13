import { Slide, useScrollTrigger } from '@material-ui/core';
import React from 'react';

interface HideOnScrollProps {
  children: React.ReactElement;
  disabled?: boolean;
}

export default function HideOnScroll(props: HideOnScrollProps) {
  const { children, disabled } = props;

  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={disabled || !trigger}>
      {children}
    </Slide>
  );
}
