import { getFallbackImage } from '@/data/siteData';
import { resolveMediaUrl } from './media';

const withFallbackImage = (value, type, index = 0) =>
  resolveMediaUrl(value) || getFallbackImage(type, index);

export const adaptService = (service, index = 0) => ({
  id: service._id,
  title: service.title,
  description: service.description,
  imageUrl: withFallbackImage(service.imageUrl, 'services', index),
  createdAt: service.createdAt,
});

export const adaptProject = (project, index = 0) => ({
  id: project._id,
  industry: project.industry || 'General',
  title: project.title,
  description: project.description,
  imageUrl: withFallbackImage(project.imageUrl, 'projects', index),
  createdAt: project.createdAt,
});

export const adaptArticle = (article, index = 0) => ({
  id: article._id,
  date: article.publishedAt || article.createdAt,
  title: article.title,
  excerpt: article.summary,
  content: article.content,
  coverImage: withFallbackImage(article.coverImage, 'articles', index),
  createdAt: article.createdAt,
});

export const adaptTestimonial = (testimonial, index = 0) => ({
  id: testimonial._id,
  quote: testimonial.quote,
  name: testimonial.authorName,
  company: [testimonial.authorTitle, testimonial.authorCompany].filter(Boolean).join(' · '),
  rating: testimonial.rating,
  avatarUrl: withFallbackImage(testimonial.authorAvatar, 'testimonials', index),
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
  coverImage: withFallbackImage(event.coverImage, 'events', index),
  registrationUrl: event.registrationUrl || '',
});

export const adaptEvent = (event, index = 0) => {
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
    coverImage: withFallbackImage(event.coverImage, 'events', index),
    registrationUrl: event.registrationUrl || '',
    endDate: event.endDate || null,
    createdAt: event.createdAt,
  };
};

export const adaptGalleryItem = (item, index = 0) => ({
  id: item._id,
  alt: item.title,
  src: withFallbackImage(item.imageUrl, 'gallery', index),
  description: item.description || '',
  category: item.category || 'general',
  createdAt: item.createdAt,
});
