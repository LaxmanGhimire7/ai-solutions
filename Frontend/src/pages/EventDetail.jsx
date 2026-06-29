import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarRange, Clock3, ExternalLink, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PageHero from '@/components/shared/PageHero';
import { events as sampleEvents } from '@/data/siteData';
import { usePublicContent, mergePublishedWithSamples } from '@/hooks/usePublicContent';
import { adaptEvent, adaptSampleEvent } from '@/utils/contentAdapters';

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const EventCoverImage = ({ src, title }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={title}
        className="aspect-[4/3] w-full bg-slate-100 object-cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="flex aspect-[4/3] items-center justify-center bg-[#F5ECE6] text-[#E95520]">
      <CalendarRange className="h-14 w-14" aria-hidden="true" />
    </div>
  );
};

const EventDetail = () => {
  const { eventId } = useParams();
  const { items: publishedEvents, isLoading } = usePublicContent('events', {
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

  const event = useMemo(
    () => events.find((item) => String(item.id) === String(eventId)),
    [eventId, events]
  );

  if (!isLoading && !event) {
    return <Navigate to="/events" replace />;
  }

  if (!event) {
    return (
      <section className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-white px-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-sm text-slate-500">
          Loading event details...
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Event Details"
        title={event.title}
        description={event.description}
        icon={CalendarRange}
        highlights={[
          event.type || 'Event',
          event.location || 'Location to be confirmed',
          formatDate(event.date),
        ]}
      >
        <Link to="/events">
          <Button variant="secondary" size="lg">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Events
          </Button>
        </Link>
      </PageHero>

      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <EventCoverImage src={event.coverImage} title={event.title} />
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-xl bg-white p-4">
                <CalendarRange className="mt-0.5 h-5 w-5 text-[#E95520]" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Date</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(event.date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white p-4">
                <Clock3 className="mt-0.5 h-5 w-5 text-[#E95520]" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Time</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{event.time || 'To be announced'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white p-4">
                <MapPin className="mt-0.5 h-5 w-5 text-[#E95520]" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Location</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{event.location}</p>
                </div>
              </div>
            </div>
          </aside>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.07)] md:p-10">
            <Badge variant={event.type === 'Upcoming' ? 'accent' : 'default'}>{event.type}</Badge>
            <h2 className="mt-5 text-3xl font-semibold text-slate-950">About this event</h2>
            <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-slate-600">
              {event.description}
            </p>

            {event.registrationUrl && (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#E95520] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C94316]"
              >
                Register for Event
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </article>
        </div>
      </section>
    </>
  );
};

export default EventDetail;
