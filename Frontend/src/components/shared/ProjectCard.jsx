import { ArrowUpRight, PanelsTopLeft } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

const ProjectCard = ({ industry, title, description, imageUrl }) => {
  return (
    <Card hoverable className="group overflow-hidden p-0">
      <div className="relative h-52 overflow-hidden border-b border-slate-100 bg-slate-50 p-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="relative flex h-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="absolute -left-8 -top-8 h-24 w-36 rounded-xl border border-[#E95520]/20 bg-[#E95520]/10" />
            <div className="absolute -bottom-8 -right-8 h-28 w-40 rounded-xl border border-slate-200 bg-slate-50" />
            <div className="relative flex flex-col items-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E95520] text-white">
                <PanelsTopLeft className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="mt-3 text-xs font-semibold uppercase text-slate-400">Project system</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="accent">{industry}</Badge>
          <ArrowUpRight
            className="h-4 w-4 text-slate-400 transition-colors group-hover:text-[#F37A49]"
            aria-hidden="true"
          />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
    </Card>
  );
};

export default ProjectCard;
