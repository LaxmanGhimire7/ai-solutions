import { services } from '@/data/siteData';
import Badge from '@/components/ui/Badge';

const Services = () => {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge variant="accent">Services</Badge>
          <h1 className="mt-5 text-5xl font-bold tracking-tight text-slate-900 md:text-7xl">Company Services</h1>
          <p className="mt-6 text-base leading-relaxed text-slate-600">
            Focused digital services for company content, inquiry handling, and admin workflows.
          </p>
        </div>

        <div className="mt-16 space-y-16">
          {services.map((service, index) => {
            const Icon = service.icon;
            const reversed = index % 2 === 1;

            return (
              <div
                key={service.title}
                className={`grid items-center gap-10 lg:grid-cols-2 ${reversed ? 'lg:[&>div:first-child]:order-2' : ''}`}
              >
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
                  <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-slate-100">
                    <Icon className="h-12 w-12 text-indigo-500" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <Icon className="h-8 w-8 text-indigo-500" aria-hidden="true" />
                  <h2 className="mt-5 text-3xl font-semibold text-slate-900 md:text-4xl">{service.title}</h2>
                  <p className="mt-4 text-base leading-relaxed text-slate-600">{service.description}</p>
                  <ul className="mt-6 space-y-3 text-sm text-slate-500">
                    <li>Clear requirements collection</li>
                    <li>Responsive interface design</li>
                    <li>Admin-friendly content management</li>
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
