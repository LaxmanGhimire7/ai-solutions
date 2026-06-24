import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  CheckCheck,
  Headphones,
  MessageCircle,
  Send,
  Star,
  UserRound,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { sendMessage as sendFaqMessage } from '@/api/chatbot';
import {
  connectCustomer,
  disconnectSocket,
  onChatEvent,
  sendCustomerMessage,
  startCustomerChat,
  submitChatRating,
} from '@/api/chat';

const SESSION_KEY = 'ai_solutions_chat_session';
const PROFILE_KEY = 'ai_solutions_chat_profile';

const quickQuestions = [
  'What services do you offer?',
  'How much does a project cost?',
  'Do you have upcoming events?',
  'How can I schedule a demo?',
  'How do I submit a job request?',
];

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('faq');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [supportOnline, setSupportOnline] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isRating, setIsRating] = useState(false);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SESSION_KEY) || '');
  const [sessionStatus, setSessionStatus] = useState('active');
  const [sessionRating, setSessionRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : { customerName: '', customerEmail: '' };
  });
  const [profileForm, setProfileForm] = useState(profile);
  const [faqMessages, setFaqMessages] = useState([
    {
      sender: 'bot',
      content: 'Hello. Ask me about services, pricing, events, demos, or job submissions.',
    },
  ]);
  const [liveMessages, setLiveMessages] = useState([]);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const resumeStartedRef = useRef(false);

  const messages = mode === 'faq' ? faqMessages : liveMessages;
  const canSend = useMemo(
    () =>
      input.trim().length > 0 &&
      !isLoading &&
      (mode === 'faq' || (Boolean(sessionId) && sessionStatus === 'active')),
    [input, isLoading, mode, sessionId, sessionStatus]
  );

  const beginLiveSession = async (nextProfile, existingSessionId = sessionId) => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      const response = await startCustomerChat({
        ...nextProfile,
        sessionId: existingSessionId || undefined,
      });
      const id = String(response.sessionId);
      const session = response.session;
      setSessionId(id);
      setSessionStatus(session.status || 'active');
      setSessionRating(session.rating || null);
      setRating(session.rating || 0);
      setRatingComment(session.ratingComment || '');
      setSupportOnline(Boolean(response.supportOnline));
      setLiveMessages(session.messages || []);
      setProfile(nextProfile);
      setProfileForm(nextProfile);
      localStorage.setItem(SESSION_KEY, id);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
    } catch (error) {
      setLiveMessages((current) => [
        ...current,
        {
          sender: 'admin',
          content: error.message || 'Live support is temporarily unavailable.',
          createdAt: new Date().toISOString(),
          system: true,
        },
      ]);
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    if (!isOpen || mode !== 'live') return undefined;

    const socket = connectCustomer();
    const handleConnect = () => {
      setIsConnected(true);
      if (sessionId && profile.customerName && !resumeStartedRef.current) {
        resumeStartedRef.current = true;
        beginLiveSession(profile, sessionId).finally(() => {
          resumeStartedRef.current = false;
        });
      }
    };
    const cleanup = [
      onChatEvent('connect', handleConnect, null),
      onChatEvent('disconnect', () => setIsConnected(false), null),
      onChatEvent('support_presence', ({ online }) => {
        setSupportOnline(Boolean(online));
      }, null),
      onChatEvent('admin_reply', (payload) => {
        if (String(payload.sessionId) !== String(sessionId)) return;
        setLiveMessages((current) => [...current, payload.message]);
      }, null),
      onChatEvent('chat_status', (payload) => {
        if (String(payload.sessionId) === String(sessionId)) {
          setSessionStatus(payload.status);
        }
      }, null),
      onChatEvent('chat_deleted', (payload) => {
        if (String(payload.sessionId) !== String(sessionId)) return;
        localStorage.removeItem(SESSION_KEY);
        setSessionId('');
        setSessionStatus('active');
        setSessionRating(null);
        setRating(0);
        setRatingComment('');
        setLiveMessages([]);
      }, null),
      onChatEvent('support_error', ({ message: errorMessage }) => {
        if (!errorMessage) return;
        setLiveMessages((current) => [
          ...current,
          {
            sender: 'admin',
            content: errorMessage,
            createdAt: new Date().toISOString(),
            system: true,
          },
        ]);
      }, null),
    ];

    if (socket.connected) handleConnect();

    return () => {
      cleanup.forEach((off) => off());
      disconnectSocket();
      setIsConnected(false);
    };
  }, [isOpen, mode, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  const openWidget = () => {
    setIsOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 100);
  };

  const submitFaq = async (cleanMessage) => {
    setFaqMessages((current) => [...current, { sender: 'user', content: cleanMessage }]);
    const response = await sendFaqMessage(cleanMessage);
    setFaqMessages((current) => [
      ...current,
      {
        sender: 'bot',
        content: response.data?.answer || 'Please contact our support team for more details.',
      },
    ]);
  };

  const submitLive = async (cleanMessage) => {
    const response = await sendCustomerMessage({ sessionId, content: cleanMessage });
    setLiveMessages((current) => [
      ...current,
      response.message,
      ...(response.autoReply ? [response.autoReply] : []),
    ]);
  };

  const submitMessage = async (messageText = input) => {
    const cleanMessage = messageText.trim();
    if (!cleanMessage || isLoading) return;

    setInput('');
    setIsLoading(true);
    try {
      if (mode === 'faq') {
        await submitFaq(cleanMessage);
      } else {
        await submitLive(cleanMessage);
      }
    } catch (error) {
      const fallback = error.message || 'Please contact our support team for more details.';
      if (mode === 'faq') {
        setFaqMessages((current) => [...current, { sender: 'bot', content: fallback }]);
      } else {
        setLiveMessages((current) => [
          ...current,
          { sender: 'admin', content: fallback, createdAt: new Date().toISOString(), system: true },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLive = (event) => {
    event.preventDefault();
    const nextProfile = {
      customerName: profileForm.customerName.trim(),
      customerEmail: profileForm.customerEmail.trim().toLowerCase(),
    };
    if (!nextProfile.customerName || !nextProfile.customerEmail) return;
    beginLiveSession(nextProfile, '');
  };

  const startNewConversation = () => {
    localStorage.removeItem(SESSION_KEY);
    setSessionId('');
    setSessionStatus('active');
    setSessionRating(null);
    setRating(0);
    setRatingComment('');
    setLiveMessages([]);
    resumeStartedRef.current = false;
  };

  const handleRatingSubmit = async (event) => {
    event.preventDefault();
    if (!rating || isRating) return;

    setIsRating(true);
    try {
      const response = await submitChatRating({
        sessionId,
        rating,
        ratingComment: ratingComment.trim(),
      });
      setSessionRating(response.rating);
      setRatingComment(response.ratingComment || '');
    } catch (error) {
      setLiveMessages((current) => [
        ...current,
        {
          sender: 'system',
          content: error.message || 'Unable to save your rating right now.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsRating(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-5 sm:right-5">
      {isOpen && (
        <section
          className="mb-4 flex h-[min(650px,calc(100vh-6rem))] w-[calc(100vw-2rem)] max-w-[430px] flex-col overflow-hidden rounded-2xl border border-[#E7D9D0] bg-[#FFF9F5] shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
          aria-label="AI-Solutions support"
        >
          <div className="border-b border-[#E7D9D0] bg-white px-5 pb-3 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#E95520]/10 p-2.5 text-[#E95520]">
                  {mode === 'faq' ? <Bot className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#17110E]">AI-Solutions Support</h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#8F847D]">
                    {mode === 'live' ? (
                      <>
                        <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {!isConnected
                          ? 'Connecting to support'
                          : supportOnline
                            ? 'Support is online'
                            : 'Support is currently offline'}
                      </>
                    ) : (
                      'Instant rule-based answers'
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-[#968A82] transition-colors hover:bg-[#E95520]/10 hover:text-[#E95520] focus:outline-none focus:ring-2 focus:ring-[#E95520]/20"
                aria-label="Close support"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 rounded-xl bg-[#F3ECE7] p-1">
              <button
                type="button"
                onClick={() => setMode('faq')}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  mode === 'faq' ? 'bg-white text-[#E95520] shadow-sm' : 'text-[#746C67] hover:text-[#17110E]'
                }`}
              >
                <Bot className="h-4 w-4" />
                FAQ Assistant
              </button>
              <button
                type="button"
                onClick={() => setMode('live')}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  mode === 'live' ? 'bg-white text-[#E95520] shadow-sm' : 'text-[#746C67] hover:text-[#17110E]'
                }`}
              >
                <Headphones className="h-4 w-4" />
                Live Support
              </button>
            </div>
          </div>

          {mode === 'live' && !sessionId ? (
            <div className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E95520]/10 text-[#E95520]">
                <UserRound className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-center text-lg font-semibold text-[#17110E]">Start a live conversation</h3>
              <p className="mx-auto mt-2 max-w-xs text-center text-sm leading-relaxed text-[#746C67]">
                Tell us who you are so the admin can identify your conversation and reply in real time.
              </p>
              <form onSubmit={handleStartLive} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="support-name" className="text-xs font-semibold text-[#4E443E]">Your name</label>
                  <input
                    id="support-name"
                    value={profileForm.customerName}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, customerName: event.target.value }))
                    }
                    required
                    maxLength="100"
                    placeholder="Enter your name"
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#DDCEC5] bg-white px-4 text-sm text-[#17110E] outline-none placeholder:text-[#A89D96] focus:border-[#E95520] focus:ring-2 focus:ring-[#E95520]/15"
                  />
                </div>
                <div>
                  <label htmlFor="support-email" className="text-xs font-semibold text-[#4E443E]">Email address</label>
                  <input
                    id="support-email"
                    type="email"
                    value={profileForm.customerEmail}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, customerEmail: event.target.value }))
                    }
                    required
                    placeholder="you@example.com"
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#DDCEC5] bg-white px-4 text-sm text-[#17110E] outline-none placeholder:text-[#A89D96] focus:border-[#E95520] focus:ring-2 focus:ring-[#E95520]/15"
                  />
                </div>
                <Button type="submit" isLoading={isStarting} className="w-full">
                  <MessageCircle className="h-4 w-4" />
                  Start Live Chat
                </Button>
              </form>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#F7F0EB] px-5 py-4">
                {mode === 'live' && (
                  <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-[#E7D9D0] bg-white/80 px-3 py-1 text-[11px] text-[#746C67]">
                    {isConnected ? <Wifi className="h-3 w-3 text-emerald-500" /> : <WifiOff className="h-3 w-3 text-amber-500" />}
                    {profile.customerName || 'Live conversation'}
                  </div>
                )}

                {messages.map((item, index) => {
                  const isUser = item.sender === 'user' || item.sender === 'customer';
                  const isSystem = item.sender === 'system';

                  if (isSystem) {
                    return (
                      <div
                        key={item._id || `system-${item.createdAt || index}`}
                        className="mx-auto max-w-[94%] rounded-xl border border-[#E7D9D0] bg-white/80 px-4 py-3 text-center text-xs leading-relaxed text-[#625952]"
                      >
                        <p>{item.content}</p>
                        {item.actionHref && (
                          <Link
                            to={item.actionHref}
                            onClick={() => setIsOpen(false)}
                            className="mt-3 inline-flex rounded-lg bg-[#E95520] px-3 py-2 font-semibold text-white transition-colors hover:bg-[#C94316]"
                          >
                            {item.actionLabel || 'Open Contact Form'}
                          </Link>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item._id || `${item.sender}-${item.createdAt || index}`}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                          isUser
                            ? 'rounded-br-md bg-[#E95520] text-white'
                            : 'rounded-bl-md border border-[#E7D9D0] bg-white text-[#3B322D]'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{item.content}</p>
                        {mode === 'live' && item.createdAt && (
                          <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                            isUser ? 'text-orange-100' : 'text-[#A89D96]'
                          }`}>
                            {formatTime(item.createdAt)}
                            {isUser && <CheckCheck className="h-3 w-3" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md border border-[#E7D9D0] bg-white px-4 py-2.5 text-sm text-[#746C67]">
                      {mode === 'faq' ? 'Thinking...' : 'Sending...'}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {mode === 'faq' && (
                <div className="border-t border-[#E7D9D0] bg-white px-4 pt-3">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {quickQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => submitMessage(question)}
                        className="shrink-0 rounded-full border border-[#E7D9D0] bg-[#FFF9F5] px-3 py-1.5 text-xs font-medium text-[#625952] transition-colors hover:border-[#E95520]/35 hover:bg-[#E95520]/10 hover:text-[#E95520]"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-[#E7D9D0] bg-white p-4">
                {mode === 'live' && sessionStatus === 'closed' ? (
                  sessionRating ? (
                    <div className="text-center">
                      <div className="flex justify-center gap-1 text-[#E95520]">
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star
                            key={index}
                            className={`h-5 w-5 ${
                              index < sessionRating ? 'fill-current' : 'text-[#D8CBC3]'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-[#3B322D]">
                        Thank you for rating our support.
                      </p>
                      {ratingComment && (
                        <p className="mt-1 text-xs leading-relaxed text-[#746C67]">{ratingComment}</p>
                      )}
                      <button
                        type="button"
                        onClick={startNewConversation}
                        className="mt-3 text-xs font-semibold text-[#E95520] hover:text-[#C94316]"
                      >
                        Start a new conversation
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleRatingSubmit}>
                      <p className="text-center text-sm font-semibold text-[#3B322D]">
                        How was your support experience?
                      </p>
                      <div className="mt-3 flex justify-center gap-2">
                        {Array.from({ length: 5 }, (_, index) => {
                          const value = index + 1;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setRating(value)}
                              className="rounded-lg p-1 text-[#D8CBC3] transition-colors hover:text-[#E95520] focus:outline-none focus:ring-2 focus:ring-[#E95520]/20"
                              aria-label={`Rate ${value} out of 5`}
                            >
                              <Star
                                className={`h-7 w-7 ${
                                  value <= rating ? 'fill-[#E95520] text-[#E95520]' : ''
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <textarea
                        value={ratingComment}
                        onChange={(event) => setRatingComment(event.target.value)}
                        maxLength="500"
                        rows="2"
                        placeholder="Optional feedback"
                        className="mt-3 w-full resize-none rounded-xl border border-[#DDCEC5] bg-[#FFF9F5] px-3 py-2 text-xs text-[#17110E] outline-none placeholder:text-[#A89D96] focus:border-[#E95520] focus:ring-2 focus:ring-[#E95520]/15"
                      />
                      <div className="mt-3 flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={startNewConversation}
                          className="text-xs font-medium text-[#746C67] hover:text-[#17110E]"
                        >
                          Skip
                        </button>
                        <Button type="submit" size="sm" isLoading={isRating} disabled={!rating}>
                          Submit Rating
                        </Button>
                      </div>
                    </form>
                  )
                ) : (
                  <form
                    className="flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      submitMessage();
                    }}
                  >
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder={mode === 'faq' ? 'Ask a question' : 'Type a message'}
                      className="h-11 w-full rounded-xl border border-[#DDCEC5] bg-[#FFF9F5] px-4 text-sm text-[#17110E] outline-none placeholder:text-[#A89D96] focus:border-[#E95520] focus:ring-2 focus:ring-[#E95520]/15"
                      aria-label="Support message"
                    />
                    <Button type="submit" size="icon" disabled={!canSend} aria-label="Send message">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                )}
              </div>
            </>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={isOpen ? () => setIsOpen(false) : openWidget}
        className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#E95520] text-white shadow-[0_16px_36px_rgba(233,85,32,0.32)] transition-all hover:-translate-y-0.5 hover:bg-[#C94316] focus:outline-none focus:ring-2 focus:ring-[#E95520]/25 focus:ring-offset-2 focus:ring-offset-black"
        aria-label={isOpen ? 'Close support' : 'Open support'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6" />}
        {!isOpen && sessionId && sessionStatus === 'active' && (
          <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-black bg-emerald-400" />
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;
