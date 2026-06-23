const variants = {
  default: 'bg-slate-100 text-slate-600',
  accent: 'bg-[#E95520]/10 text-[#E95520] border border-[#E95520]/20',
  success: 'bg-emerald-50 text-emerald-600',
};

const Badge = ({ variant = 'default', className = '', children }) => {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
