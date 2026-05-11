const variants = {
  default: 'bg-slate-100 text-slate-600',
  accent: 'bg-indigo-50 text-indigo-600',
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
