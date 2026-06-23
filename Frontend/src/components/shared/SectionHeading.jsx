import { motion } from 'framer-motion';

const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = 'left',
  action,
  dark = false,
}) => {
  const centered = align === 'center';

  return (
    <motion.div
      className={`flex flex-col gap-6 ${
        centered ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'
      }`}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-3xl">
        {eyebrow && (
          <p className={`text-xs font-semibold uppercase ${dark ? 'text-[#F37A49]' : 'text-[#E95520]'}`}>
            {eyebrow}
          </p>
        )}
        <h2 className={`mt-3 text-3xl font-semibold md:text-5xl ${dark ? 'text-[#F5ECE6]' : 'text-black'}`}>
          {title}
        </h2>
        {description && (
          <p className={`mt-4 text-base leading-relaxed ${dark ? 'text-[#A89D96]' : 'text-[#625952]'}`}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  );
};

export default SectionHeading;
