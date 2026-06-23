import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import ServiceCard from '@/components/shared/ServiceCard';
import ProjectCard from '@/components/shared/ProjectCard';
import TestimonialCard from '@/components/shared/TestimonialCard';
import SectionHeading from '@/components/shared/SectionHeading';
import { projects, services, testimonials } from '@/data/siteData';

gsap.registerPlugin(ScrollTrigger);

const stackCards = [
  {
    eyebrow: 'Client inquiry management',
    title: 'Turn every enquiry into clear, trackable work.',
    description: 'Collect useful requirements, organise incoming requests, update statuses, and export records without relying on scattered email threads.',
    image: '/images/inquiry-dashboard-studio.png',
    tone: 'orange',
    features: [
      { icon: Clock3, value: '24/7', label: 'Inquiry capture' },
      { icon: ShieldCheck, value: 'JWT', label: 'Protected admin' },
      { icon: BarChart3, value: 'Live', label: 'Analytics view' },
    ],
  },
  {
    eyebrow: 'Content publishing',
    title: 'Keep services, articles, projects, and events current.',
    description: 'A focused admin workspace lets the team publish company content, upload images, and control what appears publicly.',
    image: '/images/content-chat-studio.png',
    tone: 'cream',
    features: [
      { icon: FileText, value: '6', label: 'Content types' },
      { icon: CheckCircle2, value: 'Fast', label: 'Publish workflow' },
      { icon: Sparkles, value: 'Clean', label: 'Public pages' },
    ],
  },
  {
    eyebrow: 'Support and insight',
    title: 'Help visitors quickly and understand what they need.',
    description: 'Rule-based support answers common questions while the dashboard reveals inquiry trends, service interest, and follow-up progress.',
    image: '/images/orange-platform-hero.png',
    tone: 'black',
    features: [
      { icon: MessageSquareText, value: 'FAQ', label: 'Rule-based help' },
      { icon: Headphones, value: 'Live', label: 'Support workspace' },
      { icon: BarChart3, value: 'CSV', label: 'Reporting tools' },
    ],
  },
];

