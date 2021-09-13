import React, { useEffect, createRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

export type SliderDirection = 'horizontal' | 'vertical';

const useSliderContainerStyles = makeStyles({
  root: {
    position: 'relative',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
});

export interface SliderContainerProps {
  direction?: SliderDirection;
  className?: string;
  position: number;
}

export const SliderContainer: React.FC<SliderContainerProps> = ({
  children,
  className,
  direction,
  position,
}) => {
  const classes = useSliderContainerStyles();

  const containerRef = createRef<HTMLDivElement>();

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scroll({
        top:
          direction === 'vertical'
            ? containerRef.current.offsetHeight * position
            : 0,
        left:
          direction === 'horizontal'
            ? containerRef.current.offsetWidth * position
            : 0,
        behavior: 'smooth',
      });
    }
  }, [containerRef, direction, position]);

  return (
    <div className={clsx(classes.root, className)} ref={containerRef}>
      {children}
    </div>
  );
};

const useSliderSectionStyles = makeStyles({
  root: {
    display: 'inline-block',
    width: '100%',
    height: '100%',
  },
});

export interface SliderSectionProps {
  index: number;
  className?: string;
}

export const SliderSection: React.FC<SliderSectionProps> = ({
  className,
  children,
  index,
}) => {
  const classes = useSliderSectionStyles();

  return <div className={clsx(classes.root, className)}>{children}</div>;
};
