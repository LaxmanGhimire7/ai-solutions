import { useMemo, useState } from 'react';
import { ArrowUpRight, CalendarDays, Newspaper, Search } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import PageHero from '@/components/shared/PageHero';
import SectionHeading from '@/components/shared/SectionHeading';
import { articles } from '@/data/siteData';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const Articles = () => {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const visibleArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return articles;
    return articles.filter((article) =>
      `${article.title} ${article.excerpt} ${article.content}`.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <>
      <PageHero
        eyebrow="Articles"
        title="Practical thinking for better client operations."
        description="Short, focused articles about client communication, inquiry management, admin reporting, and support workflows."
        icon={Newspaper}
        highlights={['Client communication guidance', 'Admin workflow insights', 'Rule-based support practices']}
      />

      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Insights"
            title="Latest articles"
            description="Browse concise guidance created for small service teams and web-based client systems."
            action={
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search articles"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  aria-label="Search articles"
                />
              </div>
            }
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleArticles.map((article, index) => (
              <button
                type="button"
                key={article.id}
                onClick={() => setSelected(article)}
                className={`text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  index === 0 && visibleArticles.length > 1 ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              >
                <Card hoverable className="group h-full overflow-hidden p-0">
                  <div className={`relative overflow-hidden border-b border-slate-100 bg-slate-50 ${index === 0 ? 'h-60' : 'h-48'}`}>
                    <div className="absolute -left-12 top-8 h-32 w-56 rounded-2xl border border-indigo-100 bg-indigo-50" />
                    <div className="absolute -right-10 bottom-6 h-28 w-48 rounded-2xl border border-slate-200 bg-white" />
                    <div className="relative flex h-full items-center justify-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                        <Newspaper className="h-7 w-7" aria-hidden="true" />
                      </span>
                    </div>
                    {index === 0 && (
                      <Badge variant="accent" className="absolute left-5 top-5 border border-indigo-100 bg-white">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between gap-4">
                      <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
                        <CalendarDays className="h-4 w-4" aria-hidden="true" />
                        {formatDate(article.date)}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-indigo-600" aria-hidden="true" />
                    </div>
                    <h2 className={`${index === 0 ? 'text-2xl' : 'text-lg'} mt-4 font-semibold text-slate-950`}>
                      {article.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-slate-500">{article.excerpt}</p>
                  </div>
                </Card>
              </button>
            ))}
          </div>

          {visibleArticles.length === 0 && (
            <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
              No articles match your search.
            </div>
          )}
        </div>
      </section>

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title}>
        {selected && (
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {formatDate(selected.date)}
            </p>
            <div className="my-5 h-px bg-slate-100" />
            <p className="text-sm leading-relaxed text-slate-600">{selected.content}</p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Articles;
