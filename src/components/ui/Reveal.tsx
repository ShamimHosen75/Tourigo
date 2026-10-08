'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

/** Fade/slide-in when the element scrolls into view. */
export function Reveal({ delay = 0, y = 28, children, ...rest }: { delay?: number; y?: number } & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
