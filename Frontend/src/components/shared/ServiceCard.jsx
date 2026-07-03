import Card from '@/components/ui/Card';
import { getFallbackImage } from '@/data/siteData';

const ServiceCard = ({ icon: Icon, title, description, imageUrl }) => {
  const cardImage = imageUrl || getFallbackImage('services');

  return (
    <Card hoverable className="group h-full overflow-hidden p-0">
      <div className="relative h-40 overflow-hidden border-b border-slate-100 bg-slate-100">
        <img
          src={cardImage}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        {Icon && (
          <div className="absolute bottom-4 left-4 inline-flex rounded-xl border border-white/25 bg-black/50 p-3 text-white backdrop-blur-sm">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="p-6 md:p-8">
        {Icon && (
          <div className="inline-flex rounded-xl border border-[#E95520]/25 bg-[#E95520]/10 p-3 text-[#F37A49] transition-colors group-hover:bg-[#E95520] group-hover:text-white md:hidden">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        )}
        <h3 className="mt-1 text-lg font-semibold text-slate-950">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
        <div className="mt-6 h-px w-full bg-slate-100" />
        <p className="mt-4 text-xs font-semibold uppercase text-[#F37A49]">Explore service</p>
      </div>
    </Card>
  );
};

export default ServiceCard;
