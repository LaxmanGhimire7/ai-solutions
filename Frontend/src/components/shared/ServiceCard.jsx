import Card from '@/components/ui/Card';

const ServiceCard = ({ icon: Icon, title, description }) => {
  return (
    <Card hoverable>
      {Icon && <Icon className="h-8 w-8 text-indigo-500" aria-hidden="true" />}
      <h3 className="mt-6 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
    </Card>
  );
};

export default ServiceCard;
