const Card = ({ className = '', hoverable = false, children, ...props }) => {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] md:p-8 ${
        hoverable ? 'transition-colors hover:border-slate-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
