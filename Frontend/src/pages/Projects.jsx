import { useMemo, useState } from 'react';
import { BriefcaseBusiness, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import ProjectCard from '@/components/shared/ProjectCard';
import PageHero from '@/components/shared/PageHero';
import SectionHeading from '@/components/shared/SectionHeading';
import { projects as sampleProjects } from '@/data/siteData';
import { usePublicContent, mergePublishedWithSamples } from '@/hooks/usePublicContent';
import { adaptProject } from '@/utils/contentAdapters';

const Projects = () => {
  const [active, setActive] = useState('All');
  const [search, setSearch] = useState('');
  const { items: publishedProjects } = usePublicContent('projects', {
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    order: 'desc',
  });
  const projects = useMemo(
    () =>
      mergePublishedWithSamples(
        publishedProjects.map(adaptProject),
        sampleProjects.map((project, index) => ({ ...project, id: `sample-${index}` })),
        (project) => project.title
      ),
    [publishedProjects]
  );
  const filters = ['All', ...new Set(projects.map((project) => project.industry))];

  const visibleProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesFilter = active === 'All' || project.industry === active;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        `${project.title} ${project.description} ${project.industry}`.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [active, projects, search]);

  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="Case studies built around real service workflows."
        description="Explore example systems for client inquiries, company content, events, and administrative reporting."
        icon={BriefcaseBusiness}
        highlights={['Client inquiry dashboards', 'Content-managed company websites', 'Event and communication portals']}
      />

      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Project library"
            title="Browse our work"
            description="Filter the project examples by industry or search for a specific workflow."
          />

          <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
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

            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                aria-label="Search projects"
              />
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.id || project.title} {...project} />
            ))}
          </div>

          {visibleProjects.length === 0 && (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <p className="text-sm font-medium text-slate-600">No projects match your search.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Projects;
