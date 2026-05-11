import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ServiceCard from '@/components/shared/ServiceCard';
import ProjectCard from '@/components/shared/ProjectCard';
import TestimonialCard from '@/components/shared/TestimonialCard';
import { projects, services, testimonials } from '@/data/siteData';

const Home = () => {
  return (
    <>
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-indigo-600">Client Interaction System</p>
            <h1 className="mt-5 text-5xl font-bold tracking-tight text-slate-900 md:text-7xl">
              AI-Solutions
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600">
              A professional web system for presenting company services, collecting client inquiries, and helping admins manage communication clearly.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/contact">
                <Button size="lg" className="w-full sm:w-auto">
                  Start an Inquiry
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  View Projects
                </Button>
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
            <div className="aspect-[4/3] rounded-xl bg-slate-100" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50 py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:px-6 md:grid-cols-5 lg:px-8">
          {['Northbridge', 'BrightPath', 'Civic Lab', 'TechWorks', 'ServiceCo'].map((logo) => (
            <div key={logo} className="flex h-14 items-center justify-center rounded-xl bg-white text-sm font-medium text-slate-400">
              {logo}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">Services</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Practical digital services for companies that need clearer client communication and workflow support.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">Projects</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Case-study examples showing how structured content and inquiry handling support service teams.
              </p>
            </div>
            <Link to="/projects">
              <Button variant="secondary">All Projects</Button>
            </Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">Testimonials</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Feedback from example clients using service communication and admin workflow tools.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">Ready to discuss your project?</h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
                Send your requirements through the contact form and the team will review your inquiry.
              </p>
            </div>
            <Link to="/contact">
              <Button size="lg">Contact Us</Button>
            </Link>
          </Card>
        </div>
      </section>
    </>
  );
};

export default Home;
