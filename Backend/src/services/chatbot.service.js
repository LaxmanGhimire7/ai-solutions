const FAQ_RULES = [
  {
    id: 'services',
    keywords: ['service', 'services', 'offer', 'provide', 'solution', 'solutions'],
    question: 'What services do you offer?',
    answer:
      'AI-Solutions provides software development, web application support, automation guidance, and client-focused technology solutions. Please submit your job details through the contact form so our team can recommend the best service.',
  },
  {
    id: 'pricing',
    keywords: ['cost', 'price', 'pricing', 'fee', 'charge', 'budget', 'quote'],
    question: 'How much does a project cost?',
    answer:
      'Project cost depends on the scope, timeline, and technical requirements. Please submit your job details through the contact form and our team will review them before providing a quotation.',
  },
  {
    id: 'events',
    keywords: ['event', 'events', 'upcoming', 'seminar', 'workshop', 'webinar'],
    question: 'Do you have upcoming events?',
    answer:
      'Upcoming events are listed on the events section of the website. You can check that page for dates, locations, and registration details.',
  },
  {
    id: 'demo',
    keywords: ['demo', 'schedule', 'meeting', 'appointment', 'consultation', 'call'],
    question: 'How can I schedule a demo?',
    answer:
      'To schedule a demo, please submit the contact form with your company name, job title, and project details. Our team will contact you to arrange a suitable time.',
  },
  {
    id: 'job_submission',
    keywords: ['job', 'submit', 'submission', 'project', 'requirement', 'requirements', 'details'],
    question: 'How do I submit a job request?',
    answer:
      'You can submit a job request through the Contact Us form by providing your name, email, phone number, company name, country, job title, and job details.',
  },
];

const FALLBACK_ANSWER = 'Please contact our support team for more details.';

class ChatbotService {
  getResponse(message) {
    if (!message || typeof message !== 'string') {
      return { answer: FALLBACK_ANSWER, matched: false, ruleId: null };
    }

    const normalised = message.toLowerCase().trim();
    const rule = FAQ_RULES.find((item) =>
      item.keywords.some((keyword) => normalised.includes(keyword))
    );

    if (!rule) {
      return { answer: FALLBACK_ANSWER, matched: false, ruleId: null };
    }

    return {
      answer: rule.answer,
      matched: true,
      ruleId: rule.id,
    };
  }

  getFaqs() {
    return FAQ_RULES.map(({ id, question }) => ({ id, question }));
  }
}

module.exports = new ChatbotService();
