/**
 * Rule-based chatbot service.
 * Matches user messages against keyword rules and returns pre-defined answers.
 * No ML — purely deterministic for reliability and speed.
 */

const FAQ_RULES = [
  {
    id: 'services',
    keywords: ['service', 'services', 'offer', 'provide', 'do you', 'what can', 'solutions', 'help'],
    question: 'What services do you offer?',
    answer:
      'AI-Solutions offers four core services:\n\n' +
      '• **AI Virtual Assistant** — Intelligent chatbots and voice assistants tailored to your business\n' +
      '• **Rapid Prototyping** — From concept to working prototype in weeks\n' +
      '• **Digital Employee Experience** — AI-powered internal tools to boost team productivity\n' +
      '• **Custom AI Solutions** — Bespoke machine learning and automation solutions\n\n' +
      'Would you like to know more about any of these?',
  },
  {
    id: 'contact',
    keywords: ['contact', 'reach', 'email', 'phone', 'get in touch', 'speak', 'talk', 'call', 'message'],
    question: 'How can I contact AI-Solutions?',
    answer:
      'You can reach us through our **Contact page** where you can fill in a short inquiry form. ' +
      'Our team typically responds within 1 business day.\n\n' +
      'Alternatively, you can use this live chat to connect with a support agent right now!',
  },
  {
    id: 'pricing',
    keywords: ['price', 'pricing', 'cost', 'how much', 'fee', 'charge', 'rate', 'budget', 'affordable'],
    question: 'How much do your services cost?',
    answer:
      'Our pricing is tailored to each project\'s scope and requirements — there\'s no one-size-fits-all rate.\n\n' +
      'The best way to get an accurate quote is to **submit an inquiry** via our Contact page. ' +
      'We\'ll review your needs and provide a detailed proposal within 2 business days.',
  },
  {
    id: 'timeline',
    keywords: ['timeline', 'how long', 'duration', 'time', 'deadline', 'delivery', 'turnaround', 'fast', 'quick'],
    question: 'How long does a project take?',
    answer:
      'Project timelines depend on complexity:\n\n' +
      '• **AI Virtual Assistant** — 4–8 weeks\n' +
      '• **Rapid Prototyping** — 2–4 weeks\n' +
      '• **Digital Employee Experience** — 6–12 weeks\n' +
      '• **Custom AI Solutions** — 8–16 weeks\n\n' +
      'We\'ll give you a more precise timeline after reviewing your specific requirements.',
  },
  {
    id: 'about',
    keywords: ['about', 'who are', 'company', 'team', 'background', 'experience', 'founded', 'history'],
    question: 'Who is AI-Solutions?',
    answer:
      'AI-Solutions is a modern technology company specialising in artificial intelligence and automation. ' +
      'We help businesses of all sizes integrate AI into their workflows — from customer-facing chatbots ' +
      'to internal productivity tools.\n\n' +
      'Our team brings together expertise in machine learning, software engineering, and UX design ' +
      'to deliver solutions that are both powerful and easy to use.',
  },
  {
    id: 'process',
    keywords: ['process', 'how does it work', 'steps', 'start', 'begin', 'get started', 'onboard', 'next steps'],
    question: 'How does the process work?',
    answer:
      'Our engagement process is simple:\n\n' +
      '1. **Inquiry** — Fill in our contact form with your project details\n' +
      '2. **Discovery call** — We discuss your goals and requirements\n' +
      '3. **Proposal** — We send a detailed scope and timeline\n' +
      '4. **Build** — Our team designs, develops, and tests your solution\n' +
      '5. **Deliver** — We hand over the product with full documentation and support\n\n' +
      'Ready to start? Hit the **Contact Us** button!',
  },
  {
    id: 'support',
    keywords: ['support', 'maintenance', 'after', 'post', 'warranty', 'bug', 'issue', 'problem', 'help after'],
    question: 'Do you provide post-delivery support?',
    answer:
      'Yes! Every project includes a **30-day post-delivery support period** at no extra cost. ' +
      'After that, we offer flexible maintenance packages — monthly retainers or pay-per-incident.\n\n' +
      'You\'ll never be left on your own after launch.',
  },
  {
    id: 'technologies',
    keywords: ['technology', 'tech', 'stack', 'language', 'framework', 'platform', 'tools', 'built with'],
    question: 'What technologies do you use?',
    answer:
      'We work with modern, battle-tested technologies:\n\n' +
      '• **AI/ML** — OpenAI, Hugging Face, TensorFlow, PyTorch\n' +
      '• **Backend** — Node.js, Python, FastAPI\n' +
      '• **Frontend** — React, Next.js, Tailwind CSS\n' +
      '• **Cloud** — AWS, Google Cloud, Azure\n' +
      '• **Database** — MongoDB, PostgreSQL, Pinecone\n\n' +
      'We choose the right tool for each job, not just the trendy one.',
  },
];

const DEFAULT_RESPONSE = {
  answer:
    'Thanks for your message! I\'m not sure I have a specific answer for that.\n\n' +
    'Here are some things I can help with:\n' +
    '• Our **services** and what we offer\n' +
    '• **Pricing** information\n' +
    '• Project **timelines**\n' +
    '• How to **get started**\n' +
    '• **Support** after delivery\n\n' +
    'Or you can connect with a live agent by typing **"talk to agent"**.',
  matched: false,
};

class ChatbotService {
  /**
   * Process a user message and return a rule-based response.
   * @param {string} message
   * @returns {{ answer: string, matched: boolean, ruleId: string|null, suggestions: string[] }}
   */
  getResponse(message) {
    if (!message || typeof message !== 'string') {
      return { ...DEFAULT_RESPONSE, ruleId: null, suggestions: this._getTopSuggestions() };
    }

    const normalised = message.toLowerCase().trim();

    // Check for live agent request
    if (['agent', 'human', 'person', 'live', 'real person', 'talk to agent'].some((kw) => normalised.includes(kw))) {
      return {
        answer:
          '👋 Connecting you to a live support agent! Please wait a moment.\n\n' +
          'If no agent is available, leave your email via the **Contact form** and we\'ll get back to you shortly.',
        matched: true,
        ruleId: 'live_agent',
        suggestions: [],
        escalate: true, // Signal to frontend to open live chat
      };
    }

    // Match against rules
    for (const rule of FAQ_RULES) {
      if (rule.keywords.some((kw) => normalised.includes(kw))) {
        return {
          answer: rule.answer,
          matched: true,
          ruleId: rule.id,
          suggestions: this._getRelatedSuggestions(rule.id),
        };
      }
    }

    return {
      ...DEFAULT_RESPONSE,
      ruleId: null,
      suggestions: this._getTopSuggestions(),
    };
  }

  /**
   * Return all available FAQ questions (for a "quick replies" UI).
   */
  getFaqs() {
    return FAQ_RULES.map(({ id, question }) => ({ id, question }));
  }

  _getTopSuggestions() {
    return FAQ_RULES.slice(0, 4).map((r) => r.question);
  }

  _getRelatedSuggestions(currentRuleId) {
    return FAQ_RULES.filter((r) => r.id !== currentRuleId)
      .slice(0, 3)
      .map((r) => r.question);
  }
}

module.exports = new ChatbotService(); // Singleton — stateless, safe to share
