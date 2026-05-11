import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { articles } from '@/data/siteData';

const Articles = () => {
  const [selected, setSelected] = useState(null);

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge variant="accent">Articles</Badge>
          <h1 className="mt-5 text-5xl font-bold tracking-tight text-slate-900 md:text-7xl">Promotional Articles</h1>
          <p className="mt-6 text-base leading-relaxed text-slate-600">
            Short articles about client communication, inquiry management, and support workflows.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {articles.map((article) => (
            <button
              type="button"
              key={article.id}
              onClick={() => setSelected(article)}
              className="text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <Card hoverable className="h-full p-0">
                <div className="h-44 rounded-t-2xl bg-slate-100" aria-hidden="true" />
                <div className="p-6">
                  <p className="text-sm font-medium text-slate-400">
                    {new Date(article.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  <h2 className="mt-3 text-lg font-semibold text-slate-900">{article.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">{article.excerpt}</p>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title}>
        <p className="text-sm leading-relaxed text-slate-600">{selected?.content}</p>
      </Modal>
    </section>
  );
};

export default Articles;
