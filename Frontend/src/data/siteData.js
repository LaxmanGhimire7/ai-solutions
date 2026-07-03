import {
  Bot,
  Code2,
  MessageSquare,
  Settings2,
} from 'lucide-react';

export const mediaAssets = {
  hero: '/images/orange-platform-hero.jpg',
  dashboard: '/images/inquiry-dashboard-studio.jpg',
  content: '/images/content-chat-studio.jpg',
};

export const fallbackImages = {
  services: [
    mediaAssets.content,
    mediaAssets.dashboard,
    mediaAssets.hero,
    mediaAssets.content,
  ],
  projects: [
    mediaAssets.dashboard,
    mediaAssets.content,
    mediaAssets.hero,
  ],
  articles: [
    mediaAssets.content,
    mediaAssets.dashboard,
    mediaAssets.hero,
  ],
  events: [
    mediaAssets.hero,
    mediaAssets.content,
    mediaAssets.dashboard,
  ],
  testimonials: [
    mediaAssets.dashboard,
    mediaAssets.content,
    mediaAssets.hero,
  ],
  gallery: [
    mediaAssets.hero,
    mediaAssets.dashboard,
    mediaAssets.content,
    mediaAssets.dashboard,
    mediaAssets.content,
    mediaAssets.hero,
    mediaAssets.content,
    mediaAssets.hero,
    mediaAssets.dashboard,
  ],
};

export const getFallbackImage = (type, index = 0) => {
  const images = fallbackImages[type] || [mediaAssets.hero];
  return images[index % images.length];
};

export const services = [
  {
    icon: Code2,
    title: 'Web Application Development',
    description: 'Responsive client portals and business systems designed around clear workflows.',
    imageUrl: getFallbackImage('services', 0),
  },
  {
    icon: Settings2,
    title: 'Process Automation',
    description: 'Practical automation for repeated tasks, enquiry handling, and internal operations.',
    imageUrl: getFallbackImage('services', 1),
  },
  {
    icon: MessageSquare,
    title: 'Client Interaction Systems',
    description: 'Contact, inquiry, chatbot, and admin tools that keep client communication organised.',
    imageUrl: getFallbackImage('services', 2),
  },
  {
    icon: Bot,
    title: 'Rule-Based Support Tools',
    description: 'Simple keyword-based help experiences for common questions and service guidance.',
    imageUrl: getFallbackImage('services', 3),
  },
];

export const projects = [
  {
    industry: 'Consulting',
    title: 'Client Inquiry Dashboard',
    description: 'A dashboard for reviewing inquiries, status updates, and weekly contact trends.',
    imageUrl: getFallbackImage('projects', 0),
  },
  {
    industry: 'Education',
    title: 'Event Registration Portal',
    description: 'A content-managed event area for upcoming workshops and past activity records.',
    imageUrl: getFallbackImage('projects', 1),
  },
  {
    industry: 'Services',
    title: 'Company Content System',
    description: 'A clean public website structure for services, case studies, articles, and testimonials.',
    imageUrl: getFallbackImage('projects', 2),
  },
];

export const testimonials = [
  {
    quote: 'The inquiry process became easier for our team to manage and follow up.',
    name: 'Nadia Rahman',
    company: 'BrightPath Consulting',
    rating: 5,
    avatarUrl: getFallbackImage('testimonials', 0),
  },
  {
    quote: 'The project gave us a clear way to present services and collect client details.',
    name: 'Tom Evans',
    company: 'Northbridge Studio',
    rating: 5,
    avatarUrl: getFallbackImage('testimonials', 1),
  },
  {
    quote: 'The dashboard made weekly enquiries much easier to understand.',
    name: 'Priya Shah',
    company: 'Civic Tech Lab',
    rating: 4,
    avatarUrl: getFallbackImage('testimonials', 2),
  },
];

export const articles = [
  {
    id: 1,
    date: '2026-02-12',
    title: 'Improving Client Communication With Structured Inquiry Forms',
    excerpt: 'A well-designed form helps teams collect useful details before the first conversation.',
    coverImage: getFallbackImage('articles', 0),
    content:
      'Structured inquiry forms reduce incomplete requests and help an admin team respond with context. The most useful fields capture contact details, organisation information, country, job title, and project requirements.',
  },
  {
    id: 2,
    date: '2026-03-04',
    title: 'Why Admin Dashboards Matter For Small Service Teams',
    excerpt: 'Dashboards turn incoming messages into trackable work instead of scattered emails.',
    coverImage: getFallbackImage('articles', 1),
    content:
      'A simple dashboard can show total inquiries, unread messages, weekly trends, and exportable records. For small service teams, this supports faster follow-up and better accountability.',
  },
  {
    id: 3,
    date: '2026-04-16',
    title: 'Using Rule-Based Chatbots For Common Questions',
    excerpt: 'Keyword-based chatbots are reliable for predictable questions and easy to explain.',
    coverImage: getFallbackImage('articles', 2),
    content:
      'Rule-based chatbots are suitable for services, pricing, events, demo scheduling, and job submission guidance. They avoid external AI dependencies while still improving user support.',
  },
];

export const events = [
  {
    title: 'Client Interaction Systems Workshop',
    date: '2026-06-18',
    time: '10:00 AM',
    location: 'Online',
    description: 'A practical workshop on inquiry handling and dashboard workflows.',
    type: 'Upcoming',
    coverImage: getFallbackImage('events', 0),
  },
  {
    title: 'Digital Service Operations Seminar',
    date: '2026-07-09',
    time: '2:00 PM',
    location: 'London',
    description: 'A seminar focused on client communication, content updates, and admin reporting.',
    type: 'Upcoming',
    coverImage: getFallbackImage('events', 1),
  },
  {
    title: 'Web Systems Showcase',
    date: '2026-02-20',
    time: '11:30 AM',
    location: 'Campus Hall',
    description: 'A showcase of web-based systems for local service businesses.',
    type: 'Past',
    coverImage: getFallbackImage('events', 2),
  },
];

export const gallery = Array.from({ length: 9 }).map((_, index) => ({
  id: index + 1,
  alt: `AI-Solutions event image ${index + 1}`,
  src: getFallbackImage('gallery', index),
}));
