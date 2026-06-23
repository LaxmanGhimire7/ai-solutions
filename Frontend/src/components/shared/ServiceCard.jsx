import Card from '@/components/ui/Card';

const ServiceCard = ({ icon: Icon, title, description }) => {
  return (
    <Card hoverable className="group h-full">
      {Icon && (
        <div className="inline-flex rounded-xl border border-[#E95520]/25 bg-[#E95520]/10 p-3 text-[#F37A49] transition-colors group-hover:bg-[#E95520] group-hover:text-white">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      )}
      <h3 className="mt-6 text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
      <div className="mt-6 h-px w-full bg-slate-100" />
      <p className="mt-4 text-xs font-semibold uppercase text-[#F37A49]">Explore service</p>
    </Card>
  );
};

export default ServiceCard;
