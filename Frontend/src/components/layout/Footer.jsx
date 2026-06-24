import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

const columns = [
  {
    title: 'Explore',
    links: [
      { label: 'Services', to: '/services' },
      { label: 'Projects', to: '/projects' },
      { label: 'Articles', to: '/articles' },
      { label: 'Events', to: '/events' },
      { label: 'Reviews', to: '/testimonials' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Gallery', to: '/gallery' },
      { label: 'Contact', to: '/contact' },
      { label: 'Admin Login', to: '/admin/login' },
      { label: 'Submit Inquiry', to: '/contact' },
    ],
  },
];

const Footer = () => {
  const wordmarkRef = useRef(null);

  const updateWordmarkPosition = (event) => {
    const element = wordmarkRef.current;
    if (!element) return;

    const bounds = element.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - bounds.left, bounds.width));
    const y = Math.max(0, Math.min(event.clientY - bounds.top, bounds.height));

    element.style.setProperty('--wordmark-x', `${x}px`);
    element.style.setProperty('--wordmark-y', `${y}px`);
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black pb-12 pt-16">
      <div className="relative z-10 flex h-[14vw] min-h-[100px] max-h-[250px] items-center justify-center overflow-visible px-4">
        <Link
          ref={wordmarkRef}
          to="/"
          onPointerEnter={updateWordmarkPosition}
          onPointerMove={updateWordmarkPosition}
          className="footer-wordmark relative block whitespace-nowrap text-[15vw] font-semibold leading-none"
          aria-label="AI-Solutions home"
        >
          <span className="footer-wordmark-outline">AI-Solutions</span>
          <span className="footer-wordmark-reveal" aria-hidden="true">AI-Solutions</span>
        </Link>
      </div>

      <div className="relative z-20 mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr]">
          <div>
            <Link to="/" className="flex items-center gap-3 text-xl font-semibold text-[#F5ECE6]">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E95520] text-sm text-white">AI</span>
              AI-Solutions
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#8F847D]">
              Building clearer client experiences through modern web systems, structured communication, and useful admin insight.
            </p>
            <div className="mt-7 flex gap-3">
              {[Instagram, Linkedin, Mail].map((Icon, index) => (
                <span key={index} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-[#F5ECE6]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold uppercase text-[#F5ECE6]">{column.title}</h3>
              <ul className="mt-5 space-y-4">
                {column.links.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-sm text-[#8F847D] transition-colors hover:text-[#F37A49]">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-semibold uppercase text-[#F5ECE6]">Contact</h3>
            <div className="mt-5 space-y-4 text-sm text-[#8F847D]">
              <p className="flex gap-3"><Mail className="h-4 w-4 shrink-0 text-[#E95520]" />info@ai-solutions.com</p>
              <p className="flex gap-3"><Phone className="h-4 w-4 shrink-0 text-[#E95520]" />+44 1234 567890</p>
              <p className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 text-[#E95520]" />London, United Kingdom</p>
            </div>
            <Link
              to="/contact"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#E95520] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C94316]"
            >
              Start a Project
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-white/10 pt-7 text-xs text-[#675F5A] md:flex-row">
          <span>&copy; {new Date().getFullYear()} AI-Solutions. All rights reserved.</span>
          <span>Web-based Client Interaction System</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
