import { motion } from 'framer-motion';

const Card = ({ className = '', hoverable = false, children, ...props }) => {
  return (
    <motion.div
      className={`surface-card rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] md:p-8 ${
        hoverable ? 'transition-colors duration-200' : ''
      } ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={hoverable ? { y: -4, scale: 1.005 } : undefined}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
