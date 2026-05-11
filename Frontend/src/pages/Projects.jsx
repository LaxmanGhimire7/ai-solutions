import { useMemo, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ProjectCard from '@/components/shared/ProjectCard';
import { projects } from '@/data/siteData';

const Projects = () => {
  const [active, setActive] = useState('All');
  const filters = ['All', ...new Set(projects.map((project) => project.industry))];
  const visibleProjects = useMemo(
    () => (active === 'All' ? projects : projects.filter((project) => project.industry === active)),
    [active]
  );

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge variant="accent">Projects</Badge>
          <h1 className="mt-5 text-5xl font-bold tracking-tight text-slate-900 md:text-7xl">Case Studies</h1>
          <p className="mt-6 text-base leading-relaxed text-slate-600">
            Example project records for service teams, dashboards, and content management.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={active === filter ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActive(filter)}
              aria-pressed={active === filter}
            >
              {filter}
            </Button>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
