import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Layers3 } from 'lucide-react';
import Button from '@/components/ui/Button';
import PageHero from '@/components/shared/PageHero';
import SectionHeading from '@/components/shared/SectionHeading';
import { services as sampleServices } from '@/data/siteData';
import { usePublicContent, mergePublishedWithSamples } from '@/hooks/usePublicContent';
import { adaptService } from '@/utils/contentAdapters';

const Services = () => {
  const { items: publishedServices } = usePublicContent('services', {
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    order: 'desc',
  });
  const services = useMemo(
    () =>
      mergePublishedWithSamples(
        publishedServices.map((service, index) => ({
          ...adaptService(service, index),
          icon: sampleServices[index % sampleServices.length]?.icon,
        })),
        sampleServices.map((service, index) => ({ ...service, id: `sample-${index}` })),
        (service) => service.title
      ),
    [publishedServices]
  );

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Digital systems designed around how your team works."
        description="Focused development for company content, inquiry handling, workflow support, and clear client communication."
        icon={Layers3}
        highlights={['Client-facing web applications', 'Practical workflow automation', 'Admin-friendly management tools']}
      >
        <Link to="/contact">
          <Button size="lg">
            Discuss a Service
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </PageHero>

      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Capabilities"
            title="A focused service offering"
            description="Each service is designed to be understandable, maintainable, and useful for a growing service organisation."
            align="center"
          />

          <div className="mt-16 space-y-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              const reversed = index % 2 === 1;

              return (
                <article
                  key={service.id || service.title}
                  className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)] lg:grid-cols-2"
                >
                  <div className={`relative min-h-[320px] overflow-hidden bg-slate-50 p-8 md:p-12 ${reversed ? 'lg:order-2' : ''}`}>
                    <div className="absolute -left-12 -top-10 h-40 w-64 rounded-2xl border border-indigo-100 bg-indigo-50" />
                    <div className="absolute -bottom-14 -right-12 h-48 w-72 rounded-2xl border border-slate-200 bg-white" />
                    <div className="relative flex h-full min-h-[240px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      {service.imageUrl ? (
                        <img
                          src={service.imageUrl}
                          alt={service.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                      <div className="text-center">
                        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                          <Icon className="h-8 w-8" aria-hidden="true" />
                        </span>
                        <p className="mt-5 text-xs font-semibold uppercase text-indigo-600">AI-Solutions capability</p>
                        <p className="mt-2 max-w-xs px-6 text-sm text-slate-500">{service.title}</p>
                      </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center p-8 md:p-12">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h2 className="mt-6 text-3xl font-semibold text-slate-950">{service.title}</h2>
                    <p className="mt-4 text-base leading-relaxed text-slate-600">{service.description}</p>
                    <ul className="mt-7 space-y-4">
                      {['Clear requirements collection', 'Responsive interface design', 'Admin-friendly content management'].map((item) => (
                        <li key={item} className="flex items-center gap-3 text-sm text-slate-600">
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-8 rounded-2xl border border-white/15 bg-[#111111] p-8 md:flex-row md:items-center md:p-10">
            <div>
              <h2 className="text-2xl font-semibold text-[#F5ECE6]">Not sure which service fits?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#A89D96]">
                Describe your challenge and the team can identify the most appropriate project direction.
              </p>
            </div>
            <Link to="/contact" className="shrink-0">
              <Button size="lg">Send Project Details</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
