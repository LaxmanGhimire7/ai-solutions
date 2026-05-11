import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

const ProjectCard = ({ industry, title, description, imageUrl }) => {
  return (
    <Card hoverable className="overflow-hidden p-0">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="h-48 w-full object-cover" />
      ) : (
        <div className="h-48 bg-slate-100" aria-hidden="true" />
      )}
      <div className="p-6">
        <Badge variant="accent">{industry}</Badge>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
    </Card>
  );
};

export default ProjectCard;