const Home = () => {
  const stackRef = useRef(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const cards = gsap.utils.toArray('.stack-card');

      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          {
            y: 100,
            scale: 0.94,
            rotate: index % 2 === 0 ? -1.2 : 1.2,
          },
          {
            y: 0,
            scale: 1,
            rotate: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              end: 'top 22%',
              scrub: 1,
            },
          }
        );
      });
    }, stackRef);

    return () => context.revert();
  }, []);

  return (
    <>
      <section className="editorial-grid relative min-h-[calc(100vh-76px)] overflow-hidden bg-black">
        <div className="absolute inset-y-0 right-0 hidden w-[58%] lg:block">
          <img
            src="/images/orange-platform-hero.png"
            alt="AI-Solutions dashboard platform"
            className="h-full w-full object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            className="min-w-0 w-full max-w-4xl"
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 border border-[#E95520]/40 bg-[#E95520]/10 px-3 py-1.5 text-xs font-semibold uppercase text-[#F37A49]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Client interaction, rebuilt
            </div>

            <h1 className="mt-8 max-w-full break-words text-4xl font-semibold leading-[0.98] text-[#F5ECE6] sm:text-6xl md:text-8xl">
              Modern systems for
              <span className="block text-orange-gradient">better client work.</span>
            </h1>

            <p className="mt-8 max-w-full text-base leading-relaxed text-[#B3A8A1] sm:max-w-2xl md:text-lg">
              Present your services, capture useful project requirements, support visitors, and manage every inquiry from one professional platform.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/contact" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Start an Inquiry
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/projects" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Explore Projects
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="overflow-hidden border-y border-black/10 bg-[#F5ECE6] py-6 text-black">
        <motion.div
          className="flex w-max items-center gap-10 whitespace-nowrap text-3xl font-semibold uppercase md:text-5xl"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        >
          {[...Array(2)].map((_, group) => (
            <div key={group} className="flex items-center gap-10">
              {['Services', 'Inquiries', 'Analytics', 'Content', 'Support', 'Events'].map((item) => (
                <span key={`${group}-${item}`} className="flex items-center gap-10">
                  {item}
                  <span className="h-3 w-3 rounded-full bg-[#E95520]" />
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </section>

      <section id="platform" ref={stackRef} className="bg-[#F5ECE6] px-4 py-20 text-black sm:px-6 md:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="One connected platform"
            title="From first visit to confident follow-up."
            description="Three focused experiences work together to present the company, support customers, and give administrators clear control."
            align="center"
          />

          <div className="mt-16 space-y-12 pb-10">
            {stackCards.map((card, index) => {
              const isOrange = card.tone === 'orange';
              const isBlack = card.tone === 'black';
              const textColor = isOrange || isBlack ? 'text-white' : 'text-black';
              const mutedColor = isOrange ? 'text-orange-100/75' : isBlack ? 'text-[#A89D96]' : 'text-[#625952]';

              return (
                <article
                  key={card.title}
                  className={`stack-card overflow-hidden rounded-[28px] border md:sticky ${
                    isOrange
                      ? 'border-[#E95520] bg-[#E95520]'
                      : isBlack
                        ? 'border-black bg-black'
                        : 'border-black/15 bg-[#FFFDFC]'
                  }`}
                  style={{ top: `${104 + index * 18}px`, zIndex: index + 1 }}
                >
                  <div className={`grid min-h-[520px] items-center gap-10 p-7 md:p-12 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:[&>div:first-child]:order-2' : ''}`}>
                    <div>
                      <p className={`text-xs font-semibold uppercase ${isOrange ? 'text-white/70' : 'text-[#E95520]'}`}>
                        {card.eyebrow}
                      </p>
                      <h2 className={`mt-5 text-4xl font-semibold leading-tight md:text-5xl ${textColor}`}>{card.title}</h2>
                      <p className={`mt-5 max-w-xl text-base leading-relaxed ${mutedColor}`}>{card.description}</p>

                      <div className="mt-9 grid gap-3 sm:grid-cols-3">
                        {card.features.map((feature) => {
                          const Icon = feature.icon;
                          return (
                            <div
                              key={feature.label}
                              className={`flex items-center gap-3 rounded-xl border p-3 ${
                                isOrange
                                  ? 'border-white/20 bg-white/10'
                                  : isBlack
                                    ? 'border-white/15 bg-white/[0.05]'
                                    : 'border-black/10 bg-black/[0.035]'
                              }`}
                            >
                              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                isOrange ? 'bg-white text-[#E95520]' : 'bg-[#E95520] text-white'
                              }`}>
                                <Icon className="h-5 w-5" aria-hidden="true" />
                              </span>
                              <div>
                                <p className={`text-sm font-semibold ${textColor}`}>{feature.value}</p>
                                <p className={`text-xs ${mutedColor}`}>{feature.label}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-black/15 bg-black">
                      <img src={card.image} alt="" className="aspect-[4/3] h-full w-full object-cover" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-black py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            dark
            eyebrow="Impact"
            title="How AI-Solutions helps teams work faster and better."
            description="Focused project examples that show the system supporting communication, content, and daily administration."
            align="center"
          />

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F5ECE6] py-20 text-black md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Capabilities"
            title="Professional tools without unnecessary complexity."
            description="Each service is intentionally focused, easy to explain, and suitable for a final-year product development project."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            dark
            eyebrow="Customer feedback"
            title="Clear systems create more confident service."
            description="Example testimonials showing how structured communication helps client-facing teams."
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      <section className="orange-grid bg-[#E95520] px-4 py-20 text-white sm:px-6 md:py-28 lg:px-8">
        <motion.div
          className="mx-auto max-w-6xl text-center"
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65 }}
        >
          <p className="text-xs font-semibold uppercase text-white/65">Ready to begin?</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-7xl">Make the next client conversation easier.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-orange-100/80">
            Send your project requirements and let the team review the best direction for your system.
          </p>
          <div className="mt-9 flex justify-center">
            <Link to="/contact">
              <button className="inline-flex items-center gap-2 rounded-lg bg-black px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-1">
                Contact AI-Solutions
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Home;
