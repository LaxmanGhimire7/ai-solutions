import { useMemo, useState } from 'react';
import { CalendarRange } from 'lucide-react';
import EventCard from '@/components/shared/EventCard';
import PageHero from '@/components/shared/PageHero';
import SectionHeading from '@/components/shared/SectionHeading';
import { events as sampleEvents } from '@/data/siteData';
import { usePublicContent, mergePublishedWithSamples } from '@/hooks/usePublicContent';
import { adaptEvent, adaptSampleEvent } from '@/utils/contentAdapters';

const Events = () => {
  const [tab, setTab] = useState('Upcoming');
  const { items: publishedEvents } = usePublicContent('events', {
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    order: 'desc',
  });
  const events = useMemo(
    () =>
      mergePublishedWithSamples(
        publishedEvents.map(adaptEvent),
        sampleEvents.map(adaptSampleEvent),
        (event) => event.title
      ),
    [publishedEvents]
  );
  const visibleEvents = useMemo(
    () => events.filter((event) => event.type === tab),
    [events, tab]
  );

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Workshops and sessions for practical digital progress."
        description="Discover upcoming and past events focused on client communication, web systems, and service operations."
        icon={CalendarRange}
        highlights={['Focused digital workshops', 'Client-facing demonstrations', 'Past event archive']}
      />

      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Event schedule"
            title="Explore company events"
            description="Switch between upcoming sessions and the archive of completed activities."
          />

          <div className="mt-10 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {['Upcoming', 'Past'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                aria-pressed={tab === item}
                className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  tab === item ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-10 space-y-5">
            {visibleEvents.map((event) => (
              <EventCard key={event.id || event.title} {...event} to={`/events/${event.id}`} />
            ))}
          </div>

          {visibleEvents.length === 0 && (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
              No {tab.toLowerCase()} events are currently available.
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Events;
