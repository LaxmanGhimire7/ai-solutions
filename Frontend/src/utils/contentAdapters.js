import { resolveMediaUrl } from './media';

export const adaptProject = (project) => ({
  id: project._id,
  industry: project.industry || 'General',
  title: project.title,
  description: project.description,
  imageUrl: resolveMediaUrl(project.imageUrl),
  createdAt: project.createdAt,
});

export const adaptArticle = (article) => ({
  id: article._id,
  date: article.publishedAt || article.createdAt,
  title: article.title,
  excerpt: article.summary,
  content: article.content,
  coverImage: resolveMediaUrl(article.coverImage),
  createdAt: article.createdAt,
});

export const adaptTestimonial = (testimonial) => ({
  id: testimonial._id,
  quote: testimonial.quote,
  name: testimonial.authorName,
  company: [testimonial.authorTitle, testimonial.authorCompany].filter(Boolean).join(' · '),
  rating: testimonial.rating,
  avatarUrl: resolveMediaUrl(testimonial.authorAvatar),
  createdAt: testimonial.createdAt,
});

export const getEventDetailId = (event, index = 0) => {
  if (event.id || event._id) return String(event.id || event._id);

  const titleSlug = String(event.title || 'event')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `sample-${index}-${titleSlug || 'event'}`;
};

export const adaptSampleEvent = (event, index) => ({
  ...event,
  id: getEventDetailId(event, index),
  coverImage: resolveMediaUrl(event.coverImage),
  registrationUrl: event.registrationUrl || '',
});

export const adaptEvent = (event) => {
  const eventDate = new Date(event.eventDate);
  const isUpcoming = eventDate.getTime() >= new Date().setHours(0, 0, 0, 0);

  return {
    id: event._id,
    title: event.title,
    date: event.eventDate,
    time: eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    location: event.location || (event.type === 'online' ? 'Online' : 'To be confirmed'),
    description: event.description,
    type: isUpcoming ? 'Upcoming' : 'Past',
    eventType: event.type || '',
    coverImage: resolveMediaUrl(event.coverImage),
    registrationUrl: event.registrationUrl || '',
    endDate: event.endDate || null,
    createdAt: event.createdAt,
  };
};

export const adaptGalleryItem = (item) => ({
  id: item._id,
  alt: item.title,
  src: resolveMediaUrl(item.imageUrl),
  description: item.description || '',
  category: item.category || 'general',
  createdAt: item.createdAt,
});
