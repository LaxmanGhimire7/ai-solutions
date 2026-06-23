import { motion } from 'framer-motion';
import { ArrowDownRight, CheckCircle2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';

const PageHero = ({
  eyebrow,
  title,
  description,
  icon: Icon,
  highlights = [],
  children,
}) => {
  const items = highlights.length
    ? highlights
    : ['Responsive public experience', 'Secure admin workflows', 'Clear client communication'];

  return (
    <section className="editorial-grid relative overflow-hidden border-b border-white/10 bg-black py-20 md:py-28">
      <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-[#E95520]/12 blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, x: -45 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <Badge variant="accent" className="gap-2 px-3 py-1.5">
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            {eyebrow}
          </Badge>
          <h1 className="mt-7 text-4xl font-semibold text-[#F5ECE6] sm:text-5xl md:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#A89D96] md:text-lg">
            {description}
          </p>
          {children && <div className="mt-8">{children}</div>}
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-lg lg:mx-0 lg:ml-auto"
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute -right-5 -top-5 h-full w-full rounded-2xl bg-[#E95520]" />
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#111111] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.5)] sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase text-[#F37A49]">AI-Solutions</p>
                <p className="mt-1 text-sm font-medium text-[#F5ECE6]">Client interaction platform</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E95520] text-white">
                <ArrowDownRight className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {items.map((item, index) => (
                <div
                  key={item}
                  className={`flex items-center gap-3 rounded-xl border p-4 ${
                    index === 0 ? 'border-[#E95520]/40 bg-[#E95520]/12' : 'border-white/10 bg-white/[0.035]'
                  }`}
                >
                  <CheckCircle2 className={`h-5 w-5 shrink-0 ${index === 0 ? 'text-[#F37A49]' : 'text-[#746C67]'}`} />
                  <span className="text-sm font-medium text-[#E8DFD9]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PageHero;
