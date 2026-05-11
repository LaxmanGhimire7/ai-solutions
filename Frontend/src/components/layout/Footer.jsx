import { Link } from 'react-router-dom';

const columns = [
  {
    title: 'Services',
    links: ['Web Applications', 'Automation', 'Consulting', 'Support'],
  },
  {
    title: 'Resources',
    links: ['Projects', 'Articles', 'Events', 'Gallery'],
  },
  {
    title: 'Contact',
    links: ['info@ai-solutions.com', '+44 1234 567890', 'Contact Form', 'Schedule Demo'],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-slate-100 bg-slate-50 py-12">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <Link to="/" className="text-lg font-semibold text-slate-900">
            AI-Solutions
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Web-based client interaction tools for service enquiries, company content, and admin management.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold text-slate-900">{column.title}</h3>
            <ul className="mt-4 space-y-3">
              {column.links.map((item) => (
                <li key={item}>
                  <a href="/contact" className="text-sm text-slate-500 hover:text-slate-900">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
