import React from 'react';
import { motion } from 'framer-motion';

type MountTransitionProps = {
  slide?: number;
  slideUp?: number;
};

export const MountTransition: React.FC<MountTransitionProps> = ({
  children,
  slide = 0,
  slideUp = 0,
}) => (
  <motion.div
    style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    exit={{ opacity: 0, x: slide, y: slideUp }}
    initial={{ opacity: 0, x: slide, y: slideUp }}
    animate={{ opacity: 1, x: 0, y: 0 }}
  >
    {children}
  </motion.div>
);
